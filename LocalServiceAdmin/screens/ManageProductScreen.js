import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, Portal, Button, Provider, Card } from 'react-native-paper';
import api from '../api';

const DEFAULT_EDITED_PRODUCT = {
    name: '',
    description: '',
    price: 0,
    quantity: 0,
};

const ManageProductScreen = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editedProduct, setEditedProduct] = useState(DEFAULT_EDITED_PRODUCT);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteAlertVisible, setIsDeleteAlertVisible] = useState(false);
    const [deleteProductId, setDeleteProductId] = useState(null);

    useEffect(() => {
        // Fetch all products from the backend API
        fetchProducts();
    }, []);

    useEffect(() => {
        // Filter products based on the search query
        if (searchQuery.trim() === '') {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter((product) =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredProducts(filtered);
        }
    }, [searchQuery, products]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
            setFilteredProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleCreateProduct = () => {
        // Clear the editedProduct state and open the modal for creating a new product
        setEditedProduct(DEFAULT_EDITED_PRODUCT);
        setIsEditing(false);
        setIsModalVisible(true);
    };

    const handleEditProduct = (product) => {
        setEditedProduct(product);
        setIsEditing(true);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setEditedProduct(DEFAULT_EDITED_PRODUCT);
        setIsModalVisible(false);
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await api.delete(`/products/${productId}`);
            // Refresh the products list after successful deletion
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleRefresh = async () => {
        // Show the loader during the refresh
        setIsLoading(true);
        try {
            // Fetch all products from the backend API
            await fetchProducts();
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            // Hide the loader after the refresh
            setIsLoading(false);
        }
    };

    const handleSaveProduct = async () => {
        const request = {
            description: editedProduct.description,
            imageUrl: editedProduct.imageUrl,
            name: editedProduct.name,
            price: editedProduct.price,
            quantity: editedProduct.quantity,
        };

        try {
            setIsLoading(true);
            if (isEditing) {
                // Make an API request to update the product for edit operation
                await api.put(`/products/${editedProduct._id}`, request);
            } else {
                // Make an API request to create a new product for create operation
                await api.post('/products', request);
            }
            // Refresh the products list after successful update
            fetchProducts();
            setIsModalVisible(false);
            setIsEditing(false);
        } catch (error) {
            console.error('Error saving product:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleShowDeleteAlert = (productId) => {
        setIsDeleteAlertVisible(true);
        setDeleteProductId(productId);
    };

    const handleHideDeleteAlert = () => {
        setIsDeleteAlertVisible(false);
        setDeleteProductId(null);
    };

    const handleConfirmDelete = async () => {
        // Close the delete alert modal
        handleHideDeleteAlert();

        // Delete the product
        if (deleteProductId) {
            try {
                setIsLoading(true);
                await handleDeleteProduct(deleteProductId);
            } catch (error) {
                console.error('Error deleting product:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const renderProductItem = ({ item }) => {
        return (
            <Card style={styles.productCard}>
                <Card.Cover source={{ uri: item.imageUrl }} style={styles.productImage} />
                <Card.Content>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productDescription}>{item.description}</Text>
                </Card.Content>
                <Card.Actions style={styles.productActions}>
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity style={styles.editButton} onPress={() => handleEditProduct(item)}>
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => handleShowDeleteAlert(item._id)}>
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </Card.Actions>
            </Card>
        );
    };

    const renderEmptyList = () => {
        return (
            <View style={styles.emptyListContainer}>
                <Text style={styles.emptyListText}>No data available.</Text>
            </View>
        );
    };

    return (
        <Provider>
            <View style={styles.container}>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
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
                        data={filteredProducts}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.listContainer}
                        refreshing={isLoading}
                        onRefresh={handleRefresh}
                        ListEmptyComponent={renderEmptyList}
                    />
                )}
                <Button mode="contained" onPress={handleCreateProduct} style={styles.addButton}>
                    Add Product
                </Button>

                {/* Delete Product Alert Modal */}
                <Portal>
                    <Modal visible={isDeleteAlertVisible} onDismiss={handleHideDeleteAlert} contentContainerStyle={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.deleteAlertText}>Are you sure you want to delete this product?</Text>
                            <View style={styles.modalFoter}>
                                <Button mode="contained" onPress={handleHideDeleteAlert} style={styles.cancelButton}>
                                    Cancel
                                </Button>
                                <Button mode="contained" onPress={handleConfirmDelete} style={styles.deleteButton}>
                                    Done
                                </Button>
                            </View>
                        </View>
                    </Modal>
                </Portal>

                {/* Save/Edit Product Modal */}
                <Portal>
                    <Modal visible={isModalVisible} onDismiss={handleCloseModal} contentContainerStyle={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <PaperTextInput
                                label="Product Image URL"
                                placeholder="Enter Product Image URL"
                                value={editedProduct.imageUrl}
                                onChangeText={(text) => setEditedProduct({ ...editedProduct, imageUrl: text })}
                                style={styles.input}
                            />
                            <PaperTextInput
                                label="Product Name"
                                placeholder="Enter Product Name"
                                value={editedProduct.name}
                                onChangeText={(text) => setEditedProduct({ ...editedProduct, name: text })}
                                style={styles.input}
                            />
                            <PaperTextInput
                                label="Product Description"
                                placeholder="Enter Product Description"
                                value={editedProduct.description}
                                onChangeText={(text) => setEditedProduct({ ...editedProduct, description: text })}
                                style={styles.input}
                                multiline
                            />
                            <PaperTextInput
                                label="Product Price"
                                placeholder="Enter Product Price"
                                value={(editedProduct.price === 0 || isNaN(editedProduct.price)) ? '' : editedProduct.price.toString()}
                                onChangeText={(text) => setEditedProduct({ ...editedProduct, price: parseFloat(text) })}
                                style={styles.input}
                                keyboardType="numeric"
                            />
                            <PaperTextInput
                                label="Product Quantity"
                                placeholder="Enter Product Quantity"
                                value={(editedProduct.quantity === 0 || isNaN(editedProduct.quantity)) ? '' : editedProduct.quantity.toString()}
                                onChangeText={(text) => setEditedProduct({ ...editedProduct, quantity: parseFloat(text) })}
                                style={styles.input}
                                keyboardType="numeric"
                            />
                            <View style={styles.modalFoter}>
                                <Button mode="contained" onPress={handleCloseModal} textColor='black' style={styles.closeButton}>
                                    Close
                                </Button>
                                <Button mode="contained" onPress={handleSaveProduct} style={styles.saveButton}>
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
    listContainer: {
        paddingBottom: 20,
    },
    productCard: {
        marginVertical: 5,
        marginHorizontal: 10,
        padding: 15,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    productDescription: {
        fontSize: 14,
        color: '#888',
        marginTop: 5,
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
    },
    modalContent: {
        paddingHorizontal: 10,
    },
    input: {
        marginBottom: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    saveButton: {
        marginTop: 10,
        backgroundColor: '#deac47',
        borderRadius: 8,
    },
    closeButton: {
        marginTop: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'black',
    },
    editButton: {
        backgroundColor: '#deac47',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginRight: 8,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: 'red',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    productActions: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 12,
        paddingTop: 8,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    addButton: {
        backgroundColor: '#deac47',
        marginVertical: 10,
        borderRadius: 8,
    },
    loader: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -25 }, { translateY: -25 }],
        zIndex: 1,
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyListText: {
        fontSize: 18,
        color: '#888',
    },
});

export default ManageProductScreen;
