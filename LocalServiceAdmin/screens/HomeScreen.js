
import * as React from 'react';
import 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
// Import Custom Sidebar
import CustomSidebarMenu from '../components/CustomSidebarMenu';

import ManageUserScreen from './ManageUserScreen';
import ManageOrdersScreen from './ManageOrdersScreen';
import ManageProductScreen from './ManageProductScreen';

const Drawer = createDrawerNavigator();

function App(prop) {
    return (
        <>
            <Drawer.Navigator
                screenOptions={{
                    activeTintColor: '#e91e63',
                    itemStyle: { marginVertical: 5 },
                }}
                drawerContent={(props) => <CustomSidebarMenu {...prop} {...props} />}>
                <Drawer.Screen
                    name="Manage Product"
                    options={{ drawerLabel: 'Manage Product' }}
                    component={ManageProductScreen}
                />
                <Drawer.Screen
                    name="Manage Orders"
                    options={{ drawerLabel: 'Manage Orders' }}
                    component={ManageOrdersScreen}
                />
                <Drawer.Screen
                    name="Manage User"
                    options={{ drawerLabel: 'Manage User' }}
                    component={ManageUserScreen}
                />
            </Drawer.Navigator>
        </>
    );
}

export default App;
