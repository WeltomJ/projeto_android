import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import api from './api.config';

const GOOGLE_WEB_CLIENT_ID = '433229609737-mofdd28qveb0jmg09s4sp5b8s19imqjk.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '433229609737-2khesg7144gibvbqthmk5vn56k174iqq.apps.googleusercontent.com';

export const GoogleAuthService = {
    configure: () => {
        GoogleSignin.configure({
            webClientId: GOOGLE_WEB_CLIENT_ID,
            iosClientId: GOOGLE_IOS_CLIENT_ID,
            offlineAccess: true,
        });
    },

    signIn: async (tipo: 'usuario' | 'locador' = 'usuario') => {
        try {
            if (Platform.OS === 'android') {
                await GoogleSignin.hasPlayServices();
            }

            const userInfo = await GoogleSignin.signIn();
            const tokens = await GoogleSignin.getTokens();
            const idToken = tokens.idToken;

            if (!idToken) {
                throw new Error('Não foi possível obter o token do Google');
            }

            const response = await api.post('/auth/google', {
                idToken,
                tipo,
            });

            return response.data;
        } catch (error: any) {
            console.error('Erro no login com Google:', error);
            throw error;
        }
    },

    signOut: async () => {
        try {
            await GoogleSignin.signOut();
        } catch (error) {
            console.error('Erro ao fazer logout do Google:', error);
        }
    },

    getCurrentUser: async () => {
        try {
            return await GoogleSignin.getCurrentUser();
        } catch (error) {
            console.error('Erro ao obter usuário atual:', error);
            return null;
        }
    },
};
