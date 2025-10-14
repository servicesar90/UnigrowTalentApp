
import React from 'react'
import { Stack } from 'expo-router'


const EmployeeLayout = () => {
  return (  
    <Stack screenOptions={{
    headerShown: false,
    contentStyle: { backgroundColor: '#def3f9' },
  }}>
        <Stack.Screen name='employeeLogin' options={{headerShown: false }} />
        <Stack.Screen name='header' options={{headerShown: false}} />
        <Stack.Screen name='tab/(tabs)' options={{headerShown: false}} />
    </Stack>

  )
}

export default EmployeeLayout