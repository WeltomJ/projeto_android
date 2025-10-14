import { NavigationContainer, DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useAuth } from '../utils/AuthContext';
import { useTheme } from '../utils/ThemeContext';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
    const { isDark } = useTheme();
    const { user, hydrated } = useAuth();
    return (
        <NavigationContainer theme={isDark ? NavigationDarkTheme : NavigationLightTheme}>
            {!hydrated ? null : user ? (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Settings" component={SettingsScreen} />
                    <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
                </Stack.Navigator>
            ) : (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </Stack.Navigator>
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;