import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router';

const EmployerLayout = () => {
  return (
   <Stack 
   screenOptions={{
    headerShown: false,
    contentStyle: { backgroundColor: '#def3f9' }, // your color here
  }} >
     <Stack.Screen name='employerLogin' options={{ headerShown: false }} />
      <Stack.Screen name='createProfile' options={{ headerShown: false }} />
      <Stack.Screen name='tab/(tabs)' options={{ headerShown: false }} />
      <Stack.Screen name='Screens' options={{ headerShown: false }} />
   </Stack>
  )
}

export default EmployerLayout;