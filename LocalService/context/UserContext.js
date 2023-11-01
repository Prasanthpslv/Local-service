import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext({
    userId: null,
    login: () => { },
    logout: () => { },
});

export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Load userId from AsyncStorage on component mount
        loadUserIdFromStorage();
    }, []);

    const loadUserIdFromStorage = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            setUserId(userId);
        } catch (error) {
            console.error('Error loading userId from AsyncStorage:', error);
        }
    };

    const login = async (userId) => {
        try {
            // Save userId to AsyncStorage on login
            await AsyncStorage.setItem('userId', userId);
            setUserId(userId);
        } catch (error) {
            console.error('Error saving userId to AsyncStorage:', error);
        }
    };

    const logout = async () => {
        try {
            // Remove userId from AsyncStorage on logout
            await AsyncStorage.removeItem('userId');
            setUserId(null);
        } catch (error) {
            console.error('Error removing userId from AsyncStorage:', error);
        }
    };

    return (
        <UserContext.Provider value={{ userId, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
