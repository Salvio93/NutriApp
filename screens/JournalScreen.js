import React, { useState, useCallback } from 'react';
import { View, Button, FlatList, Text } from 'react-native';
import styles from './JournalScreen.styles';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {IP} from './config';

import { getSavedItemsByDate, deleteSavedItem, } from '../backendjs/jssaved_item';


export default function JournalScreen() {
  const [items, setItems] = useState([]);
  const navigation = useNavigation();

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const fetchTodayItems = async () => {
    try {
      //const res = await fetch(IP+`/saved/by-date/${getTodayDate()}`);
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
      <Button title="📁 View Saved Items" onPress={() => navigation.navigate("SavedItems")} />
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.name} </Text>
            <Text>{item.quantity}g </Text>
            <Text>{item.kcal}kcal</Text>
            <Button title="Remove"   onPress={() => removeItem(item.id, item.code, item.timestamp)} />
          </View>
        )}
      />
    </View>
  );
}
