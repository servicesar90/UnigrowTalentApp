import React, { useRef, useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  AccessibilityRole,
  Image,
  Button,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function LandingPage() {


  const router = useRouter()

  // Animated values for background blobs/pulses
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makePulse = (anim: Animated.Value, delay = 0, dur = 2000) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: dur,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
            delay,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: dur,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );

    const a1 = makePulse(pulse1, 0, 2400);
    const a2 = makePulse(pulse2, 800, 2600);
    const a3 = makePulse(pulse3, 1600, 2800);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [pulse1, pulse2, pulse3]);



  // helper to create animated style
  const pulseStyle = (anim: Animated.Value, tx = 0, ty = 0, size = 240) => ({
    transform: [
      {
        translateX: anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, tx * 0.6, 0],
        }),
      },
      {
        translateY: anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, ty * 0.6, 0],
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.06, 1],
        }),
      },
    ],
    opacity: anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.12, 0.22, 0.12],
    }),
    width: size,
    height: size,
    borderRadius: size / 2,
    position: "absolute" as const,
  });

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative">
      <StatusBar style="light" />

      {/* Animated background pulses */}
      <View className="absolute inset-0">
        <Animated.View
          style={[
            pulseStyle(pulse1, -30, -20, 256),
            { left: width * 0.18, top: "25%", backgroundColor: "#2563eb" },
          ]}
        />
        <Animated.View
          style={[
            pulseStyle(pulse2, 40, 40, 320),
            { right: width * 0.12, top: "65%", backgroundColor: "#06b6d4" },
          ]}
        />
        <Animated.View
          style={[
            pulseStyle(pulse3, -20, -10, 288),
            { left: width * 0.28, bottom: "22%", backgroundColor: "#6366f1" }, // indigo-400/15
          ]}
        />
      </View>

   

      {/* Main content */}
      <View className="relative mt-10 z-10 flex-1 items-center justify-center p-6">
        {/* Header */}
        <View className="items-center mb-12 w-full">
          <View className="items-center justify-center w-full h-50 bg-gradient-to-r from-blue-500 to-cyan-500 mb-6 shadow-2xl">

            <Image
              source={require("../assets/images/unigrowLogo.png")}
              style={{ width: 200, height: 70 }}

            />

          </View>


          <Text className="text-lg text-[#0784c9] max-w-2xl text-center px-4">
            Connect talent with opportunity. Choose your path to begin your journey.
          </Text>
        </View>

        {/* Role cards */}

        <View className="flex-1 justify-center items-center gap-10" >
           <TouchableOpacity className="bg-[#0784c9] flex-row gap-4 items-center justify-center p-5 px-10 w-[80%] text-white rounded-2xl" 
           onPress={() => router.push("/employee/employeeLogin")} >
            <Image source={require("../assets/images/employee.png")} className="h-[100%] w-[15%]" />
            <Text className="text-2xl text-white font-bold">I am an Employee</Text>
            <Ionicons name="chevron-forward" size={25} color="white" className="-m-4"/>
          </TouchableOpacity>

          <TouchableOpacity className="bg-[#0784c9] flex-row gap-4 p-5 px-10 w-[80%] text-white rounded-2xl justify-center items-center" 
          onPress={() => router.push("/employer/employerLogin")}>
            <Image source={require("../assets/images/employer.png")} className="h-[100%] w-[15%]"  />
            <Text className="text-2xl text-white font-bold">I am an Employer</Text>
            <Ionicons name="chevron-forward" size={25} color="white" className="-m-4"/>
          </TouchableOpacity>

         
        </View>



        {/* Stats footer */}
        <View className="mt-12 w-full max-w-2xl flex-row justify-between px-4">
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-400">50K+</Text>
            <Text className="text-sm text-gray-400">Active Jobs</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-400">25K+</Text>
            <Text className="text-sm text-gray-400">Companies</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-400">100K+</Text>
            <Text className="text-sm text-gray-400">Professionals</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
