import React, { useEffect, useState,useCallback } from 'react';
import { View, Text, FlatList, Modal, Button,TouchableOpacity,Alert } from 'react-native';
import styles from './HomeScreen.styles';
import CalorieWheel from '../components/CalorieWheel';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getUserData } from '../backendjs/jsuser_data';
import { getSavedItemsByDate, getAllVitaminsByDate } from '../backendjs/jssaved_item';
import { getGarminKcalByDate, getGarminKcalFromCache } from '../backendjs/jsgarmin_kcal_export';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today;
  });
  const [consumed, setConsumed] = useState(0);
  const [target, setTarget] = useState(2000); // fallback default
  const [vitamines, setVitamines] = useState([]); // fallback default

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getFormattedDate = (dateObj) => dateObj.toISOString().split('T')[0];

  const changeDate = (offset) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + offset);
      return newDate;
    });
  };


  const fetchGarminData = async () =>{

      const dateStr = getFormattedDate(selectedDate);
      console.log(dateStr)
      console.log(getTodayDate())
    try{

      // to set the target var
      const profileJson = await getUserData();
      
      const activeJson = await getGarminKcalByDate(dateStr);
      console.log(activeJson)
      if (activeJson['total_kcal'] == null){
        console.log("No data on garmin yet")
        Alert.alert(
          "No data on garmin yet",
          "Please synchronize your watch with your garming connect app",
          [{ text: "OK", onPress: () => console.log("OK Pressed") }]
        );
      }
      else{
        const totalKcal = profileJson.kcal + activeJson['active_kcal']
        setTarget(totalKcal || target || 2006);
      }
      console.log(activeJson)

    }catch (err) {
      console.error("Error fetching garmin wheel data:", err);
    }

  }
  const fetchWheelData = async () => {
    const dateStr = getFormattedDate(selectedDate);
    try {
      // Fetch profile
      const profileJson = await getUserData();
      
      //const activeJson = await getGarminKcalFromCache(dateStr);
      const activeJson = {'total_kcal':1, 'active_kcal':23}

      if (activeJson){
        setTarget(profileJson.kcal + activeJson['active_kcal'])
      }
      else{
        setTarget( profileJson.kcal || 2006);
      }

      // Fetch items from today
      const itemJson = await getSavedItemsByDate(dateStr);


      var totalKcal = 0;
      if (itemJson.length !=0){
        itemJson.forEach((element) => totalKcal += element["kcal"] || 0);

        
      }

      setConsumed(Math.round(totalKcal));
    } catch (err) {
      console.error("Error fetching calorie wheel data:", err);
    }
  };
  const nutrient_fields = [
    "proteins",
    "carbohydrates",
    "sugars",
    "fat",
    "omega-3-fat",
    "omega-6-fat",
    "omega-9-fat",
    "cholesterol",
    "fiber",
    "sodium",
    "potassium",
    "calcium",
    "iron",
    "magnesium",
    "zinc",
    "alcohol",
    "vitamin-a",
    "vitamin-d",
    "vitamin-e",
    "vitamin-k",
    "vitamin-c",
    "vitamin-b1",
    "vitamin-b2",
    "vitamin-pp",
    "vitamin-b6",
    "vitamin-b9",
    "vitamin-b12",
    "nutrition-score-fr"
]

  const fetchVitamineData  = async () => {
    const dateStr = getFormattedDate(selectedDate);
    const vitaminesJson = await getAllVitaminsByDate(dateStr);
    setVitamines(vitaminesJson);
  }
  



  useFocusEffect(useCallback(() => {
    fetchWheelData();
    fetchVitamineData();
  }, [selectedDate]));


  return (
    <View style={styles.container}>
       {/* ⬅️ [Date] ➡️ Navigation */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{getFormattedDate(selectedDate)}</Text>
        <TouchableOpacity onPress={() => changeDate(1)} style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 24 }}>→</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text style={styles.title}>Calories</Text>
        <TouchableOpacity  onPress={() => navigation.navigate("Journal", {
            date: selectedDate,
          })}>
          <CalorieWheel consumed={consumed} target={target}/>
        </TouchableOpacity>
      </View>
      <View>
        <Button title="fetchGarmin"   onPress={() => fetchGarminData()} />
        <Button title="Profile"   onPress={() => navigation.navigate("Profile")} />
      </View>
      <FlatList
            data={Object.keys(vitamines)}
            keyExtractor={(key) => key}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text> {item} : {vitamines[item]} </Text>
              </View>
            )}
      />
      
    </View>
    
  );
}