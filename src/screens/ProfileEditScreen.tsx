import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import Navbar from '../components/Navbar';
import { UsuarioService } from '../services/Usuario.Service';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';

const formatarTelefone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

const ProfileEditScreen: React.FC = () => {
    const { user, updateUserLocal } = useAuth();
    const { theme } = useTheme();
    const [nome, setNome] = useState(user?.nome || '');
    const [senha, setSenha] = useState('');
    const [telefone, setTelefone] = useState(user?.telefone || '');
    const [showSenha, setShowSenha] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        setError('');
        setSuccess('');
        // Resetar campos com dados atuais do usuário
        setNome(user?.nome || '');
        setTelefone(user?.telefone || '');
        setSenha('');
        setTimeout(() => {
            setRefreshing(false);
        }, 500);
    }, [user]);

    const handleSave = async () => {
        setError(''); 
        setSuccess('');
        
        if (!nome.trim()) { 
            setError('Nome obrigatório'); 
            return; 
        }
        
        setLoading(true);
        try {
            const updateData: any = { nome: nome.trim() };
            
            if (telefone.trim()) {
                const cleaned = telefone.replace(/\D/g, '');
                if (cleaned.length >= 10) {
                    updateData.telefone = telefone.trim();
                } else if (cleaned.length > 0) {
                    setError('Telefone inválido. Use o formato (XX) XXXXX-XXXX');
                    return;
                }
            }
            
            if (senha.trim()) {
                if (senha.length < 6) {
                    setError('A senha deve ter no mínimo 6 caracteres');
                    return;
                }
                updateData.senha = senha;
            }

            const updated = await UsuarioService.atualizar(user!.id, updateData);
            await updateUserLocal(updated);
            setSuccess('Dados atualizados com sucesso!');
            setSenha('');
        } catch (e: any) {
            setError(e.message || 'Falha ao salvar dados');
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <Navbar title="Editar Perfil" showBack={true} />
            <ScrollView 
                contentContainerStyle={styles.container}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.primary]}
                        tintColor={theme.primary}
                    />
                }
            >
                <Input 
                    value={user?.email || ''} 
                    onChangeText={() => { }} 
                    placeholder="Email" 
                    editable={false}
                    style={{ opacity: 0.6 }} 
                />
                
                <Input 
                    value={nome} 
                    onChangeText={setNome} 
                    placeholder="Nome completo" 
                />
                
                <Input 
                    value={telefone} 
                    onChangeText={(text) => setTelefone(formatarTelefone(text))} 
                    placeholder="Telefone (opcional)" 
                    keyboardType="phone-pad"
                    maxLength={15}
                />
                
                <Input 
                    value={senha} 
                    onChangeText={setSenha} 
                    placeholder="Nova senha (opcional)" 
                    secureTextEntry={!showSenha} 
                    rightIcon={showSenha ? 'eye-slash' : 'eye'} 
                    onRightIconPress={() => setShowSenha(s => !s)} 
                />
                
                {error ? <Text style={[styles.message, { color: theme.error }]}>{error}</Text> : null}
                {success ? <Text style={[styles.message, { color: theme.primary }]}>{success}</Text> : null}
                
                <Button 
                    title={loading ? 'Salvando...' : 'Salvar Alterações'} 
                    onPress={handleSave} 
                    loading={loading} 
                    disabled={loading}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        padding: 16 
    },
    message: {
        fontSize: 14,
        marginVertical: 8,
        textAlign: 'center'
    }
});

export default ProfileEditScreen;