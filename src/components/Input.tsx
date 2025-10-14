import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from 'react';
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../utils/ThemeContext';

interface InputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    error?: string;
    rightIcon?: 'eye' | 'eye-slash';
    onRightIconPress?: () => void;
    style?: any;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoCorrect?: boolean;
    keyboardType?: KeyboardTypeOptions;
    editable?: boolean;
}

const Input: React.FC<InputProps> = ({ 
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    error,
    rightIcon,
    onRightIconPress,
    style,
    autoCapitalize = 'none',
    autoCorrect = false,
    keyboardType = 'default',
    editable = true,
}) => {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: error ? theme.error : theme.border }, style]}>
                <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    secureTextEntry={secureTextEntry}
                    placeholderTextColor={theme.placeholder}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    keyboardType={keyboardType}
                    editable={editable}
                />
                {rightIcon ? (
                    <TouchableOpacity accessibilityRole='button' onPress={onRightIconPress} style={styles.rightIconHit}>
                        <FontAwesomeIcon icon={rightIcon === 'eye' ? "eye" : "eye-slash"} size={18} color={theme.primary} />
                    </TouchableOpacity>
                ) : null}
            </View>
            {error ? <Text style={[styles.error, { color: theme.error }]}>{error}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    inputWrapper: {
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    rightIconHit: {
        paddingLeft: 8,
        paddingVertical: 8,
    },
    error: {
        fontSize: 13,
        marginTop: 4,
        marginLeft: 2,
    },
});

export default Input;
