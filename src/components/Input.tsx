import React from 'react';
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import { FontAwesome } from '@expo/vector-icons';

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
    maxLength?: number;
    multiline?: boolean;
    numberOfLines?: number;
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
    maxLength,
    multiline = false,
    numberOfLines = 1,
}) => {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <View style={[
                styles.inputWrapper, 
                { 
                    backgroundColor: theme.inputBackground, 
                    borderColor: error ? theme.error : theme.border 
                }, 
                multiline && styles.multilineWrapper,
                style
            ]}>
                <TextInput
                    style={[
                        styles.input, 
                        { color: theme.text },
                        multiline && styles.multilineInput
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    secureTextEntry={secureTextEntry}
                    placeholderTextColor={theme.placeholder}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={autoCorrect}
                    keyboardType={keyboardType}
                    editable={editable}
                    maxLength={maxLength}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    textAlignVertical={multiline ? 'top' : 'center'}
                />
                {rightIcon && !multiline ? (
                    <TouchableOpacity 
                        accessibilityRole='button' 
                        onPress={onRightIconPress} 
                        style={styles.rightIconHit}
                    >
                        <FontAwesome 
                            name={rightIcon === 'eye' ? "eye" : "eye-slash"} 
                            size={18} 
                            color={theme.primary} 
                        />
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
    multilineWrapper: {
        alignItems: 'flex-start',
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    multilineInput: {
        minHeight: 100,
        paddingTop: 12,
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
