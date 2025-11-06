import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Locador {
    id: number;
    nome: string;
    email: string;
    telefone?: string;
    foto?: string;
}

interface LocadorContextData {
    locador: Locador | null;
    token: string | null;
    loading: boolean;
    setLocador: (locador: Locador | null) => Promise<void>;
    setToken: (token: string | null) => Promise<void>;
    logout: () => Promise<void>;
}

const LocadorContext = createContext<LocadorContextData>({} as LocadorContextData);

export const LocadorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locador, setLocadorState] = useState<Locador | null>(null);
    const [token, setTokenState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStoredData();
    }, []);

    const loadStoredData = async () => {
        try {
            const storedLocador = await AsyncStorage.getItem('locador');
            const storedToken = await AsyncStorage.getItem('locadorToken');

            if (storedLocador) {
                setLocadorState(JSON.parse(storedLocador));
            }
            if (storedToken) {
                setTokenState(storedToken);
            }
        } catch (error) {
            console.error('Erro ao carregar dados do locador:', error);
        } finally {
            setLoading(false);
        }
    };

    const setLocador = async (locadorData: Locador | null) => {
        try {
            if (locadorData) {
                await AsyncStorage.setItem('locador', JSON.stringify(locadorData));
                setLocadorState(locadorData);
            } else {
                await AsyncStorage.removeItem('locador');
                setLocadorState(null);
            }
        } catch (error) {
            console.error('Erro ao salvar locador:', error);
        }
    };

    const setToken = async (tokenData: string | null) => {
        try {
            if (tokenData) {
                await AsyncStorage.setItem('locadorToken', tokenData);
                setTokenState(tokenData);
            } else {
                await AsyncStorage.removeItem('locadorToken');
                setTokenState(null);
            }
        } catch (error) {
            console.error('Erro ao salvar token do locador:', error);
        }
    };

    const logout = async () => {
        try {
            // Limpar TODO o cache do AsyncStorage relacionado ao locador
            await AsyncStorage.multiRemove([
                'locador',
                'locadorToken',
                'locadorRefreshToken',
            ]);
            setLocadorState(null);
            setTokenState(null);
            
            console.log('✅ Cache do locador limpo completamente no logout');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            // Mesmo com erro, limpa dados locais
            setLocadorState(null);
            setTokenState(null);
        }
    };

    return (
        <LocadorContext.Provider
            value={{
                locador,
                token,
                loading,
                setLocador,
                setToken,
                logout,
            }}
        >
            {children}
        </LocadorContext.Provider>
    );
};

export const useLocador = () => {
    const context = useContext(LocadorContext);
    if (!context) {
        throw new Error('useLocador deve ser usado dentro de um LocadorProvider');
    }
    return context;
};
