import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Binary, ChevronDown, Phone } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { mobileApi, otpApi } from "../api/api";
import { apiFunction } from "../api/apiFunction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {CodeField, Cursor} from "react-native-confirmation-code-field";


export default function EmployeeLogin() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showMobile, setShowMobile] = useState(true);
  const [otp, setOtp] = useState(null)
  const router = useRouter();

  const handleChange = async (text) => {
  
      const response = await apiFunction(otpApi, null, { phone: phoneNumber, role: "employer", otp: text }, "post", false);
      
      if (response) {
         
        await AsyncStorage.setItem("User", JSON.stringify(response.user));
        await AsyncStorage.setItem("Token", response?.token);
      
   
        if(response?.user?.profile){
          
          router.push("/employer/tab/(tabs)/Jobs")
        }else{
          
          router.push("/employer/createProfile");
        }
        
        
      }
  };


  // Animated values for three blobs
  const blob1 = useRef(new Animated.Value(0)).current;
  const blob2 = useRef(new Animated.Value(0)).current;
  const blob3 = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    const createLoop = (anim: Animated.Value, delay = 0, duration = 7000) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: duration / 2,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );

    const a1 = createLoop(blob1, 0, 7000);
    const a2 = createLoop(blob2, 2000, 8000);
    const a3 = createLoop(blob3, 4000, 9000);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [blob1, blob2, blob3]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  // interpolate transforms
  const blobTransform = (anim: Animated.Value, tx = 0, ty = 0, scaleMin = 0.9, scaleMax = 1.1) => ({
    transform: [
      {
        translateX: anim.interpolate({
          inputRange: [0, 0.33, 0.66, 1],
          outputRange: [0, tx * 0.33, -tx * 0.25, 0],
        }),
      },
      {
        translateY: anim.interpolate({
          inputRange: [0, 0.33, 0.66, 1],
          outputRange: [0, -ty * 0.33, ty * 0.25, 0],
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, scaleMax, scaleMin],
        }),
      },
    ],
  } as const);

  const handlePhone = async (value) => {
    setPhoneNumber(value);
    if (value.length === 10) {
      const response = await apiFunction(mobileApi, null, { phone: value, role: "employer" }, "post", false)
      console.log(response);
      
      if (response) {

        setShowMobile(false);

      }

    }
  }


 

  


  return (
    <View className="flex-1 w-full h-full">
      {/* <LinearGradient
        colors={["#0784c9", "white"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="w-full h-full "
      > */}


        <StatusBar style="dark" />
        {/* Animated background blobs */}
        <View className="absolute inset-0">
          <Animated.View
            style={[
              {
                position: "absolute",
                top: -20,
                left: -16,
                width: 288,
                height: 288,
                borderRadius: 288,
                opacity: 0.7,
                backgroundColor: "#93c5fd",
                overflow: "hidden",
                // filter: "blur(40px)" as any, 
              },
              blobTransform(blob1, 30, 50, 0.95, 1.1),
            ]}
          />
          <Animated.View
            style={[
              {
                position: "absolute",
                top: -20,
                right: -16,
                width: 288,
                height: 288,
                borderRadius: 288,
                opacity: 0.7,
                backgroundColor: "#c4b5fd", // purple-300
              },
              blobTransform(blob2, -30, -50, 0.9, 1.08),
            ]}
          />
          <Animated.View
            style={[
              {
                position: "absolute",
                bottom: -32,
                left: 80,
                width: 288,
                height: 288,
                borderRadius: 288,
                opacity: 0.7,
                backgroundColor: "#fda4af",

              },
              blobTransform(blob3, 20, 40, 0.92, 1.05),
            ]}
          />
        </View>

        {/* Main content */}
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: "padding" })}
          className="flex-1 justify-center items-center p-6 px-8"
        >

          {showMobile ?
            <View className="bg-white/80 rounded-3xl p-8 border border-white/20">

              {/* Header */}
              <View className="items-center mb-6">
                <View className="items-center justify-center w-16 h-16 rounded-2xl mb-4">
                  <Phone color={"#0784c9"} size={30} />
                </View>
                <Text className="text-3xl font-bold text-gray-800 mb-1">Welcome</Text>
                <Text className="text-gray-600 text-center">
                  Enter your phone number to get started
                </Text>
              </View>

              {/* Form */}
              <View className="space-y-6">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number</Text>
                  <View className="flex flex-row w-full gap-2">

                    <View className="flex-row items-center w-[20vw] px-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl">
                      <Text className="text-lg mr-1">+91</Text>

                      <TextInput
                        keyboardType="phone-pad"
                        onChangeText={handlePhone}
                        editable={false}
                        className="flex-1 text-lg"
                        placeholder="Phone number"
                        placeholderTextColor="#9CA3AF"
                      />

                      <ChevronDown size={20} color="#9CA3AF" />
                    </View>


                    <TextInput
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={(text) => handlePhone(text)}
                      placeholder="Enter Your Number"
                      className="w-[50vw] px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-lg"
                      placeholderTextColor="#9CA3AF"
                    />

                  </View>
                </View>

                {/* <TouchableOpacity
                  onPress={handleSubmit}
                  activeOpacity={0.85}
                  className="w-full mt-4 px-6 rounded-2xl "
                >
                  <Text className="text-center font-semibold text-lg text-blue-300 shadow-lg shadow-gray-800">Continue</Text>
                </TouchableOpacity> */}
              </View>

              {/* Footer */}
              <Text className="text-center text-sm text-gray-500 mt-6">
                By continuing, you agree to our{" "}
                <Text className="text-blue-600 underline">Terms of Service</Text> and{" "}
                <Text className="text-blue-600 underline">Privacy Policy</Text>
              </Text>
            </View>
            :
            <View className="bg-white/80 rounded-3xl p-8 border border-white/20 translateX-transform-swipeAnim">

              <Animated.View style={{ transform: [{ translateX: slideAnim }] }} >
                <View className="items-center mb-6">
                  <View className="items-center justify-center w-16 h-16 rounded-2xl mb-4">
                    <Binary color={"#0784c9"} size={30} />
                  </View>
                  <Text className="text-3xl font-bold text-gray-800 mb-1">Enter OTP</Text>
                  <Text className="text-gray-600 text-center">
                    Enter your OTP sent to you
                  </Text>
                </View>

                {/* Form */}
                <View className="space-y-6">
                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-2">OTP</Text>
                    <View className="flex flex-row gap-1 w-full items-center justify-center">
                       <CodeField
                      value={otp}
                      onChangeText={(v) => {
                        setOtp(v);
                        if (v.length === 4) handleChange?.(v);
                      }}
                      cellCount={4}
                      rootStyle={{ marginTop: 10 }}
                      keyboardType="number-pad"
                      renderCell={({ index, symbol, isFocused }) => (
                        <View
                          key={index}
                          style={{
                            width: 56,
                            height: 56,
                            marginHorizontal: 6,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: isFocused ? '#0784C9' : '#ddd',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#fff'
                          }}
                        >
                          <Text style={{ fontSize: 18 }}>
                            {symbol ?? (isFocused ? <Cursor /> : null)}
                          </Text>
                        </View>
                      )}
                    />
                    </View>
                  </View>

                  {/* <TouchableOpacity
                    onPress={handleSubmit}
                    activeOpacity={0.85}
                    className="w-full mt-4 px-6 rounded-2xl "
                  >
                    <Text className="text-center font-semibold text-lg text-blue-300 shadow-lg shadow-gray-800">Continue</Text>
                  </TouchableOpacity> */}
                </View>

                {/* Footer */}
                <View className="flex justify-center items-center gap-2">

                  <Text className="text-center text-sm text-gray-500 mt-6">
                    OTP sent to {phoneNumber}
                  </Text>
                  <TouchableOpacity onPress={() => setShowMobile(true)}>
                    <Text className="text-[#0784c9] font-bold text-sm ml-2 ">Edit</Text>
                  </TouchableOpacity>
                </View>


              </Animated.View>
            </View>
          }




        </KeyboardAvoidingView>

      {/* </LinearGradient> */}
    </View>
  );
}
