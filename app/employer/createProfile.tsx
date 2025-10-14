// UnigrowOnboardingForm.js

import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Checkbox } from "react-native-paper";
import { useForm, Controller, useController } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { apiFunction } from "../api/apiFunction";
import { createProfileApi, logOutApi } from "../api/api";

const companySizes = [
  "0-50",
  "51-100",
  "101-300",
  "301-500",
  "501-1000",
  "1000 above"
];

export default function UnigrowOnboardingForm() {
  const [agreement, setAgreement] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      companyName: "",
      isConsultancy: false,
      employeeNumber: null,
    },
  });

 const { field: { value: employeeNumber }, } = useController({
  name: "employeeNumber",
  control,
  rules: { required: "Please select company size" },
});

  const onSubmit = async (data) => {
    if (!agreement) {
      Toast.show({
        type: "error",
        text1: "Terms and services",
        text2: "You must accept the terms to continue"
      })
      return;
    }

     if(data){
      try {
        const response = await apiFunction(createProfileApi,null,data,"post",true)
        
        if(response?.status === 409) return Toast.show({
          type: "error",
          text1: "Employer already exist.",
          text2: "Please try Login again after logout."
        }) 
        if(response?.status === 400) return Toast.show({
        type: "error",
        text1: "Duplicate Company",
        text2: "Please try with different company name."
      })

        if(response) return  router.push("/employer/tab/(tabs)/Jobs");
      } catch (error) {
        console.log("err",error); 
      }
      
    }

  };

  const logout = async () => {
    const response = await apiFunction(logOutApi, null, {}, "post", true);
        if (response) {
            await AsyncStorage.removeItem("Token");
            await AsyncStorage.removeItem("User");
            router.replace("/landingpage");
        } else {
            Toast.show({
                type: "error",
                text1: "Logout",
                text2: "could not Logout! Try again"
            })
        }
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="bg-[#DEF3F9] p-6 mt-10"
    >
      {/* Header */}
      <View className="flex flex-row justify-between items-center mb-8">

        <TouchableOpacity
          className="bg-[#003B70] px-4 py-2 rounded-full"
          onPress={logout}
        >
          <Text className="text-white font-medium">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text className="text-3xl font-extrabold text-[#003B70] mb-6">
        Let’s get you started!
      </Text>

      {/* Form */}
      <View className="bg-white rounded-2xl shadow p-5">
        {/* Full Name */}
        <Controller
          control={control}
          name="fullName"
          rules={{ required: "Full name is required" }}
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                placeholder="Your full name"
                value={value}
                onChangeText={onChange}
                className="border border-gray-300 rounded-lg px-4 py-3 mb-2 text-sm"
                placeholderTextColor="#666"
              />
              {errors.fullName && (
                <Text className="text-red-500 text-xs mb-3">
                  {errors.fullName.message}
                </Text>
              )}
            </>
          )}
        />

        {/* Company Name */}
        <Controller
          control={control}
          name="companyName"
          rules={{ required: "Company name is required" }}
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                placeholder="Enter the name of your company"
                value={value}
                onChangeText={onChange}
                className="border border-gray-300 rounded-lg px-4 py-3 mb-2 text-sm"
                placeholderTextColor="#666"
              />
              {errors.companyName && (
                <Text className="text-red-500 text-xs mb-3">
                  {errors.companyName.message}
                </Text>
              )}
            </>
          )}
        />

        <Controller
          control={control}
          name="isConsultancy"

          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View className="mb-5">
              <View className="flex flex-row items-center">
                <Checkbox
                  status={value ? "checked" : "unchecked"}
                  color="#0784C9"
                  onPress={() => onChange(!value)}
                />
                <Text className="text-sm text-[#003B70]">
                  This is a Consultancy.
                </Text>
              </View>

            </View>
          )}
        />


        {/* Employee Number */}
        <Text className="text-sm font-semibold text-[#003B70] mb-3">
          Number of Employees
        </Text>
        <View className="flex flex-row flex-wrap gap-3 mb-2">
          {companySizes.map((option, index) => (
            <TouchableOpacity
              key={index}
              className={`px-4 py-2 rounded-full border ${employeeNumber === option
                  ? "bg-[#0784C9] border-[#0784C9]"
                  : "bg-gray-100 border-gray-300"
                }`}
              onPress={() => setValue("employeeNumber", option, { shouldValidate: true, shouldDirty: true })}
            >
              <Text
                className={`text-sm font-medium ${employeeNumber === option ? "text-white" : "text-[#003B70]"
                  }`}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.employeeNumber && (
          <Text className="text-red-500 text-xs mb-3">
            {errors.employeeNumber.message}
          </Text>
        )}

        {/* Hidden validation rule for employeeNumber */}
        <Controller
          control={control}
          name="employeeNumber"
          rules={{ required: "Please select company size" }}
          render={() => null}
        />

        {/* Terms Agreement */}
        <View className="flex flex-row items-start mb-6">
          <Checkbox
            status={agreement ? "checked" : "unchecked"}
            color="#0784C9"
            onPress={() => setAgreement(!agreement)}
          />
          <Text className="text-sm text-[#003B70] flex-shrink">
            I Agree to Unigrow's{" "}
            <Text className="text-[#0784C9] underline">Terms of Service</Text>{" "}
            and{" "}
            <Text className="text-[#0784C9] underline">Privacy Policy</Text>
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          disabled={!agreement}
          className={`py-3 rounded-lg ${agreement ? "bg-[#0784C9]" : "bg-gray-400"
            }`}
          onPress={handleSubmit(onSubmit)}
        >
          <Text className="text-center text-white font-semibold text-lg" >
            Register
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
