import { Stack } from "expo-router";
import "../global.css";
import { Provider as PaperProvider } from "react-native-paper";
import {Provider} from "react-redux";
import {getDataStore} from "./Redux/getDataStore"
import Toast from "react-native-toast-message"

export default function RootLayout() {
  return (
    <PaperProvider>
      <Provider store={getDataStore}>

      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="landingpage" options={{ headerShown: false }} />
        <Stack.Screen name="employee" options={{ headerShown: false }} />
        <Stack.Screen name="employer" options={{ headerShown: false }} />
      </Stack>

      </Provider>
      <Toast />

    </PaperProvider>
  )

}
