// App.js
import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import SpinnerOverlay from 'react-native-loading-spinner-overlay';
import { HomeScreen, LoginScreen, RegisterScreen } from './screens';
import UserContext, { UserProvider } from './context/UserContext';
import { View } from 'react-native';

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
        <Stack.Navigator initialRouteName="HomeScreen">
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator initialRouteName="Login" >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default () => {
  return (
    <PaperProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </PaperProvider>
  );
};