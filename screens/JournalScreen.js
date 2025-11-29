import React, { useState, useCallback } from 'react';
import { View, Button, FlatList, Text, TouchableOpacity } from 'react-native';
import styles from './JournalScreen.styles';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { getSavedItemsByDate, deleteSavedItem, } from '../backendjs/jssaved_item';


export default function JournalScreen({route}) {
  const [items, setItems] = useState([]);
  const navigation = useNavigation();
  const { date } = route.params;

  const getTodayDate = () => {
    return date.toISOString().split('T')[0];
  };

  /**
   * Fetch saved items for today
  */
  const fetchTodayItems = async () => {
    try {
      const res = await getSavedItemsByDate(getTodayDate());
      console.log("res:journal/saveditemtoday",res);
      if (res.length!=0){ 
        const formatted = res.map((item,idx) => ({
          id: `${item.code}_${idx}`,
          code: item.code,
          name: item.product_name,
          quantity: item.quantity,
          timestamp: item.timestamp,
          kcal: item.kcal
        }));
        
  
        setItems(formatted);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useFocusEffect(useCallback(() => {
    fetchTodayItems();
  }, []));
  
const removeItem = async (id, code, timestamp) => {
  try {
    await deleteSavedItem(code,timestamp);
    // Remove item from local state
    setItems(prev => prev.filter(item => item.id !== id));
  } catch (err) {
    console.error("Failed to delete item:", err);
  }
};


  return (
    <View style={styles.container}>

      <TouchableOpacity style={styles.roundButton} onPress={() => navigation.navigate("SavedItems", {
            date: getTodayDate(),
          })}>
      <Text style={styles.buttonText}>📁 View Saved Items</Text>
      </TouchableOpacity>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.name}>{item.name.slice(0,30)} </Text>
            <Text style={styles.name}>{item.quantity}g </Text>
            <Text style={styles.name}>{item.kcal}kcal</Text>

            <TouchableOpacity style={styles.roundButton} onPress={() => removeItem(item.id, item.code, item.timestamp)}>
            <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
