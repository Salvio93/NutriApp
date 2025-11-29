import React, { useEffect, useState,useCallback } from 'react';
import { View, Text, FlatList, Modal, Button,TouchableOpacity,Alert } from 'react-native';
import styles from './HomeScreen.styles';
import CalorieWheel from '../components/CalorieWheel';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getUserData } from '../backendjs/jsuser_data';
import { getSavedItemsByDate, getAllVitaminsByDate } from '../backendjs/jssaved_item';
import { getGarminKcalByDate, getGarminKcalFromCache } from '../backendjs/jsgarmin_kcal_export';
import { Ionicons } from '@expo/vector-icons'; 
export default function HomeScreen() {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today;
  });
  const [consumed, setConsumed] = useState(0);
  const [target, setTarget] = useState(2000); 
  const [vitamines, setVitamines] = useState([]); 
  const [profile, setProfile] = useState([]); 

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getFormattedDate = (dateObj) => dateObj.toISOString().split('T')[0];

  /**
   * change date by offset days (navigate calendar)
   */
  const changeDate = (offset) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + offset);
      return newDate;
    });
  };
  const getProfileData = async () => {
        return await getUserData();
  }
  
  /**
   * Fetch garmin data at start or on button press
   */
  const fetchGarminData = async () =>{
      const dateStr = getFormattedDate(selectedDate);
    try{
      const garmin_data = await getGarminKcalByDate(dateStr);
      setTargetData(garmin_data)
    }catch (err) {
      console.error("Error fetching garmin wheel data:", err);
    }

  }
  /**
   * Fetch wheel data of the day (journal) and garmin cache
   */
  const fetchWheelData = async () => {
    const dateStr = getFormattedDate(selectedDate);
    try {
      
      const garmin_data = await getGarminKcalFromCache(dateStr);
      setTargetData(garmin_data)

      const itemJson = await getSavedItemsByDate(dateStr);


      let totalKcal = 0;
      if (itemJson.length !=0){
        itemJson.forEach((element) => totalKcal += element["kcal"] || 0);

        
      }

      setConsumed(Math.round(totalKcal));
    } catch (err) {
      console.error("Error fetching calorie wheel data:", err);
    }
  };

  /**
   * Used in fetchWheelData and fetchGarminData to set target kcal
   */
  function  setTargetData(garminData){
    const dateStr = getFormattedDate(selectedDate);   
      if (garminData['total_kcal'] == null){
        Alert.alert(
          "No data on garmin yet",
          "Please synchronize your watch with your garming connect app",
          [{ text: "OK", onPress: () => console.log("OK Pressed") }]
        );
      }
      else{
        //! API is shit, can't return today data and sometimes has negative or no data 
        if(dateStr === getTodayDate()){
          setTarget(profile.kcal || 2006); //data of the day isn't ready for a fetch
        }else{
          
          const totalKcal =  garminData['total_kcal']+garminData["rest_kcal"]
          console.log("isgreater",garminData['total_kcal']>1000)
          console.log(garminData['total_kcal'],garminData["rest_kcal"])
          if (garminData['total_kcal']>1000){ 
            setTarget(garminData['total_kcal'] || 2006);//new data has total = 2009kcal
          }else{ 
            setTarget(totalKcal || 2006);//some old data have total_kcal = 400kcal and restkcal = 1486
          }
        }
      }


  }
  
  // Base RDI values per day for an average adult
  const BASE_RDI = {
    "proteins": 50,
    "carbohydrates": 275,
    "sugars": 50,
    "fat": 70,
    "fiber": 30,
    "iron": 18/1000,
    "calcium": 800/1000,
    "magnesium": 300/1000,
    "zinc": 11/1000,
    "vitamin_a": 900/1000000,
    "vitamin_d": 15/1000000,
    "vitamin_e": 15/1000,
    "vitamin_k": 120/1000000,
    "vitamin_c": 90/1000,
    "vitamin_b1": 1.2/1000,
    "vitamin_b2": 1.3/1000,
    "vitamin_pp": 16/1000,
    "vitamin_b6": 1.3/1000,
    "vitamin_b9": 400/1000000,
    "vitamin_b12": 2.4/1000000,
  };
  // Personalized scaling with biometrics profile
  const scale = (profile?.kcal || 2000) / 2000;
  const weight = profile?.weight || 70;
  const gender = profile?.gender || "H"; 

  // Adjusted RDI with biometrics data
  const personalizedRDI = { ...BASE_RDI };
  personalizedRDI.proteins = Math.max(0.8 * weight, BASE_RDI.proteins) * scale;
  personalizedRDI.carbohydrates = BASE_RDI.carbohydrates * scale;
  personalizedRDI.fat = BASE_RDI.fat * scale;

  // Gender adjustments
  if (gender === "F") {
    personalizedRDI.iron = 18/1000;
    personalizedRDI.zinc = 8/1000;
  } else {
    personalizedRDI.iron = 8/1000;
    personalizedRDI.zinc = 11/1000;
  }

  const fetchVitamineData  = async () => {
    const dateStr = getFormattedDate(selectedDate);
    const vitaminesJson = await getAllVitaminsByDate(dateStr);
    setVitamines(vitaminesJson);
  }
  



  useFocusEffect(useCallback(() => {
    const fetchAll = async () => {
      const profile = await getProfileData();
      setProfile(profile);

      await fetchWheelData();
      await fetchVitamineData();
      
    };

    fetchAll();
  }, [selectedDate]));


  return (
    <View style={styles.container}>
       {/* ⬅️ [Date] ➡️ Navigation */}
      <View style={{    color: '#fff', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={{ paddingHorizontal: 20 }}>
          <Text style={{     color: '#fff', fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={{     color: '#fff',fontSize: 18, fontWeight: 'bold' }}>{getFormattedDate(selectedDate)}</Text>
        <TouchableOpacity onPress={() => changeDate(1)} style={{ paddingHorizontal: 20 }}>
          <Text style={{     color: '#fff', fontSize: 24 }}>→</Text>
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
        <TouchableOpacity style={styles.roundButton} onPress={fetchGarminData}>
        <Text style={styles.buttonText}>Fetch Garmin</Text>
        </TouchableOpacity>

        {/* Profile Button as top-right gear */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="settings-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
      <FlatList
            data={Object.keys(vitamines)}
            keyExtractor={(key) => key}
            renderItem={({ item }) => {
              const value = vitamines[item].toFixed(6);
              const rdi = personalizedRDI[item];

              return (
                <View style={styles.listItem}>
                  <Text style={{    color: '#fff',}}>
                    {item}
                    :
                    {" "}
                    <Text style={{ fontWeight: 'bold' }}>{value ?? 0}</Text>
                    {rdi ? ` / ${rdi}` : ""}
                    {" "}
                    {rdi ? (
                      <Text style={{ color: rdi && value < rdi ? 'orange' : 'green', }}>
                        ({Math.round((value / rdi) * 100)}%)
                      </Text>
                    ) : ""}
                  </Text>
                </View>
              );
            }}
      />
      
    </View>
    
  );
}