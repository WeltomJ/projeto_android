import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import HorarioForm from '../components/HorarioForm';
import { useTheme } from '../utils/ThemeContext';

export default function LocadorManageHorariosScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { localId } = route.params as { localId: number };
    const [showModal, setShowModal] = useState(false);

    const handleSave = () => {
        setShowModal(true);
        setTimeout(() => {
            setShowModal(false);
            navigation.goBack();
        }, 2000);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <HorarioForm localId={localId} onSave={handleSave} />

            <Modal
                transparent
                visible={showModal}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>
                            ✅ Sucesso!
                        </Text>
                        <Text style={[styles.modalText, { color: theme.text }]}>
                            Horários salvos com sucesso
                        </Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        borderRadius: 16,
        padding: 24,
        minWidth: 280,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
