import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployerProfile } from "../../Redux/getData";
import {
  gstVerify,
  postGstVerify,
  updateProfile,
} from "../../api/apiFunction";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";


const ProfileUpdate = () => {
  const [isDisabled, setIsDisabled] = useState(true);
  const [showGstInformation, setShowGstnformation] = useState(false);
  const [gstInformation, setGstInformation] = useState(null);
  const [user, setUser] = useState(null);
  const gstRef = useRef();
  const dispatch = useDispatch();


  useEffect(() => {
    dispatch(fetchEmployerProfile());
   const getUser = async () => {
    const userr = await AsyncStorage.getItem("User");
    if (userr) {
      setUser(JSON.parse(userr))
    }

  }
    getUser();

  }, [dispatch]);

  console.log("bgbdsh", user);
  const { employer } = useSelector((state) => state.getDataReducer);




  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: employer?.name || null,
      email: employer?.email || null,
      mobile: user?.phone || "Number not available.",
    },
  });






  useEffect(() => {
    if (employer) {
      reset({
        name: employer?.name,
        email: employer?.email,
        mobile: user?.phone,
      });
    }
  }, [employer]);


  const handleGstVerify = async (value) => {

    const response = await gstVerify(value);
    const token = await AsyncStorage.getItem('Token')



    if (response) {
      setGstInformation(response.data?.data?.taxpayerInfo);
      setShowGstnformation(true);
    } else {
      Toast.show({
        type: "error",
        text1: "Could not verify",
      });
    }
  };

  const handleGstCheckBox = async () => {
    const infoObj = {
      tradeNam: gstInformation?.tradeNam,
      rgdt: gstInformation?.rgdt,
      ctj: gstInformation?.ctj,
      lstupdt: gstInformation?.lstupdt,
      ctb: gstInformation?.ctb,
      dty: gstInformation?.dty,
      panNo: gstInformation?.panNo,
      gstin: gstInformation?.gstin,
      stjCd: gstInformation?.stjCd,
      ctjCd: gstInformation?.ctjCd,
      stj: gstInformation?.stj,
      cxdt: gstInformation?.cxdt,
      adadr: gstInformation?.adadr,
      einvoiceStatus: gstInformation?.einvoiceStatus,
      nba: gstInformation?.nba,
      sts: gstInformation?.sts,
      ntr: gstInformation?.pradr?.ntr,
      flno: gstInformation?.pradr?.addr?.flno,
      lt: gstInformation?.pradr?.addr?.lt,
      st: gstInformation?.pradr?.addr?.st,
      dst: gstInformation?.pradr?.addr?.dst,
      geocodelvl: gstInformation?.pradr?.addr?.geocodelvl,
      locality: gstInformation?.pradr?.addr?.locality,
      bnm: gstInformation?.pradr?.addr?.bnm,
      pncd: gstInformation?.pradr?.addr?.pncd,
      landMark: gstInformation?.pradr?.addr?.landMark,
      bno: gstInformation?.pradr?.addr?.bno,
      loc: gstInformation?.pradr?.addr?.loc,
      lg: gstInformation?.pradr?.addr?.lg,
      stcd: gstInformation?.pradr?.addr?.stcd,
    };

    if (gstInformation?.sts === "Active") {
      const response = await postGstVerify(gstInformation?.gstin, infoObj);
      if (response) {
        dispatch(fetchEmployerProfile());
      } else {
        Toast.show({
          type: "error",
          text1: "Could not verified",
        });
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Your GST is expired",
      });
    }
  };

  const onSubmit = async (data) => {
    setIsDisabled(true);
    const response = await updateProfile(data);
    if (response) {
      Toast.show({
        type: "success",
        text1: "Successfully Updated",
      });
      dispatch(fetchEmployerProfile());
    } else {
      Toast.show({
        type: "error",
        text1: "Could not updated",
      });
    }
  };

  return (

    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      className="flex-1  bg-[#DEF3F9]" // Removed padding from here
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView className="pl-10 pr-10 mt-5 mb-10" contentContainerStyle={{ flexGrow: 1 }}>
        <View
          className="bg-white rounded-md shadow-xl mb-5"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 20,
            elevation: 5,
            borderWidth: 1,
            borderColor: "rgba(7, 132, 201, 0.1)",
          }}
        >
          <View className="p-6">
            <View className="flex-row justify-between items-center ">
              <Text className="text-xl font-bold text-[#003B70]">Profile</Text>
              <TouchableOpacity
                onPress={() => {
                  if (isDisabled) {
                    setIsDisabled(false);
                  } else {
                    handleSubmit(onSubmit)();
                  }
                }}
                className="px-6 py-2 rounded-md transition-all duration-200"
                style={{ backgroundColor: "#0784C9" }}
              >
                <Text className="text-white text-sm font-medium">
                  {isDisabled ? "Edit" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
            <Text className="text-lg font-medium text-[#003B70] mb-4">
              Basic Details
            </Text>
            <View className="p-4">
              <View className="flex-col gap-6">
                <View>
                  <Text className="block text-sm font-medium mb-2 text-[#003B70]">
                    Name
                  </Text>
                  <Controller
                    control={control}
                    name="name"
                    rules={{ required: "Name is required" }}
                    render={({ field: { value, onChange } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        editable={!isDisabled}
                        placeholder="Enter name"
                        className={`w-full px-4 py-3 rounded-md border ${isDisabled ? "bg-gray-100" : "bg-white"
                          } ${errors.name ? "border-red-600" : "border-gray-300"}`}
                        style={{ color: "#003B70" }}
                      />
                    )}
                  />
                  {errors.name && (
                    <Text className="text-sm mt-1 text-red-600">
                      {errors.name?.message}
                    </Text>
                  )}
                </View>
                <View>
                  <Text className="block text-sm font-medium mb-2 text-[#003B70]">
                    Email
                  </Text>
                  <Controller
                    control={control}
                    name="email"
                    rules={{ required: "Email is required" }}
                    render={({ field: { value, onChange } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        editable={!isDisabled}
                        placeholder="Enter Email"
                        className={`w-full px-4 py-3 rounded-md border ${isDisabled ? "bg-gray-100" : "bg-white"
                          } ${errors.email ? "border-red-600" : "border-gray-300"}`}
                        style={{ color: "#003B70" }}
                      />
                    )}
                  />
                  {errors.email && (
                    <Text className="text-sm mt-1 text-red-600">
                      {errors.email?.message}
                    </Text>
                  )}
                </View>
                <View>
                  <Text className="block text-sm font-medium mb-2 text-[#003B70]">
                    Mobile
                  </Text>
                  <Controller
                    control={control}
                    name="mobile"
                    render={({ field: { value, onChange } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        editable={false}
                        placeholder="Enter name"
                        className={`w-full px-4 py-3 rounded-md border bg-gray-100 ${errors.mobile ? "border-red-600" : "border-gray-300"}`}
                        style={{ color: "#003B70" }}
                      />
                    )}
                  />
                  {/* {errors.mobile && (
                    <Text className="text-sm mt-1 text-red-600">
                      {errors.mobile?.message}
                    </Text>
                  )} */}
                </View>
              </View>
            </View>
            <View className="mt-2">
              <Text className="text-lg font-medium mt-6 mb-2 text-[#003B70]">
                GST Details
              </Text>
              <View className="flex-col gap-4">
                <View>
                  <Text className="block text-sm font-medium mb-2 text-[#003B70]">
                    GST No.
                  </Text>
                  <Controller
                    control={control}
                    name="gstin"
                    defaultValue={employer?.gstin || ""}
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        editable={!employer?.is_verified}
                        value={value}
                        onChangeText={onChange}
                        className="w-full px-4 py-3 rounded-md border transition-all duration-200"
                        style={{
                          borderColor: "#d1d5db",
                          backgroundColor: employer?.is_verified ? "#f9fafb" : "white",
                          color: employer?.is_verified ? "#6b7280" : "#003B70",

                        }}
                      />
                    )}
                  />
                </View>
                <View className="flex-col items-end">
                  <TouchableOpacity
                    onPress={() => handleGstVerify(getValues('gstin'))}
                    disabled={employer?.is_verified}
                    className={`w-full py-3 rounded-md text-sm font-medium transition-all duration-200 mt-2 ${employer?.is_verified
                      ? "bg-gray-200 border border-gray-300"
                      : "bg-transparent border-2 border-[#0784C9]"
                      }`}
                  >
                    <Text
                      className={`text-center font-medium ${employer?.is_verified ? "text-gray-500" : "text-[#0784C9]"
                        }`}
                    >
                      {employer?.is_verified ? "Verified" : "Verify"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {(showGstInformation || employer?.is_verified) && (
              <View className="mt-8">
                <View className="bg-gray-100 border border-gray-300 rounded-md p-4 mb-3">
                  <Text className="text-sm font-medium mb-2 text-gray-700">
                    We found following company details
                  </Text>
                  <Text className="text-sm">
                    <Text className="font-bold">Company name:</Text>{" "}
                    <Text className="text-blue-700 font-medium">
                      {gstInformation?.tradeName || employer?.GstDetail?.tradeName}
                    </Text>
                  </Text>
                  <Text className="text-sm mt-1">
                    <Text className="font-bold">Address:</Text>{" "}
                    {gstInformation?.pradr?.addr?.bno ||
                      employer?.GstDetail?.bno}{" "},{" "}
                    {gstInformation?.pradr?.addr?.bnm ||
                      employer?.GstDetail?.bnm}{" "},{" "}
                    {gstInformation?.pradr?.addr?.locality ||
                      employer?.GstDetail?.locality}{" "},{" "}
                    {gstInformation?.pradr?.addr?.dst ||
                      employer?.GstDetail?.dst}{" "},{" "}
                    {gstInformation?.pradr?.addr?.loc ||
                      employer?.GstDetail?.loc}{" "},{" "}
                    {gstInformation?.pradr?.addr?.stcd ||
                      employer?.GstDetail?.stcd}{" "},{" "}
                    {gstInformation?.pradr?.addr?.pncd ||
                      employer?.GstDetail?.pncd}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={!employer?.is_verified ? handleGstCheckBox : undefined}
                  disabled={employer?.is_verified}
                  className="flex-row items-center gap-2"
                >
                  <View
                    className={`w-5 h-5 rounded-md border border-gray-400 justify-center items-center ${employer?.is_verified ? "bg-blue-600" : "bg-white"
                      }`}
                  >
                    {employer?.is_verified && (
                      <Text className="text-white text-xs">✓</Text>
                    )}
                  </View>
                  <Text className="flex-1 text-sm text-gray-700">
                    I verify my company details and understand that the invoices
                    would be generated using the same information. {employer.is_verified}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>

  );
};



// styles for input for keybord

export default ProfileUpdate;