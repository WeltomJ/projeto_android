import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/utils/AuthContext';
import { LocadorProvider } from './src/utils/LocadorContext';
import { ThemeProvider, useTheme } from './src/utils/ThemeContext';
import { GoogleAuthService } from './src/services/GoogleAuth.Service';

const AppContent: React.FC = () => {
    const { isDark } = useTheme();

    useEffect(() => {
        GoogleAuthService.configure();
    }, []);

    return (
        <>
            <AppNavigator />
            <StatusBar style={isDark ? 'light' : 'dark'} />
        </>
    );
};

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <LocadorProvider>
                    <AppContent />
                </LocadorProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
