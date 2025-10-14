import { StatusBar } from 'expo-status-bar';
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/utils/AuthContext';
import { ThemeProvider, useTheme } from './src/utils/ThemeContext';

const AppContent: React.FC = () => {
    const { isDark } = useTheme();

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
                <AppContent />
            </AuthProvider>
        </ThemeProvider>
    );
}
