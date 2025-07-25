import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation, route }) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadTotal();
    if (route.params?.barcode) {
      fetchNutrition(route.params.barcode);
    }
  }, [route.params]);

  async function loadTotal() {
    try {
      const stored = await AsyncStorage.getItem('dailyTotal');
      setTotal(stored ? parseInt(stored) : 0);
    } catch {
      setTotal(0);
    }
  }

  async function fetchNutrition(barcode) {
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const json = await res.json();
      if (json.status === 1) {
        const kcal = json.product.nutriments['energy-kcal_100g'] || 0;
        const name = json.product.product_name || 'Unknown product';
        const newTotal = total + kcal;
        await AsyncStorage.setItem('dailyTotal', newTotal.toString());
        setTotal(newTotal);
        Alert.alert('Added!', `${name}: ${kcal} kcal added to your total.`);
      } else {
        Alert.alert('Not found', 'Product not found.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch nutrition info.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Total Calories Today: {total}</Text>
      <Button title="Scan Barcode" onPress={() => navigation.navigate('Scanner')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, marginBottom: 20 }
});
