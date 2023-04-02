import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from "../screens/HomeScreen";
import ConfigScreen from "../screens/ConfigScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import CameraScreen from "../screens/CameraScreen";

const { Navigator, Screen } = createStackNavigator();

const AppNavigator = () => (
    <NavigationContainer>
        <Navigator headerMode="none" initialRouteName="Login">
            <Screen name="Login" component={LoginScreen}></Screen>
            <Screen name="Home" component={HomeScreen}></Screen>
            <Screen name="Config" component={ConfigScreen}></Screen>
            <Screen name="Schedule" component={ScheduleScreen}></Screen>
            <Screen name="Camera" component={CameraScreen}></Screen>
        </Navigator>
    </NavigationContainer>
)

export default AppNavigator;