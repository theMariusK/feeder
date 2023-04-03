import React, { useState, useEffect } from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import Dialog from "react-native-dialog";
 
const ConfigScreen = ({navigation}) => {
  
  const [foodVisible, setFoodVisible] = useState(false);
  const [foodAmount, setFoodAmountValue] = useState('');

  const [supervisorVisible, setSupervisorVisible] = useState(false);
  const [supervisorUser, setSupervisorValue] = useState('');

  const [weightVisible, setWeightVisible] = useState(false);
  const [weightAmount, setWeightValue] = useState('');

  const [deleteVisible, setDeleteVisible] = useState(false);

  const [device, setDevice] = useState(null);

  const autoFeed = () => {
    navigation.navigate("Schedule");
  };

  const feedNow = () => {
    setFoodVisible(true);
  }

  const addSupervisor = () => {
    setSupervisorVisible(true);
  };

  const addWeight = () => {
    setWeightVisible(true);
  }

  const deleteDevice = () => {
    setDeleteVisible(true);
  }

  useEffect(() => {
    fetch(`http://35.209.129.48/devices?user=${global.username}&serial=${global.device}`)
      .then(response => response.json())
      .then(data => setDevice(data))
      .catch(error => console.error(error));
  }, []);

  const handleFeed = () => {
    if(isNaN(foodAmount) || foodAmount == '') {
      Alert.alert(
        'Pranešimas',
        'Reikšmė turi būti skaičius',
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
        action: "feednow",
        amount: foodAmount,
        owner: `${global.username}`,
        serial: `${global.device}`,
      }),
    }).then(response => response.json())
    .then(data => {
      console.log(data);

      if(data.status == "ok") {
        Alert.alert(
          'Pranešimas',
          'Maistas sėkmingas išduotas',
          [
            {
              text: 'Supratau',
              style: 'cancel',
            },
          ],
        );
      }
    })
    setFoodVisible(false);
    navigation.navigate("Home");
    navigation.navigate("Config");
  };

  const handleSupervisor = () => {
    if(supervisorUser == '') {
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

    setSupervisorVisible(false);
  };

  const handleWeight = () => {
    if(isNaN(weightAmount) || weightAmount == '') {
      Alert.alert(
        'Pranešimas',
        'Reikšmė turi būti skaičius',
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
        action: "addweightcof",
        weightcof: weightAmount,
        owner: `${global.username}`,
        serial: `${global.device}`,
      }),
    }).then(response => response.json())
    .then(data => {
      console.log(data);

      if(data.status == "ok") {
        Alert.alert(
          'Pranešimas',
          'Svorio reikšmė sėkmingai pakeista',
          [
            {
              text: 'Supratau',
              style: 'cancel',
            },
          ],
        );
      }
    })

    setWeightVisible(false);
    navigation.navigate("Home");
    navigation.navigate("Config");
  };

  const handleDelete = () => {
    fetch('http://35.209.129.48/action', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: "deletedevice",
        owner: `${global.username}`,
        serial: `${global.device}`,
      }),
    }).then(response => response.json())
    .then(data => {
      console.log(data);

      if(data.status == "ok") {
        Alert.alert(
          'Pranešimas',
          'Įrenginys sėkmingai ištrintas',
          [
            {
              text: 'Supratau',
              style: 'cancel',
            },
          ],
        );
      }
    })

    setDeleteVisible(false);
    navigation.navigate("Home");
  }

  return (
    <ScrollView>
    <View style={styles.container}>
      {device && (
        <Text style={{fontSize: 30, padding: 10, marginBottom: 20}}>{device.name}</Text>
      )}

      <Card style={styles.cards}>
        <Text style={{fontSize: 15, padding: 10}}>Liko maisto:</Text>
        {device && (
          <Text style={{fontSize: 25, padding: 10}}>{device.foodleft} kg</Text>
        )}

        <Text style={{fontSize: 15, padding: 10}}>Paskutinį kartą buvo maitinta:</Text>
        {device && (
          <Text style={{fontSize: 25, padding: 10}}>{device.lastfeed}</Text>
        )}
      </Card>

      <TouchableOpacity style={styles.button} onPress={feedNow}>
        <Text style={styles.buttonText}>Maitinti dabar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={autoFeed}>
        <Text style={styles.buttonText}>Automatinis maitinimas</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={addSupervisor}>
        <Text style={styles.buttonText}>Pridėti prižiūrėtoją</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={addWeight}>
        <Text style={styles.buttonText}>Automatinis maitinimas pagal svorį</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonDelete} onPress={deleteDevice}>
        <Text style={styles.buttonText}>Ištrinti įrenginį</Text>
      </TouchableOpacity>

      <Dialog.Container visible={foodVisible}>
        <Dialog.Title>Maitinti dabar</Dialog.Title>
        <Dialog.Description>
          Nurodykite maisto kiekį gramais kurį norite išduoti (pvz.: 100)
        </Dialog.Description>
        <Dialog.Input value={foodAmount} onChangeText={(text) => setFoodAmountValue(text)} />
        <Dialog.Button label="Atšaukti" onPress={() => setFoodVisible(false)} />
        <Dialog.Button label="Maitinti" onPress={handleFeed} />
      </Dialog.Container>

      <Dialog.Container visible={supervisorVisible}>
        <Dialog.Title>Pridėti prižiūrėtoja</Dialog.Title>
        <Dialog.Description>
          Nurodykite vartotojo slapyvardi arba el. paštą
        </Dialog.Description>
        <Dialog.Input value={supervisorUser} onChangeText={(text) => setSupervisorValue(text)} />
        <Dialog.Button label="Atšaukti" onPress={() => setSupervisorVisible(false)} />
        <Dialog.Button label="Pridėti" onPress={handleSupervisor} />
      </Dialog.Container>

      <Dialog.Container visible={weightVisible}>
        <Dialog.Title>Automatinis maitinimas pagal svorį</Dialog.Title>
        <Dialog.Description>
          Nurodykite kiekį kuris bus išduodamas kiekvienam kūno kilogramui (pvz.: 20 reikš jog kiekvienam kilogramui kūno svorio bus išduodama 20g maisto)
        </Dialog.Description>
        <Dialog.Description>
          Dabartinis nustatytas kiekis:
          {device && (
            <Text style={{fontSize: 25, padding: 10, marginLeft: 10}}> {device.weightcof}</Text>
          )}
        </Dialog.Description>
        <Dialog.Input value={weightAmount} onChangeText={(text) => setWeightValue(text)} />
        <Dialog.Button label="Atšaukti" onPress={() => setWeightVisible(false)} />
        <Dialog.Button label="Nustatyti" onPress={handleWeight} />
      </Dialog.Container>

      <Dialog.Container visible={deleteVisible}>
        <Dialog.Title>Ištrinti įrenginį</Dialog.Title>
        <Dialog.Description>
          Ar tikrai norite ištrinti
        {device && (
        <Text style={{fontWeight: 'bold'}}> {device.name}</Text>
      )}?
        </Dialog.Description>
        <Dialog.Button label="Atšaukti" onPress={() => setDeleteVisible(false)} />
        <Dialog.Button label="Ištrinti" onPress={handleDelete} />
      </Dialog.Container>
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
  button: {
    backgroundColor: '#798777',
    borderRadius: 4,
    padding: 12,
    width: 250,
    marginBottom: 50,
    //flex: 1,
  },
  buttonDelete: {
    backgroundColor: '#B83B5E',
    borderRadius: 4,
    padding: 12,
    width: 250,
    marginBottom: 50,
    //flex: 1,
  },
  cards: {
    marginBottom: 50,
    padding: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConfigScreen;
