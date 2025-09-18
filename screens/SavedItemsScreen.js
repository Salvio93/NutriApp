import React, { useEffect, useState,useCallback  } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import {
  View, FlatList, Text, TextInput, StyleSheet, Modal, Button, TouchableOpacity, Keyboard
} from 'react-native';
import styles from './SavedItemsScreen.style';
import BarcodeScanner from '../components/BarcodeScanner';
import {IP} from './config';

import { getAllItems, getLastItem, insertProductFromAPI, modifyProduct, deleteProduct, searchFoodOnline, getItemByName, getItemByCode } from '../backendjs/jsmain';
import { addSavedItem, getAllSavedItems  } from '../backendjs/jssaved_item';


export default function SavedItemsScreen() {
  const [items, setItems] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [modalAddVisible, setmodalAddVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [modalModifyVisible, setmodalModifyVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);

  const fetchall = async () =>{
      try{
        const res = await getAllItems();
        setItems(res || [])
        console.log("fetchall");
        console.log(res)
  
      } catch (err) {
        console.error("Failed to send to backend:", err);
      }
    }
  useFocusEffect(useCallback(() => {
      fetchall();
  }, []));

  const handleSearchSubmit = async () => {
    try {
      Keyboard.dismiss();
      //const res = await fetch(IP+`/scan/search/${searchQuery}`);
      const res = await searchFoodOnline(searchQuery)
      const json = JSON.stringify(res);
      //console.log("search"+json);
      setSearchResults(res || []);
      setSearchModalVisible(true);  // show modal with results
    } catch (err) {
      console.error("Search failed:", err);
    }
    setItems(items.map(i => (i[0] === item[0] ? item : i)));
  };
  const openAddModal = (item) => {
    setSelectedItem(item);
    setQuantity('');
    setmodalAddVisible(true);
  };

  const openModifyModal = (item) => {
    setSelectedItem({ ...item._raw });
    setmodalModifyVisible(true);
  };
  const addToJournal = async () => {
    if (!quantity.trim()) return;

    

    const timestamp = new Date().toISOString(); // e.g. "2025-06-13T14:12:00Z"

    try {
      console.log(selectedItem.product_name);
      await addSavedItem(selectedItem,parseFloat(quantity),timestamp);

      console.log("saved/addtojournal", await getAllSavedItems());
    } catch (err) {
      console.error("Failed to save item to backend:", err);
    }

    setmodalAddVisible(false);
  };


  const handleBarcodeScanned = (barcode) => {
    setScannerVisible(false);
    addItemToDB(barcode);
  };


  
  const addItemToDB = async(barcode) => {
    try {
      const in_db = await getItemByCode(barcode);
      if (in_db.length !=0){
        console.log("Already in DB");
        return
      }
        const res = await insertProductFromAPI(barcode);
        console.log("Backend response additemtodb:", res);

        const [lastItem] = await getItemByCode(barcode); 
        if (lastItem) {
          setItems((prevItems) => [...prevItems, lastItem]);
        }
        
    } catch (err) {
      console.error("Failed to send to backend:", err);
    }
  }

    
  
  const fieldIndexMap = {
    "code": 0,
    "product_name": 1,
    "energy_100g": 2,
    "energy-kcal_100g": 3,
    "proteins_100g": 4,
    "carbohydrates_100g": 5,
    "sugars_100g": 6,
    "glucose_100g": 7,
    "fructose_100g": 8,
    "lactose_100g": 9,
    "fat_100g": 10,
    "omega-3-fat_100g": 11,
    "omega-6-fat_100g": 12,
    "omega-9-fat_100g": 13,
    "cholesterol_100g": 14,
    "fiber_100g": 15,
    "sodium_100g": 16,
    "potassium_100g": 17,
    "calcium_100g": 18,
    "iron_100g": 19,
    "magnesium_100g": 20,
    "zinc_100g": 21,
    "alcohol_100g": 22,
    "vitamin-a_100g": 23,
    "vitamin-d_100g": 24,
    "vitamin-e_100g": 25,
    "vitamin-k_100g": 26,
    "vitamin-c_100g": 27,
    "vitamin-b1_100g": 28,
    "vitamin-b2_100g": 29,
    "vitamin-pp_100g": 30,
    "vitamin-b6_100g": 31,
    "vitamin-b9_100g": 32,
    "vitamin-b12_100g": 33,
    "nutrition-score-fr_100g": 34,
    "nutrition-score-uk_100g": 35,
  };
  
  

  const modifyToDB = async (item) => {
    try {
      await modifyProduct(item);

      setmodalModifyVisible(false);
      fetchall();
    } catch (err) {
      console.error("Failed to update item:", err);
    }
  };

  const deleteData = async (item) => {
    const code = item.code;
    
    try {
      await deleteProduct(code);

      setItems(prev => prev.filter(item => item.code !== code));
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };




  const editableFields = Object.keys(fieldIndexMap).filter(key => key !== "code");

  return (
    <View style={styles.container}>
      <Button title="🔍 Search Food" onPress={() => setSearchModalVisible(true)} />



      
      <Button title="📷 Scan Barcode" onPress={() => setScannerVisible(true)} />

      <Modal visible={scannerVisible} animationType="slide">
        <BarcodeScanner onScanned={handleBarcodeScanned} />
        <Button title="Cancel" onPress={() => setScannerVisible(false)} />
      </Modal>


      <FlatList
        data={items}
        keyExtractor={(item, index) => item[0] || index.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            {/* Item name on top */}
            <Text style={styles.name}>
              {item['product_name'] || 'Unnamed Item'}
            </Text>

            {/* Buttons in a row below the name */}
            <View style={styles.buttonRow}>
              <Button title="Add" onPress={() => openAddModal(item)} />
              <Button title="Modify" onPress={() => openModifyModal(item)} />
              <Button title="Delete" onPress={() => deleteData(item)} />
            </View>
          </View>
        )}
      />
      <Modal visible={searchModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Search food (e.g. banane)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setSearchResults([])} // ⬅️ Clears results on focus
            />


            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => item.code || index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => {
                  addItemToDB(item.code);
                  setSearchModalVisible(false);
                  setSearchResults([]);
                }}>
                  <View style={styles.listItemSearch}>
                    <Text style={styles.name}>{item.product_name || 'Unnamed Item'}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            <Button title="search" onPress={() => handleSearchSubmit()} color="gray" />

            <Button title="Close" onPress={() => setSearchModalVisible(false)} color="gray" />
          </View>
        </View>
      </Modal>


      <Modal visible={modalAddVisible} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text>Enter quantity in grams:</Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              style={styles.input}
              placeholder="e.g. 100"
            />
            <Button title="Add" onPress={addToJournal} />
            <Button title="Cancel" color="gray" onPress={() => setmodalAddVisible(false) } />
          </View>
        </View>
      </Modal>

      <Modal visible={modalModifyVisible} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <FlatList
              data={editableFields}
              keyExtractor={(item) => item}
              renderItem={({ item: fieldName }) => {
                const index = fieldIndexMap[fieldName];
                const value = selectedItem?.[fieldName] ?? '';

                return (
                  <View style={styles.listItem}>
                    <Text>{fieldName.replace(/_/g, ' ')}:</Text>
                    <TextInput
                      value={String(value)}
                      keyboardType={typeof value === 'number' || !isNaN(value) ? 'numeric' : 'default'}
                      style={styles.input}
                      onChangeText={(text) =>
                        setSelectedItem((prev) => ({
                          ...prev,
                          [fieldName]: isNaN(Number(text)) ? text : Number(text),       // update only the edited field
                        }))
                      }
                    />
                  </View>
                );
              }}
            />

            <Button title="Save Changes" onPress={() => modifyToDB(selectedItem)} />
            <Button title="Cancel" onPress={() => setmodalModifyVisible(false)} color="gray" />

          </View>
        </View>
      </Modal>


    </View>
  );
}
/* 
      <Modal visible={modalModifyVisible} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <FlatList
              data={editableFields}
              keyExtractor={(item) => item}
              renderItem={({ item: fieldName }) => {
                const index = fieldIndexMap[fieldName];
                const value = selectedItem?.[fieldName] ?? '';

                return (
                  <View style={styles.listItem}>
                    <Text>{fieldName.replace(/_/g, ' ')}:</Text>
                    <TextInput
                      value={String(value)}
                      keyboardType={typeof value === 'number' || !isNaN(value) ? 'numeric' : 'default'}
                      style={styles.input}
                      onChangeText={(text) => {
                        const newSelected = selectedItem;
                        newSelected[value] = [isNaN(text) ? text : parseFloat(text)];
                        setSelectedItem(newSelected);
                      }}
                    />
                  </View>
                );
              }}
            />

            <Button title="Save Changes" onPress={() => modifyToDB(selectedItem)} />
            <Button title="Cancel" onPress={() => setmodalModifyVisible(false)} color="gray" />
*/