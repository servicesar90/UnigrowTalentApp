import React from 'react'
import { Stack } from 'expo-router'

const Screens = () => {
  return (
    <Stack>
      <Stack.Screen name='Profile' options={{ headerShown: true,title:'Profile' }} />
       <Stack.Screen name='CompanyProfile' options={{ headerShown: true, title:'Company Profile' }} />
      <Stack.Screen name='jobPost' options={{ headerShown: true }} />
       <Stack.Screen name='[jobid]' options={{ headerShown: false }} />
    </Stack>
  )
}

export default Screens;