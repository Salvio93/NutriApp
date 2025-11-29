import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import HomeScreen from '../screens/HomeScreen';
import JournalScreen from '../screens/JournalScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SavedItemsScreen from '../screens/SavedItemsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// hidden screens
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen}  options={{ headerShown: false }}/>
       
        <Stack.Screen 
          name="SavedItems" 
          component={SavedItemsScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen name="Journal" component={JournalScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen}  options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
