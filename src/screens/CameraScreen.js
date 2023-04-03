import React, { useState, useEffect } from 'react';
import { Alert, Text, View, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Dialog from "react-native-dialog";

let using = false;
let deviceSerial = "";

export default function Camera({navigation}) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  const [serialVisible, setSerialVisible] = useState(false);
  const [serialNumber, setSerialValue] = useState('');

  const [nameVisible, setNameVisible] = useState(false);
  const [deviceName, setNameValue] = useState('');

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getBarCodeScannerPermissions();
    }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);

    fetch(`http://35.209.129.48/devices`)
        .then(response => response.json())
        .then(json => {    
            for(let i = 0; i < json.length; i++) {
                console.log(`${json[i].serial} - ${data}`);
                if(json[i].serial == data) {
                    Alert.alert(
                        'Pranešimas',
                        `Šis įrenginys jau užregistruotas`,
                        [
                          {
                            text: 'Supratau',
                          },
                        ],
                    );
                    return;
                }
            }
            deviceSerial = data;
            setNameVisible(true);
          })
        .catch(error => console.error(error));
  };

  const handleName = () => {
    if(deviceName == "") {
        Alert.alert(
            'Pranešimas',
            'Reikšmė negali būti tuščia',
            [
              {
                text: 'Supratau',
                style: 'cancel',
              },
            ],
        );
        return;
    }

    fetch('http://35.209.129.48/action', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: "registerdevice",
        name: deviceName,
        owner: `${global.username}`,
        serial: deviceSerial,
      }),
    }).then(response => response.json())
    .then(data => {
      console.log(data);

      if(data.status == "ok") {
        Alert.alert(
          'Pranešimas',
          'Įrenginys sėkmingai susietas',
          [
            {
              text: 'Supratau',
              style: 'cancel',
            },
          ],
        );
      }
    })

    setNameVisible(false);
  }

  if (hasPermission === null) {
    return <Text style={{marginTop: 100, textAlign: 'center'}}>Reikalinga prieiga prie kameros</Text>;
  }
  if (hasPermission === false) {
    return <Text style={{marginTop: 100, textAlign: 'center'}}>Nėra prieigos prie kameros</Text>;
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
    if(isNaN(serialNumber) || serialNumber == '' || serialNumber.length >= 36) {
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

    fetch(`http://35.209.129.48/devices`)
    .then(response => response.json())
    .then(json => {    
        for(let i = 0; i < json.length; i++) {
            if(json[i].serial == serialNumber) {
                Alert.alert(
                    'Pranešimas',
                    `Šis įrenginys jau užregistruotas`,
                    [
                        {
                        text: 'Supratau',
                        },
                    ],
                );
                return;
            }
        }
        deviceSerial = serialNumber;
        setNameVisible(true);
        })
    .catch(error => console.error(error));

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

      <Dialog.Container visible={nameVisible}>
        <Dialog.Title>Įrenginio pavadinimas</Dialog.Title>
        <Dialog.Description>
          Nurodykite įrenginio pavadinimą
        </Dialog.Description>
        <Dialog.Input value={deviceName} onChangeText={(text) => setNameValue(text)} />
        <Dialog.Button label="Atšaukti" onPress={() => setNameVisible(false)} />
        <Dialog.Button label="Susieti" onPress={handleName} />
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
