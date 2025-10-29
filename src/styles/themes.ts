export interface Theme {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    placeholder: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    inputBackground: string;
    shadow: string;
    white: string;
    black: string;
    overlay: string;
}

export const lightTheme: Theme = {
    primary: '#1F618D',
    primaryDark: '#0056CC',
    primaryLight: '#4DA2FF',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#1F618D',
    textSecondary: '#8E8E93',
    placeholder: '#C7C7CC',
    border: '#E5E5EA',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    inputBackground: '#FFFFFF',
    shadow: '#000000',
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(0, 0, 0, 0.45)',
};

export const darkTheme: Theme = {
    primary: '#4f9cd0ff',
    primaryDark: '#0066CC',
    primaryLight: '#409CFF',
    background: '#000000',
    surface: '#1C1C1E',
    card: '#2C2C2E',
    text: '#4f9cd0ff',
    textSecondary: '#8E8E93',
    placeholder: '#48484A',
    border: '#38383A',
    error: '#FF453A',
    success: '#30D158',
    warning: '#FF9F0A',
    inputBackground: '#1C1C1E',
    shadow: '#000000',
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
};