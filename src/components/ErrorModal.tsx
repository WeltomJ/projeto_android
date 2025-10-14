import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../utils/ThemeContext';

interface ErrorModalProps {
    visible: boolean;
    message: string;
    onClose: () => void;
    title?: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ visible, message, onClose, title = 'Erro' }) => {
    const { theme } = useTheme();
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={[styles.box, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.title, { color: theme.primaryDark }]}>{title}</Text>
                    <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
                    <TouchableOpacity onPress={onClose} style={[styles.button, { backgroundColor: theme.primary }]}>
                        <Text style={styles.buttonText}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    box: { width: '100%', borderRadius: 12, padding: 20, elevation: 5 },
    title: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    message: { fontSize: 15, marginBottom: 20 },
    button: { alignSelf: 'flex-end', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
    buttonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});

export default ErrorModal;
