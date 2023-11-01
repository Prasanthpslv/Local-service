import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { TextInput, Button, Card, Title, Modal, Portal, RadioButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import api from '../api';

const ManageOrdersScreen = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editedOrder, setEditedOrder] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsRefreshing(true);
        try {
            const response = await api.get('/orders/');
            const result = response.data.reverse() || []
            setOrders(result);
            applyFilters(searchQuery, result, statusFilter);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsRefreshing(false);
            setIsLoading(false);
        }
    };

    const applyFilters = (query, data, status) => {
        let filteredData = data;

        if (status !== 'All') {
            filteredData = filteredData.filter((order) => order.status === status);
        }

        if (query.trim() !== '') {
            filteredData = filteredData.filter((order) =>
                order._id.toLowerCase().includes(query.toLowerCase())
            );
        }

        setFilteredOrders(filteredData);
    };

    useEffect(() => {
        applyFilters(searchQuery, orders, statusFilter);
    }, [searchQuery, orders, statusFilter]);

    const handleSearch = () => {
        applyFilters(searchQuery, orders, statusFilter);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleEditOrder = (order) => {
        setIsModalVisible(true);
        setEditedOrder(order);
    };

    const handleCancelEdit = () => {
        setIsModalVisible(false);
        setEditedOrder({});
    };

    const handleSaveEdit = async () => {
        setIsLoading(true);
        try {
            await api.put(`/orders/${editedOrder._id}`, editedOrder);
            setIsModalVisible(false);
            fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteOrder = async (_id) => {
        try {
            Alert.alert(
                'Confirm Delete',
                'Are you sure you want to delete this order?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteOrder(_id) },
                ],
            );
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    const deleteOrder = async (_id) => {
        try {
            await api.delete(`/orders/${_id}`);
            fetchOrders();
        } catch (error) {
            console.error('Error deleting order:', error);
        }
    };

    const statusOptions = ['Processing', 'Request Confirmed', 'On The Way', 'Service Completed'];

    const renderOrderCard = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <Title>Order ID: {item._id}</Title>
                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Customer:</Text>
                        <Text style={styles.detailValue}>{item.name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total Price:</Text>
                        <Text style={styles.detailValue}>₹{item.totalPrice.toFixed(2)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Phone:</Text>
                        <Text style={styles.detailValue}>{item.phone}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Status:</Text>
                        <Text style={styles.detailValue}>{item.status}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Payment Mode:</Text>
                        <Text style={styles.detailValue}>{item.paymentMode}</Text>
                    </View>
                </View>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
                <Button onPress={() => handleEditOrder(item)} buttonColor="#deac47" textColor='white'>
                    Edit
                </Button>
                <Button onPress={() => handleDeleteOrder(item._id)} buttonColor="red">
                    Delete
                </Button>
            </Card.Actions>
        </Card>
    );

    const renderEditModal = () => (
        <Modal visible={isModalVisible} onDismiss={handleCancelEdit}>
            <Card style={styles.modalCard}>
                <Card.Title title="Status" />
                <Card.Content style={styles.modalCardContent}>
                    <RadioButton.Group
                        onValueChange={(itemValue) => setEditedOrder({ ...editedOrder, status: itemValue })}
                        value={editedOrder.status}
                    >
                        {statusOptions.map((option) => (
                            <View style={styles.radioButtonContainer} key={option}>
                                <RadioButton
                                    color="#deac47"
                                    value={option} />
                                <Text>{option}</Text>
                            </View>
                        ))}
                    </RadioButton.Group>
                </Card.Content>
                <Card.Actions style={styles.modalCardActions}>
                    <Button onPress={handleCancelEdit} textColor='black'>
                        Cancel
                    </Button>
                    <Button onPress={handleSaveEdit} buttonColor="#deac47" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                </Card.Actions>
            </Card>
        </Modal>
    );

    const handleRefresh = () => {
        fetchOrders();
    };

    const renderEmptyList = () => (
        <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>No data available.</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={statusFilter}
                        onValueChange={(itemValue) => setStatusFilter(itemValue)}
                        style={styles.picker}
                    >
                        {['All', ...statusOptions].map((item, index) => (<Picker.Item key={index} label={item} value={item} />))}
                    </Picker>
                </View>
                <TextInput
                    label="Search Orders"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                />
                <Button onPress={handleClearSearch} textColor='#deac47'>
                    Clear
                </Button>
            </View>
            {isLoading ? (
                <ActivityIndicator size="large" color="#deac47" style={styles.loader} />
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrderCard}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.flatListContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={['#deac47']}
                            progressBackgroundColor="#fff"
                        />
                    }
                    ListEmptyComponent={renderEmptyList}
                />
            )}

            <Portal>
                {renderEditModal()}
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f9f9f9',
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    pickerContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#deac47',
        borderRadius: 4,
        overflow: 'hidden',
    },
    picker: {
        height: 40,
        backgroundColor: '#fff',
    },
    searchInput: {
        flex: 1,
        marginRight: 8,
        backgroundColor: '#fff',
    },
    flatListContent: {
        paddingBottom: 80, // To accommodate the modal
    },
    card: {
        marginBottom: 16,
        borderRadius: 8,
        elevation: 4, // Add elevation for shadow effect
        backgroundColor: '#fff', // Add a background color for the card
    },
    detailsContainer: {
        marginTop: 12,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    detailLabel: {
        flex: 1,
        fontWeight: 'bold',
    },
    detailValue: {
        flex: 2,
    },
    cardActions: {
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    modalCard: {
        margin: 16,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
    },
    modalCardActions: {
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalCardContent: {
        paddingTop: 8,
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyListText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'gray',
    },
});

export default ManageOrdersScreen;
