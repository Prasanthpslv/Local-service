import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import UserContext from '../context/UserContext';
import api from '../api';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(UserContext);

    const handleLogin = async () => {
        try {
            setIsLoading(true);
            // Make an API request to login
            await api.post('/admin/login', { email, password }).then((response) => {
                if (response) {
                    // Save the token in AsyncStorage or any other state management solution
                    const token = response.data.token;
                    login(token);
                }
            });
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Failed to login. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNavigateToRegister = () => {
        navigation.navigate('Register');
    };

    return (
        <View style={styles.container}>
            <MaterialCommunityIcons name="account-circle" size={100} color="#deac47" />
            <Text style={styles.heading}>Admin Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.loginButtonText}>Login</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.registerLink} onPress={handleNavigateToRegister}>
                <Text style={styles.registerLinkText}>Don't have an account? Register here.</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#deac47',
    },
    input: {
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#deac47',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    registerLink: {
        marginTop: 10,
    },
    registerLinkText: {
        color: '#deac47',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
