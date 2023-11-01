import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Pressable,
    TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../api';
import UserContext from '../context/UserContext';
import CartCountCard from '../components/CartCountCard';


const ProductCatalogScreen = (props) => {
    const navigation = useNavigation();
    const { userId, logout } = useContext(UserContext);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productLoading, setProductLoading] = useState({});
    const [isPopoverVisible, setIsPopoverVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [quantities, setQuantities] = useState({});
    const [cartItems, setCartItems] = useState([]);
    const [cartItemsCount, setCartItemsCount] = useState(0);

    useEffect(() => {
        fetchServices();
        fetchCartDetails();
    }, []);

    const fetchServices = async (clearSearchString) => {
        try {
            setLoading(true);
            let queryParams = {};
            if (searchQuery) {
                queryParams.searchQuery = searchQuery;
            }
            if (clearSearchString) {
                queryParams.searchQuery = '';
            }
            const response = await api.get('/products', { params: queryParams });
            setServices(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching services:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
    };

    const handleAddToCart = async (productId, product, quantity) => {
        try {
            if (!userId) {
                alert('Please log in to add items to your cart.');
                return;
            }
            setProductLoading((prevLoading) => ({ ...prevLoading, [productId]: true }));

            // Add the item to the cart (your implementation)
            // For example:
            const newItem = { productId, product, quantity };
            setCartItems((prevCartItems) => [...prevCartItems, newItem]);
            await api.post('/cart/add', { userId, productId, quantity }).then(response => {
                if (response) {
                    fetchCartDetails()
                    alert('Product added to cart successfully!');
                    setQuantities((prevQuantities) => (
                        {
                            ...prevQuantities,
                            [productId]: 1,
                        }));
                }
            })

        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add product to cart.');
        } finally {
            setProductLoading((prevLoading) => ({ ...prevLoading, [productId]: false }));
        }
    };

    const navigateToOrderManagement = () => {
        navigation.navigate('OrderManagement');
    };

    const renderPopover = () => (
        <Modal visible={isPopoverVisible} transparent={true} onRequestClose={() => setIsPopoverVisible(false)}>
            <Pressable style={styles.popoverBackground} onPress={() => setIsPopoverVisible(false)}>
                <View style={styles.popoverContent}>
                    <TouchableOpacity style={styles.popoverOption} onPress={handleLogout}>
                        <Text style={styles.popoverOptionText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </Modal>
    );

    const navigateToSingleProductView = (product) => {
        navigation.navigate('SingleProductView', { product });
    };

    const renderItem = ({ item }) => {
        const productId = item._id;
        const quantity = quantities[productId] || 1;

        const handleIncrement = (productId) => {
            setQuantities((prevQuantities) => ({
                ...prevQuantities,
                [productId]: (prevQuantities[productId] || 1) + 1,
            }));
        };

        const handleDecrement = (productId) => {
            setQuantities((prevQuantities) => ({
                ...prevQuantities,
                [productId]: Math.max(prevQuantities[productId] - 1, 1),
            }));
        };

        return (
            <TouchableOpacity
                style={styles.productContainer}
                onPress={() => navigateToSingleProductView(item)} // Navigate to SingleProductViewScreen with product details
            >
                <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>Price: ₹{item.price}</Text>
                    <TouchableOpacity
                        style={styles.addToCartButton}
                        onPress={() => handleAddToCart(item._id, item, quantity)}
                        disabled={productLoading[item._id]}
                    >
                        {productLoading[item._id] ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.addToCartButtonText}>Book Service</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    const handleSearch = () => {
        fetchServices(); // Fetch services based on the updated search query
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        fetchServices(true); // Fetch all services again when the search is cleared
    };

    const calculateTotalCartCount = (cartItems) => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    };

    const fetchCartDetails = async () => {
        try {
            const response = await api.get(`/cart/?userId=${userId}`);
            const cartItems = response.data;
            const cartCount = calculateTotalCartCount(cartItems)
            setCartItemsCount(cartCount);
        } catch (error) {
            console.error('Error fetching cart details:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Services..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch} // Handle search when the user presses Enter on the keyboard
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity
                            style={styles.clearSearchButton}
                            onPress={handleClearSearch}
                        >
                            <MaterialCommunityIcons name="close" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>
                <View style={styles.topRightBar}>
                    <TouchableOpacity style={styles.topRightBarHistory} onPress={navigateToOrderManagement}>
                        <MaterialCommunityIcons name="history" size={24} color="#deac47" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsPopoverVisible(true)}>
                        <MaterialCommunityIcons name="menu" size={24} color="#deac47" />
                    </TouchableOpacity>
                </View>
            </View>
            {services.length === 0 ? ( // Check if the services array is empty
                <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>No data available.</Text>
                </View>
            ) : (
                <FlatList
                    data={services}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.productList}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={() => {
                                fetchServices();
                                fetchCartDetails();
                            }}
                        />
                    }
                />
            )}
            {cartItemsCount > 0 && <CartCountCard cartItemsCount={cartItemsCount} />}
            {renderPopover()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    searchInput: {
        flex: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        width: '80%',
    },
    clearSearchButton: {
        padding: 8,
        marginLeft: 8,
    },
    topRightBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginEnd: -8, // To align with the right side of the screen in RTL mode
    },
    topRightBarCart: {
        right: 30,
    },
    topRightBarHistory: {
        right: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    productList: {
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    productContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    productImage: {
        width: 100,
        height: 100,
        resizeMode: 'cover',
        borderRadius: 10,
        marginRight: 16,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 16,
        color: '#777',
        marginBottom: 8,
    },
    addToCartButton: {
        backgroundColor: '#deac47',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    addToCartButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    popoverBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popoverContent: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    popoverOption: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    popoverOptionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#deac47',
    },
    cartCountCard: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#deac47',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    cartCountText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cartCountLabel: {
        color: '#fff',
        fontSize: 12,
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#777',
    },
});

export default ProductCatalogScreen;
