import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import Home from './src/screens/home';
import Map from './src/screens/map';



const Stack = createStackNavigator();

export default () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home}  />
      <Stack.Screen name="Map" component={Map} 
      options={{ title: 'Map' }}/>
     
    </Stack.Navigator>
  </NavigationContainer>
);