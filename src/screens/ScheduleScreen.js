import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from 'react-native-paper';
import { Icon } from '@rneui/themed';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';

const ScheduleScreen = ({navigation}) => {
  const [selected, setSelected] = useState('');


  const configure = () => {
    navigation.navigate("Config");
  };

  return (
    <ScrollView>
    <View style={styles.container}>

      <Calendar
        // Customize the appearance of the calendar
        style={{
            borderWidth: 1,
            borderColor: 'gray',
            height: 350
        }}
        // Specify the current date
        current={'2023-03-01'}
        // Callback that gets called when the user selects a day
        onDayPress={day => {
            console.log('selected day', day);
        }}
        // Mark specific dates as marked
        markedDates={{
            '2023-03-01': {selected: true, marked: true, selectedColor: 'blue'},
            '2023-03-02': {selected: true, marked: true, selectedColor: 'blue'},
            '2023-03-03': {selected: true, marked: true, selectedColor: 'red'}
        }}
        />

    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  itemText: {
    color: '#888',
    fontSize: 16,
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
  },
});

export default ScheduleScreen;
