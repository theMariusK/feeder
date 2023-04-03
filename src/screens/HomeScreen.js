import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Button } from 'react-native';
import { Card } from 'react-native-paper';
import { Icon } from '@rneui/themed';

const HomeScreen = ({navigation}) => {
  const [devices, setDevices] = useState([]);

  const registerProduct = () => {
    navigation.navigate("Camera");
  };

  const logoff = () => {
    navigation.navigate("Login");
  };

  const configure = (device) => {
    global.device = device;
    navigation.navigate("Config");
  };

  if(global.username != "") {
    useEffect(() => {
      fetch(`http://35.209.129.48/devices?user=${global.username}`)
        .then(response => response.json())
        .then(data => setDevices(data))
        .catch(error => console.error(error));
    }, []);
  }

  return (
    <ScrollView>
    <View style={styles.container}>
      <TouchableOpacity style={styles.registerProduct} onPress={registerProduct}>
        <Text style={styles.buttonText}>Registruoti produktą</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoff} onPress={logoff}>
        <Text style={styles.buttonText}>Atsijungti</Text>
      </TouchableOpacity>

      {devices.map(item => (
        <>
        <Card style={styles.cards}>
          <Text style={styles.cardsText}>{item.name}</Text>
          <Card.Content>
            <Icon size={100} name='inbox' />
          </Card.Content>
          <TouchableOpacity style={styles.config} onPress={() => configure(item.serial)}>
            <Text style={styles.buttonText}>Konfigūruoti</Text>
          </TouchableOpacity>
        </Card>
        </>
      ))}
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerProduct: {
    backgroundColor: '#53354A',
    borderRadius: 4,
    padding: 12,
    width: 200,
    //flex: 1,
  },
  logoff: {
    backgroundColor: '#B83B5E',
    borderRadius: 4,
    padding: 12,
    width: 200,
    marginBottom: 30,
    //flex: 1,
  },
  config: {
    backgroundColor: '#798777',
    borderRadius: 4,
    padding: 12,
    width: 200,
    marginBottom: 30,
    marginTop: 10,
    //flex: 1,
  },
  cards: {
    width: 300,
    height: 220,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardsText: {
    fontSize: 20,
    padding: 10,
    textAlign: 'center',
  },
});

export default HomeScreen;
