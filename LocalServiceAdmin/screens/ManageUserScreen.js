import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput as RNTextInput } from 'react-native';
import { Button, Card, Title, Modal, Portal, Provider, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../api';

const DEFAULT_EDITED_USER = {
    email: '',
    password: '',
};

const ManageUserScreen = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editedUser, setEditedUser] = useState(DEFAULT_EDITED_USER);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Fetch all users from the backend API
        fetchUsers();
    }, []);

    useEffect(() => {
        // Set filtered users to all users initially
        setFilteredUsers(users);
    }, [users]);

    useEffect(() => {
        // Filter users based on the search query
        if (searchQuery.trim() === '') {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter((user) =>
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchQuery, users]);

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            await api.get('/allUsers').then(response => {
                if (response) {
                    setUsers(response.data);
                    setIsLoading(false)
                }
            });

        } catch (error) {
            console.error('Error fetching users:', error);
            setIsLoading(false)
        } finally {
            setIsLoading(false)
        }
    };

    const handleEditUser = (user) => {
        setEditedUser(user);
        setIsModalVisible(true);
    };

    const handleDeleteUser = async (userId) => {
        try {
            Alert.alert(
                'Confirm Delete',
                'Are you sure you want to delete this user?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteUser(userId) },
                ],
            );
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const deleteUser = async (userId) => {
        setIsLoading(true);
        try {
            await api.delete(`/users/${userId}`).then(response => {
                if (response) {
                    fetchUsers();
                }
                else {
                    setIsLoading(false);
                }
            });
            // Refresh the users list after successful deletion

        } catch (error) {
            console.error('Error deleting user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        // Show the loader during the refresh
        setIsLoading(true);
        try {
            // Fetch all users from the backend API
            await fetchUsers();
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            // Hide the loader after the refresh
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setEditedUser(DEFAULT_EDITED_USER);
        setIsModalVisible(false);
    };

    const handleSaveUser = async () => {
        const request = {
            email: editedUser.email,
            password: editedUser.password,
        };

        try {
            setIsLoading(true);
            await api.put(`/users/${editedUser._id}`, request).then(response => {
                if (response) {
                    fetchUsers();
                    setIsModalVisible(false);
                }
            });
            // Refresh the users list after successful update

        } catch (error) {
            console.error('Error saving user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const renderUserCard = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <Title style={styles.cardTitle}>ID: {item._id}</Title>
                <Text style={styles.cardText}>Email: {item.email}</Text>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
                <Button onPress={() => handleEditUser(item)} mode="contained" style={styles.editButton}>
                    Edit
                </Button>
                <Button onPress={() => handleDeleteUser(item._id)} mode="contained" color="red" style={styles.deleteButton}>
                    Delete
                </Button>
            </Card.Actions>
        </Card>
    );

    return (
        <Provider>
            <View style={styles.container}>
                <View style={styles.searchContainer}>
                    <RNTextInput
                        placeholder="Search by Email"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchInput}
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
                            <MaterialCommunityIcons name="close-circle-outline" size={20} color="#888" />
                        </TouchableOpacity>
                    )}
                </View>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#deac47" style={styles.loader} />
                ) : (
                    <FlatList
                        data={filteredUsers}
                        renderItem={renderUserCard}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.flatListContent}
                        refreshing={isLoading}
                        onRefresh={handleRefresh}
                    />
                )}

                <Portal>
                    <Modal visible={isModalVisible} onDismiss={handleCloseModal} contentContainerStyle={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Edit User</Text>
                            <TextInput
                                label="Email"
                                placeholder="Enter Email"
                                value={editedUser.email}
                                onChangeText={(text) => setEditedUser({ ...editedUser, email: text })}
                                style={styles.input}
                            />
                            <TextInput
                                label="Password"
                                placeholder="Enter Password"
                                onChangeText={(text) => setEditedUser({ ...editedUser, password: text })}
                                style={styles.input}
                            />
                            <View style={styles.modalFoter}>
                                <Button mode="contained" onPress={handleCloseModal} textColor='black' style={styles.cancelButton}>
                                    Cancel
                                </Button>
                                <Button mode="contained" onPress={handleSaveUser} style={styles.saveButton}>
                                    Save
                                </Button>
                            </View>
                            {isLoading && <ActivityIndicator size="large" color="#deac47" style={styles.loader} />}
                        </View>
                    </Modal>
                </Portal>
            </View>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f9f9f9',
    },
    flatListContent: {
        paddingBottom: 20,
    },
    card: {
        marginVertical: 5,
        marginHorizontal: 10,
        padding: 15,
        borderRadius: 8,
        elevation: 3,
        backgroundColor: '#fff',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardText: {
        fontSize: 16,
        marginTop: 5,
    },
    cardActions: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 12,
        paddingTop: 8,
        justifyContent: 'flex-end',
    },
    editButton: {
        backgroundColor: '#deac47',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginRight: 8,
    },
    deleteButton: {
        backgroundColor: 'red',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
    },
    modalContent: {
        paddingHorizontal: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    modalFoter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
    cancelButton: {
        marginRight: 10,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ccc',

    },
    saveButton: {
        backgroundColor: '#deac47',
        borderRadius: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    clearButton: {
        padding: 8,
    },
    loader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -25 }, { translateY: -25 }],
        zIndex: 1,
    },
});

export default ManageUserScreen;
