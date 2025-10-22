import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage, { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { UsuarioService, Usuario, CreateUsuarioDto, LoginResponse } from '../services/Usuario.Service';

interface LoginCredentials {
    email: string;
    senha: string;
}

interface AuthContextData {
    user: Usuario | null;
    loading: boolean;
    hydrated: boolean;
    signIn: (credentials: LoginCredentials) => Promise<void>;
    signUp: (data: CreateUsuarioDto) => Promise<void>;
    signOut: () => Promise<void>;
    logout: () => Promise<void>;
    updateUserLocal: (user: Usuario) => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        loadStoredUser();
    }, []);

    const loadStoredUser = async () => {
        try {
            const storedUser = await UsuarioService.obterUsuarioLogado();
            const token = await AsyncStorage.getItem('accessToken');
            
            if (storedUser && token) {
                setUser(storedUser);
            }
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            await signOut();
        } finally {
            setHydrated(true);
        }
    };

    const signIn = async (credentials: LoginCredentials) => {
        try {
            setLoading(true);
            const response: LoginResponse = await UsuarioService.login(credentials.email, credentials.senha);
            setUser(response.user);
            const token = response.accessToken; 
            await AsyncStorage.setItem('acessToken',token);
            setUser(response.user);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (data: CreateUsuarioDto) => {
        try {
            setLoading(true);
            const newUser = await UsuarioService.registrar(data);

            console.log('Usuário registrado com sucesso:', newUser);
            
            // Após registro, faz login automaticamente
            const loginResponse = await UsuarioService.login(data.email, data.senha);
            const {accessToken} = loginResponse;
             await AsyncStorage.setItem ('acessToken', accessToken);
            setUser(loginResponse.user);
        
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            setLoading(true);
            await UsuarioService.logout();
            setUser(null);
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = signOut; // Alias para compatibilidade

    const updateUserLocal = async (updatedUser: Usuario) => {
        setUser(updatedUser);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                hydrated,
                signIn,
                signUp,
                signOut,
                logout,
                updateUserLocal,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};