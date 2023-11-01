import React, { useState, useContext, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    ScrollView,
    Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../api';
import Toast from 'react-native-toast-message';
import SpinnerOverlay from 'react-native-loading-spinner-overlay';
import UserContext from '../context/UserContext';

const AuthScreen = React.forwardRef(({ navigation }, ref) => {
    const [email, setEmail] = useState('');
    const { login } = useContext(UserContext);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // State to control the loader
    const [isRegisterMode, setIsRegisterMode] = useState(false);

    const passwordInputRef = useRef(null);

    const showToast = (type, text1, text2) => {
        Toast.show({
            type,
            text1,
            text2,
            position: 'top',
        });
    };

    const handleAuthAction = async () => {
        setLoading(true); // Show the loader while authentication process is in progress

        try {
            if (email !== '' && password !== '') {
                if (isRegisterMode) {
                    await api.post('/register', { email, password });
                    console.log('User registered successfully');
                    showToast('success', 'Registration Success', 'User registered successfully.');
                    // Clear field data after successful registration
                    setEmail('');
                    setPassword('');
                } else {
                    const response = await api.post('/login', { email, password });
                    const { userId } = response.data;
                    login(userId);
                }
            }
        } catch (error) {
            console.error(
                'Error during authentication:',
                error.response?.data?.message || error.message
            );
            showToast(
                'error',
                isRegisterMode ? 'Registration Failed' : 'Login Failed',
                isRegisterMode
                    ? 'Email already registered or something went wrong.'
                    : 'Invalid credentials. Please try again.'
            );
        } finally {
            setLoading(false); // Hide the loader after authentication process is complete
        }
    };

    const handleKeyboardDismiss = () => {
        Keyboard.dismiss();
    };

    const handlePasswordInputSubmit = () => {
        handleAuthAction();
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior="height">
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <MaterialCommunityIcons name="face-agent" size={64} color="#deac47" />
                <Text style={styles.title}>ServiceHub</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#777"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#777"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    onSubmitEditing={handlePasswordInputSubmit}
                    autoCapitalize="none"
                />
                <TouchableOpacity style={styles.button} onPress={handleAuthAction}>
                    <Text style={styles.buttonText}>
                        {isRegisterMode ? 'Register' : 'Login'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setIsRegisterMode((prevMode) => !prevMode)}
                >
                    <Text style={styles.toggleButtonText}>
                        {isRegisterMode ? 'Already have an account? Login' : 'New user? Register'}
                    </Text>
                </TouchableOpacity>
                <Toast ref={ref} />
                <SpinnerOverlay
                    visible={loading}
                    textContent={'Loading...'}
                    textStyle={{ color: '#FFF' }}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    contentContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 20,
        color: '#deac47',
    },
    input: {
        width: '80%',
        height: 48,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginVertical: 8,
        color: '#333',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#deac47',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 8,
        marginVertical: 8,
        width: '80%',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
    },
    toggleButton: {
        paddingVertical: 16,
        marginVertical: 8,
    },
    toggleButtonText: {
        color: '#deac47',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default AuthScreen;
