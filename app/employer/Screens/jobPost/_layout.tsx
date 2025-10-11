import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const ActionLayout = () => {
    return (
        <Stack>
            <Stack.Screen name='[action]' options={{ headerShown: false }} />
        </Stack>
    )
}

export default ActionLayout