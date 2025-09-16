import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

import HomeScreen from '../screens/HomeScreen';
import JournalScreen from '../screens/JournalScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SavedItemsScreen from '../screens/SavedItemsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Journal" component={JournalScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="SavedItems" component={SavedItemsScreen} options={{
            tabBarButton: () => null,
            tabBarVisible: false, // optional, hides while it's active
            headerShown: false,    // or false depending on what you want
          }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
