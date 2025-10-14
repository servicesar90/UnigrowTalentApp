import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const HomeLayout = () => {
  return (
    <Stack screenOptions={{
    headerShown: false,
    contentStyle: { backgroundColor: '#def3f9' }, // your color here
  }}>
        <Stack.Screen name='home' options={{headerShown: false}} />
        <Stack.Screen name='[id]' options={{headerShown: false}} />
    </Stack>
  )
}

export default HomeLayout