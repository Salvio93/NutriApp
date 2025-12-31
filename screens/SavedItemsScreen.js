import React, { useEffect, useState,useCallback  } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';


import {
  View, FlatList, Text, TextInput, StyleSheet, Modal, Button, TouchableOpacity, Keyboard, ScrollView
} from 'react-native';
import styles from './SavedItemsScreen.style';
import BarcodeScanner from '../components/BarcodeScanner';

import { getAllItems, getLastItem,insertProductBySearch, insertProductFromAPI, modifyProduct, deleteProduct, searchFoodOnline, getItemByName, getItemByCode,getItemsByNameAndCategory } from '../backendjs/jsmain';
import { addSavedItem, getAllSavedItems  } from '../backendjs/jssaved_item';

//? replace to replaceall?

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'morning', label: 'Morning' },
  { value: 'noon', label: 'Noon' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'fruit', label: 'Fruit' },
  { value: 'vegetable', label: 'Vegetable' },
  { value: 'meat', label: 'Meat' },
  { value: 'glucide', label: 'Glucide' },
  { value: 'drink', label: 'Drink' },
  { value: 'junkfood', label: 'Junk Food' },
];
export default function SavedItemsScreen({route}) {
  const { date } = route.params;

  const [items, setItems] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [modalAddVisible, setmodalAddVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [modalModifyVisible, setmodalModifyVisible] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);

  const [nameFilter, setNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [scanOnlyModalVisible, setScanOnlyModalVisible] = useState(false);
  const [scannedNutritionData, setScannedNutritionData] = useState(null);
  const [categorySelectModalVisible, setCategorySelectModalVisible] = useState(false);
  const [pendingBarcode, setPendingBarcode] = useState(null);
  const [scanMode, setScanMode] = useState('save'); // 'save' or 'info'

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

  
  // Apply filters whenever nameFilter or categoryFilter changes
  const applyFilters = async () => {
    try {
      if (!nameFilter && categoryFilter === 'all') {
        fetchall(); 
      } else {
        const filtered = await getItemsByNameAndCategory(nameFilter, categoryFilter);
        setItems(filtered || []);
      }
    } catch (err) {
      console.error("Failed to filter items:", err);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [nameFilter, categoryFilter]);



  const handleSearchSubmit = async () => {
    try {
      Keyboard.dismiss();
      const res = await searchFoodOnline(searchQuery)
      setSearchResults(res || []);
      setSearchModalVisible(true);  
    } catch (err) {
      console.error("Search failed:", err);
    }
    setItems(items.map(i => (i[0] === item[0] ? item : i)));
  };
  
  const handleBarcodeScanned = (barcode) => {
    setScannerVisible(false);
    
    if (scanMode === 'save') {
      // Show category selection modal
      setPendingBarcode(barcode);
      setCategorySelectModalVisible(true);
    } else {
      // Scan for info only
      handleBarcodeScanOnly(barcode);
    }
  };

  // Called after category is selected
  const handleCategorySelected = async (category) => {
    setCategorySelectModalVisible(false);
    if (pendingBarcode) {
      await addItemToDB(pendingBarcode, category);
      setPendingBarcode(null);
    }
  };


  // Scan only for nutrition info (doesn't save to DB)
  const handleBarcodeScanOnly = async (barcode) => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        setScannedNutritionData(data.product);
        setScanOnlyModalVisible(true);
      } else {
        alert('Product not found');
      }
    } catch (err) {
      console.error("Failed to fetch nutrition data:", err);
      alert('Error fetching product information');
    }
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

  /**
   * Add selected item to journal when button pressed
   */
  const addToJournal = async () => {
    if (!quantity.trim()) return;
    // ? usefull?

    //todo: look if can just use date 
    const timestamp = date

    try {
      console.log(selectedItem.product_name);
      await addSavedItem(selectedItem,Number.parseFloat(quantity),timestamp);

      console.log("saved/addtojournal", await getAllSavedItems());
    } catch (err) {
      console.error("Failed to save item to backend:", err);
    }

    setmodalAddVisible(false);
  };

  /**
   * Add item to DB when scanned
   * 
   * @param {int} barcode 
   */
  const addItemToDB = async(barcode,category) => {
    try {
      const in_db = await getItemByCode(barcode);
      if (in_db.length !=0){
        console.log("Already in DB");
        return
      }
        const res = await insertProductFromAPI(barcode,category);
        console.log("Backend response additemtodb:", res);

        const [lastItem] = await getItemByCode(barcode); 
        if (lastItem) {
          setItems((prevItems) => [...prevItems, lastItem]);
        }
        
    } catch (err) {
      console.error("Failed to send to backend:", err);
    }
  }
  /**
   * Add item to DB when searched
   * 
   * @param {object} item
   */
  const addItemToDBbySearch = async(item) => {
    try {
      const in_db = await getItemByCode(item.code);
      if (in_db.length !=0){
        console.log("Already in DB");
        return
      }
      const res = await insertProductBySearch(item);
      console.log("Backend response additemtodbbysearch:", res);

      const [lastItem] = await getItemByCode(item.code); 
      if (lastItem) {
        setItems((prevItems) => [...prevItems, lastItem]);
      }
        
    } catch (err) {
      console.error("Failed to send to backend:", err);
    }
  }
  
  /**
   * Modify item in DB when button pressed
   * 
   * @param {obj} item 
   */
  const modifyToDB = async (item) => {
    try {
      await modifyProduct(item);

      setmodalModifyVisible(false);
      applyFilters();
    } catch (err) {
      console.error("Failed to update item:", err);
    }
  };

  /**
   * Delete item from DB when button pressed
   * 
   * @param {obj} item 
   */
  const deleteData = async (item) => {
    const code = item.code;
    
    try {
      await deleteProduct(code);

      setItems(prev => prev.filter(item => item.code !== code));
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };



  //! replace hyphens with underscores in field names and remove code from editable fields
  const editableFields = Object.keys(fieldIndexMap).map(k => k.replace(/-/g,'_')).filter(k => k !== "code" && k !== "category");

  return (
    <View style={styles.container}>


      <View style={styles.filterContainer}>
        <TextInput
          style={styles.filterInput}
          placeholder="Filter by name..."
          value={nameFilter}
          onChangeText={setNameFilter}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryChips}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.chip,
                  categoryFilter === cat.value && styles.chipSelected
                ]}
                onPress={() => setCategoryFilter(cat.value)}
              >
                <Text style={[
                  styles.chipText,
                  categoryFilter === cat.value && styles.chipTextSelected
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity 
          style={styles.smallButton} 
          onPress={() => setSearchModalVisible(true)}
        >
          <Text style={styles.smallButtonText}>🔍 Search</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.smallButton} 
          onPress={() => {
            setScanMode('save');
            setScannerVisible(true);
          }}
        >
          <Text style={styles.smallButtonText}>📷 Save</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.smallButton} 
          onPress={() => {
            setScanMode('info');
            setScannerVisible(true);
          }}
        >
          <Text style={styles.smallButtonText}>🔎 Info</Text>
        </TouchableOpacity>
      </View>

      {/* Scanner Modal */}
      <Modal visible={scannerVisible} animationType="slide">
        <BarcodeScanner onScanned={handleBarcodeScanned} />
        <Button title="Cancel" onPress={() => setScannerVisible(false)} />
      </Modal>


      {/* Category Selection Modal (after scanning) */}
      <Modal visible={categorySelectModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                <TouchableOpacity
                  key={cat.value}
                  style={styles.categoryButton}
                  onPress={() => handleCategorySelected(cat.value)}
                >
                  <Text style={styles.categoryButtonText}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button 
              title="Skip (No Category)" 
              onPress={() => handleCategorySelected(null)} 
              color="gray" 
            />
          </View>
        </View>
      </Modal>

      
      {/* Scan Only Modal - Shows nutrition info */}
      <Modal visible={scanOnlyModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nutrition Information</Text>
            {scannedNutritionData && (
              <ScrollView>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Product:</Text>
                  <Text style={styles.nutritionValue}>{scannedNutritionData.product_name || 'N/A'}</Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Energy:</Text>
                  <Text style={styles.nutritionValue}>{scannedNutritionData.nutriments?.['energy-kcal_100g'] || 'N/A'} kcal</Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Proteins:</Text>
                  <Text style={styles.nutritionValue}>{scannedNutritionData.nutriments?.proteins_100g || 'N/A'} g</Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Carbs:</Text>
                  <Text style={styles.nutritionValue}>{scannedNutritionData.nutriments?.carbohydrates_100g || 'N/A'} g</Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Fat:</Text>
                  <Text style={styles.nutritionValue}>{scannedNutritionData.nutriments?.fat_100g || 'N/A'} g</Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Fiber:</Text>
                  <Text style={styles.nutritionValue}>{scannedNutritionData.nutriments?.fiber_100g || 'N/A'} g</Text>
                </View>
              </ScrollView>
            )}
            <Button title="Close" onPress={() => setScanOnlyModalVisible(false)} />
          </View>
        </View>
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
            {item['category'] && (
              <Text style={styles.categoryBadge}>{item['category']}</Text>
            )}

            {/* Buttons in a row below the name */}
            <View style={styles.buttonRow}>


              <TouchableOpacity style={styles.roundButton} onPress={() => openAddModal(item)}>
              <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.roundButton} onPress={() => openModifyModal(item)}>
              <Text style={styles.buttonText}>Modify</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.roundButton} onPress={() => deleteData(item)}>
              <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
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
                  addItemToDBbySearch(item);
                  setSearchModalVisible(false);
                  setSearchResults([]);
                }}>
                  <View style={styles.listItemSearch}>
                    <Text style={styles.name_search}>{item.product_name || 'Unnamed Item'}</Text>
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

      
      {/* Modify Modal */}
      <Modal visible={modalModifyVisible} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.modifyScrollView}>
              {/* Category Selection with Horizontal Scroll */}
              <View style={styles.modifySectionContainer}>
                <Text style={styles.modifySectionTitle}>Category:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryChipsModify}>
                    {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                      <TouchableOpacity
                        key={cat.value}
                        style={[
                          styles.chip,
                          selectedItem?.category === cat.value && styles.chipSelected
                        ]}
                        onPress={() => setSelectedItem(prev => ({ ...prev, category: cat.value }))}
                      >
                        <Text style={[
                          styles.chipText,
                          selectedItem?.category === cat.value && styles.chipTextSelected
                        ]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Other Editable Fields */}
              {editableFields.map((fieldName) => {
                const value = selectedItem?.[fieldName] ?? '';
                return (
                  <View key={fieldName} style={styles.listItem}>
                    <Text>{fieldName.replace(/_/g, ' ')}:</Text>
                    <TextInput
                      value={String(value)}
                      keyboardType={typeof value === 'number' || !Number.isNaN(value) ? 'numeric' : 'default'}
                      style={styles.input}
                      onChangeText={(text) =>
                        setSelectedItem((prev) => ({
                          ...prev,
                          [fieldName]: Number.isNaN(Number(text)) ? text : Number(text),
                        }))
                      }
                    />
                  </View>
                );
              })}
            </ScrollView>

            <Button title="Save Changes" onPress={() => modifyToDB(selectedItem)} />
            <Button title="Cancel" onPress={() => setmodalModifyVisible(false)} color="gray" />
          </View>
        </View>
      </Modal>


    </View>
  );
}