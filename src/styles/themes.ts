export interface Theme {
    primary: string;
    primaryDark: string;
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
}

export const lightTheme: Theme = {
    primary: '#24c4f0ff',
    primaryDark: '#0056CC',
    background: '#111010ff',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#24c4f0ff',
    textSecondary: '#8E8E93',
    placeholder: '#C7C7CC',
    border: '#E5E5EA',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    inputBackground: '#FFFFFF',
};

export const darkTheme: Theme = {
    primary: '#0A84FF',
    primaryDark: '#0066CC',
    background: '#000000',
    surface: '#1C1C1E',
    card: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    placeholder: '#48484A',
    border: '#38383A',
    error: '#FF453A',
    success: '#30D158',
    warning: '#FF9F0A',
    inputBackground: '#1C1C1E',
};