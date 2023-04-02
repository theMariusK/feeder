import React, { useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

import Constants from "expo-constants";

const { manifest } = Constants;

const uri = `http://35.209.129.48/`;

const LoginScreen = ({navigation}) => {
  const [user, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    fetch('http://35.209.129.48/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: user,
        email: user,
        password: password,
      }),
    }).then(response => response.json())
    .then(data => {
      console.log(typeof(data));

      if(data == false) {
        Alert.alert(
          'Pranešimas',
          'Vartotojas su tokiais prisijungimo duomenimis neegzistuoja',
          [
            {
              text: 'Supratau',
              style: 'cancel',
            },
          ],
        );
        navigation.navigate("Home"); // temp
      }
      else {
        navigation.navigate("Home");
      }
    })
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prisijungimas prie gyvūnų maitinimo sistemos</Text>
      <TextInput
        style={styles.input}
        placeholder="Slapyvardis arba El. paštas"
        value={user}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Slaptažodis"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Prisijungti</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    width: 300,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    padding: 8,
    marginVertical: 8,
    width: '80%',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6A2C70',
    borderRadius: 4,
    padding: 12,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
