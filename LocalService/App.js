// App.js
import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthScreen, ProductCatalogScreen, Cart, CheckoutProcess, OrderManagement, SingleProductViewScreen } from "./screens"
import UserContext, { UserProvider } from './context/UserContext';
import { View } from 'react-native';
import SpinnerOverlay from 'react-native-loading-spinner-overlay';
const Stack = createStackNavigator();

const App = () => {

  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useContext(UserContext);
  if (isLoading) {
    return (
      <View>
        <SpinnerOverlay visible={isLoading} textContent={'Loading...'} textStyle={{ color: '#FFF' }} />
      </View>
    );
  }
  return (
    <NavigationContainer>
      {userId ? (
        <Stack.Navigator initialRouteName="ProductCatalog">
          <Stack.Screen name="ProductCatalog" options={{ title: 'Welcome !!', headerShown: true, }} component={ProductCatalogScreen} />
          <Stack.Screen name="Cart" options={{ title: '', headerShown: false, }} component={Cart} />
          <Stack.Screen
            name="CheckoutProcess"
            component={CheckoutProcess}
            options={{ title: 'Checkout Process' }}
          />
          <Stack.Screen
            name="OrderManagement"
            component={OrderManagement}
            options={{ title: 'Order History' }}
          />
          <Stack.Screen
            name="SingleProductView"
            component={SingleProductViewScreen}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator initialRouteName="Auth" >
          <Stack.Screen
            screenOptions={{
              headerShown: false,
            }}
            name="Auth"
            component={AuthScreen} />
        </Stack.Navigator>
      )}

    </NavigationContainer>
  );
}

export default () => {
  return (
    <UserProvider>
      <App />
    </UserProvider>
  );
};