import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Card } from 'react-native-paper';
import Dialog from "react-native-dialog";
 
const ConfigScreen = ({navigation}) => {
  const [foodVisible, setFoodVisible] = useState(false);
  const [foodAmount, setFoodAmountValue] = useState('');

  const [supervisorVisible, setSupervisorVisible] = useState(false);
  const [supervisorUser, setSupervisorValue] = useState('');

  const [weightVisible, setWeightVisible] = useState(false);
  const [weightAmount, setWeightValue] = useState('');

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
    setFoodVisible(false);
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
    setWeightVisible(false);
  };

  return (
    <View style={styles.container}>
      <Card style={styles.cards}>
        <Text style={{fontSize: 20, padding: 10}}>Liko maisto:</Text>
        <Text style={{fontSize: 30, padding: 10}}>1,1 kg</Text>
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
        <Dialog.Input value={weightAmount} onChangeText={(text) => setWeightValue(text)} />
        <Dialog.Button label="Atšaukti" onPress={() => setWeightVisible(false)} />
        <Dialog.Button label="Maitinti" onPress={handleWeight} />
      </Dialog.Container>
    </View>
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
