import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StatusBar } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import MapsScreen from '../screens/MapsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileEditScreen from '../screens/ProfileEditScreen';
import FavoritesScreen from '../screens/FavoritesScreen';

// Telas do Locador
import LocadorLoginScreen from '../screens/LocadorLoginScreen';
import LocadorRegisterScreen from '../screens/LocadorRegisterScreen';
import LocadorHomeScreen from '../screens/LocadorHomeScreen';
import LocadorEditProfileScreen from '../screens/LocadorEditProfileScreen';
import LocadorAddLocalScreen from '../screens/LocadorAddLocalScreen';
import LocadorEditLocalScreen from '../screens/LocadorEditLocalScreen';
import LocalDetailsScreen from '../screens/LocalDetailsScreen';

import { useAuth } from '../utils/AuthContext';
import { useLocador } from '../utils/LocadorContext';
import { useTheme } from '../utils/ThemeContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.surface,
                    borderTopColor: theme.border,
                    borderTopWidth: 1,
                    paddingBottom: 8,
                    paddingTop: 5,
                    height: 70,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textSecondary,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 0,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Início',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Maps"
                component={MapsScreen}
                options={{
                    tabBarLabel: 'Mapas',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="map" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Favorites"
                component={FavoritesScreen}
                options={{
                    tabBarLabel: 'Favoritos',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="heart" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Perfil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const AppNavigator: React.FC = () => {
    const { user, hydrated } = useAuth();
    const { locador, loading: locadorLoading } = useLocador();
    const { theme, isDark } = useTheme();

    if (!hydrated || locadorLoading) {
        return null;
    }

    return (
        <NavigationContainer>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={theme.background}
            />
            <View style={{ flex: 1, backgroundColor: theme.background }}>
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        cardStyle: { backgroundColor: theme.background },
                    }}
                >
                    {user ? (
                        <>
                            <Stack.Screen name="MainTabs" component={MainTabs} />
                            <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
                            <Stack.Screen name="LocalDetails" component={LocalDetailsScreen} />
                        </>
                    ) : locador ? (
                        <>
                            <Stack.Screen name="LocadorHome" component={LocadorHomeScreen} />
                            <Stack.Screen name="LocadorEditProfile" component={LocadorEditProfileScreen} />
                            <Stack.Screen name="LocadorAddLocal" component={LocadorAddLocalScreen} />
                            <Stack.Screen name="LocadorEditLocal" component={LocadorEditLocalScreen} />
                        </>
                    ) : (
                        <>
                            <Stack.Screen name="Welcome" component={WelcomeScreen} />
                            <Stack.Screen name="Login" component={LoginScreen} />
                            <Stack.Screen name="Register" component={RegisterScreen} />
                            
                            {/* Rotas do Locador */}
                            <Stack.Screen name="LocadorLogin" component={LocadorLoginScreen} />
                            <Stack.Screen name="LocadorRegister" component={LocadorRegisterScreen} />
                        </>
                    )}
                </Stack.Navigator>
            </View>
        </NavigationContainer>
    );
};

export default AppNavigator;