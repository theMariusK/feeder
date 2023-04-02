import React, { useState, useEffect } from 'react';
import { Alert, Text, View, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Dialog from "react-native-dialog";

let using = false;

export default function Camera({navigation}) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  const [serialVisible, setSerialVisible] = useState(false);
  const [serialNumber, setSerialValue] = useState('');

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getBarCodeScannerPermissions();
    }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    Alert.alert(
        'Pranešimas',
        `Serijinis numeris (${data}), tipas: ${type} `,
        [
          {
            text: 'Atšaukti',
          },
          {
            text: 'Susieti',
            onPress: () => console.log(`${data}`),
          },
        ],
      );
  };

  if (hasPermission === null) {
    return <Text>Reikalinga prieiga prie kameros</Text>;
  }
  if (hasPermission === false) {
    return <Text>Nėra prieigos prie kameros</Text>;
  }
  if(using == false) {
    Alert.alert(
        'Naudojimas',
        'Norint nuskenuoti serijinį numerį reikia, kad ekrane būtų produkto barkodas',
        [
          {
            text: 'Supratau',
            style: 'cancel',
          },
        ],
      );
      using = true;
  }

  const inputSerial = () => {
    setSerialVisible(true);
  }

  const handleSerial = () => {
    if(isNaN(serialNumber) || serialNumber == '') {
      Alert.alert(
        'Pranešimas',
        'Netinkama reikšmė',
        [
          {
            text: 'Supratau',
            style: 'cancel',
          },
        ],
      );
      return;
    }
    setSerialVisible(false);
  };

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Skenuoti dar kartą'} onPress={() => setScanned(false)} />}

      <TouchableOpacity style={styles.inputSerial} onPress={inputSerial}>
        <Text style={styles.buttonText}>Įvesti serijinį numerį</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Home")}>
        <Text style={styles.buttonText}>Atgal</Text>
      </TouchableOpacity>

      <Dialog.Container visible={serialVisible}>
        <Dialog.Title>Įvesti serijinį numerį</Dialog.Title>
        <Dialog.Description>
          Nurodykite serijinį numerį kuris yra pridėtas prie produkto
        </Dialog.Description>
        <Dialog.Input value={serialNumber} onChangeText={(text) => setSerialValue(text)} />
        <Dialog.Button label="Atšaukti" onPress={() => setSerialVisible(false)} />
        <Dialog.Button label="Atlikta" onPress={handleSerial} />
      </Dialog.Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  inputSerial: {
    backgroundColor: '#53354A',
    padding: 16,
    width: 200,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#B83B5E',
    padding: 16,
    width: 200,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});
