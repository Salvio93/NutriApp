import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, Modal, TextInput
} from 'react-native';
import styles from './ProfileScreen.styles';
import { Picker } from '@react-native-picker/picker';
import { getUserData, updateUserData, initUserData } from '../backendjs/jsuser_data';

export default function ProfileScreen() {
  const [userData, setUserData] = useState({
    gender: 'homme',
    age: '21',
    height: '175',
    weight: '65',
    kcal: '2300'
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [tempData, setTempData] = useState(userData);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        await initUserData();
        const json =  await getUserData();
        setUserData(json);
        setTempData(json);
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };
    fetchUserData();
  }, []);

  const saveUserData = async () => {
    try {
      const kcal = await updateUserData(tempData);
      tempData['kcal'] = kcal;
      setUserData(tempData);
      setModalVisible(false);
    } catch (err) {
      console.error("Failed to save user data", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Genre : {userData.gender}</Text>
      <Text style={styles.label}>Âge : {userData.age} ans</Text>
      <Text style={styles.label}>Taille : {userData.height} cm</Text>
      <Text style={styles.label}>Poids : {userData.weight} kg</Text>
      <Text style={styles.label}>Kcal : {userData.kcal}</Text>

      <Button title="Modifier mes infos" onPress={() => setModalVisible(true)} />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.pickerLabel}>Genre :</Text>
            <Picker
              selectedValue={tempData.gender}
              onValueChange={(value) =>
                setTempData((prev) => ({ ...prev, gender: value }))
              }
              style={styles.picker}
            >
              <Picker.Item label="Homme (H)" value="H" />
              <Picker.Item label="Femme (F)" value="F" />
            </Picker>

            <Text style={styles.pickerLabel}>Age :</Text>
            <TextInput
              placeholder="Âge (0–100)"
              keyboardType="numeric"
              value={String(tempData.age)}
              onChangeText={(text) => {
                const age = parseInt(text) || 0;
                setTempData(prev => ({
                  ...prev,
                  age: age
                }));
              }}
              style={styles.input}
            />
            <Text style={styles.pickerLabel}>Taille :</Text>
            <TextInput
              placeholder="Taille (40–250 cm)"
              keyboardType="numeric"
              value={String(tempData.height)}
              onChangeText={(text) => {
                const height = parseInt(text) || 0;
                setTempData(prev => ({
                  ...prev,
                  height: height
                }));
              }}
              style={styles.input}
            />
            <Text style={styles.pickerLabel}>Poids :</Text>
            <TextInput
              placeholder="Poids (25–250 kg)"
              keyboardType="numeric"
              value={String(tempData.weight)}
              onChangeText={(text) => {
                const weight = parseFloat(text) || 0;
                setTempData(prev => ({
                  ...prev,
                  weight: weight
                }));
              }}
              style={styles.input}
            />

            <Button title="Enregistrer" onPress={saveUserData} />
            <Button title="Annuler" color="gray" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
