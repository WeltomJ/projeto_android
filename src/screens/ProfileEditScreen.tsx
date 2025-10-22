import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import Navbar from '../components/Navbar';
import { UsuarioService } from '../services/Usuario.Service';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';

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
                updateData.telefone = telefone.trim();
            }
            
            if (senha.trim()) {
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
            <ScrollView contentContainerStyle={styles.container}>
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
                    onChangeText={setTelefone} 
                    placeholder="Telefone (opcional)" 
                    keyboardType="phone-pad"
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