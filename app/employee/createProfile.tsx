import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from '@react-native-picker/picker';
import CheckBox from "expo-checkbox";
import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import RadioGroup from 'react-native-radio-buttons-group';
import { apiFunction } from "../api/apiFunction";
import { createEmpProfile, logOutApi } from "../api/api";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CreateProfileScreen() {
    const [steps, setSteps] = useState(0);
    const [show, setShow] = useState(false);
    const [experienceYears, setExperienceYears] = useState(0);
    const [experienceMonths, setExperienceMonths] = useState(0);

    const router = useRouter();


    const {
        handleSubmit,
        control,
        getValues,
        setValue,
        trigger,
        formState: { errors },
    } = useForm({
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            fullName: null,
            dob: null,
            gender: null,
            email: null,
            profileImage: null,
            whatsappUpdates: false,
            years: 0,
            months: 0,
            experiences:
                [
                    {
                        jobRole: null,
                        jobTitle: null,
                        currentSalary: null,
                        companyName: null,
                    },
                ],
            englishProficiency: null,
            otherLanguages: [],
            preferredShifts: [],
            preferredLocationTypes: [],
            prefferedEmploymentTypes: [],
            resume: null,
        },
    });


    const englishOptions = [
        { value: "basic", label: "Basic", description: "Can understand simple words" },
        { value: "intermediate", label: "Intermediate", description: "Can communicate casually" },
        { value: "fluent", label: "Fluent", description: "Comfortable in professional conversations" },
    ];

    const languages = ["Hindi", "Bengali", "Marathi", "Tamil", "Telugu"];
    const shiftOptions = ["Day", "Night", "Rotational"];
    const workplaceOptions = ["Office", "Hybrid", "Remote"];
    const employmentType = ["Full-time", "Part-time", "Contract"];

    // State for chip selections
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [selectedShift, setSelectedShifts] = useState([]);
    const [selectedWorkPlaces, setSelectedWorkPlaces] = useState([]);
    const [selectedEmploymentType, setSelectedEmploymentType] = useState([]);

    const toggleSelection = (name, item, selected, setSelected) => {

        if (selected.includes(item)) {
            setSelected(selected.filter((x) => x !== item));
            setValue(name, selected.filter((x) => x !== item))
        } else {

            setSelected([...selected, item]);
            setValue(name, [...selected, item]);
        }
    };

    const dob = getValues("dob");


    const firstStepValidation = (data: any) => {

        setSteps((prev) => prev + 1);
    };

    const radioButtons = useMemo(() => ([
        {
            id: '1',
            label: 'Male',
            value: 'Male'
        },
        {
            id: '2',
            label: 'Female',
            value: 'Female'
        },
        {
            id: '3',
            label: "Other",
            value: "Other"
        }
    ]), []);





    const onSubmit = async (data: any) => {
        console.log(data);
        
        const response = await apiFunction(createEmpProfile, null, data, "post", true);

        if (response?.status === 409) return Toast.show({
            type: "error",
            text1: "Employee already exist.",
            text2: "Please try Login again after logout."
        })
        if(response?.status === 500) return Toast.show({
            type: "error",
            text1:"Something Went Wrong.",
            text2: "Please try  again after some time."
        })
        if (response) {
            router.push("/employee/tab/(tabs)/home/home")
        }
    };

    // Logout Function
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

        // <KeyboardAvoidingView
        //     behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjusts view when keyboard opens
        //     keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Adjust this if header is hiding inputs
        //     style={{ flex: 1 }}>
        //     <ScrollView
        //         contentContainerStyle={{ paddingBottom: 0, }}
        //         keyboardShouldPersistTaps="handled"
        //         showsVerticalScrollIndicator={false} // Allows pressing outside input to dismiss keyboard
        //     >
        <View className="flex-1 bg-[#def3f9] mt-10">
            {/* Header */}
            <View className="flex flex-row justify-between items-center m-8">

                <TouchableOpacity
                    className="bg-[#003B70] px-4 py-2 rounded-full"
                    onPress={logout}
                >
                    <Text className="text-white font-medium">Logout</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjusts view when keyboard opens
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Adjust this if header is hiding inputs
                style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 0, }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false} // Allows pressing outside input to dismiss keyboard
                >

                    {/* Step 1 */}
                    {steps === 0 && (
                        <ScrollView contentContainerClassName="bg-white rounded-2xl shadow p-5 m-5 gap-4">
                            <Text className="text-lg font-semibold">Basic Details</Text>

                            {/* Full Name */}

                            <Controller
                                control={control}
                                name="fullName"
                                rules={{
                                    required: "Name is Require",
                                    minLength: {
                                        value: 4,
                                        message: "Name must be at least 4 characters long",
                                    },
                                }}
                                render={({ field: { onChange, onBlur, value } }) => {
                                    return (
                                        <>
                                            <TextInput
                                                placeholder="Full Name"
                                                cursorColor="#0784c9"
                                                enterKeyHint="next"
                                                value={value}
                                                placeholderTextColor="gray"
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                className="bg-white border border-[#0784c9] rounded p-4 text-gray-700"
                                            />
                                            {errors.fullName && (
                                                <Text className="text-red-500 text-sm">
                                                    {errors.fullName.message}
                                                </Text>
                                            )}

                                        </>
                                    )
                                }

                                }
                            />
                            {/* {errors.fullName && (
                                <Text className="text-red-500 text-sm">
                                    {errors.fullName.message}
                                </Text>
                            )} */}


                            {/* DOB */}

                            <Controller
                                control={control}
                                name="dob"
                                rules={{
                                    required: "Date of Birth is required",
                                    validate: (value) => {
                                        if (!value) return true;
                                        const dob = new Date(value);
                                        const today = new Date();
                                        const age = today.getFullYear() - dob.getFullYear();
                                        const monthDiff = today.getMonth() - dob.getMonth();

                                        // Adjust age if birthday hasn’t occurred yet this year
                                        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())
                                            ? age - 1
                                            : age;

                                        return actualAge >= 18 || "You must be at least 18 years old";
                                    },
                                }}
                                render={({ field: { onChange, value } }) => {

                                    return (
                                        <View className="bg-black-500">

                                            <TouchableOpacity className="bg-white border border-[#0784c9] rounded p-4" onPress={() => setShow(!show)}>

                                                <Text className={value ? "text-gray-700": "text-gray-500"}>{value ? value : "Date Of Birth"} </Text>

                                            </TouchableOpacity>

                                            {show &&
                                                <DateTimePicker
                                                    value={value ? new Date(value) : new Date()}
                                                    mode="date"
                                                    display="spinner"
                                                    textColor="#0784c9"
                                                    style={{ backgroundColor: "white" }}
                                                    onChange={(event, selectedDate) => {

                                                        if (event.type === "set") {
                                                            onChange(selectedDate?.toISOString().split("T")[0])

                                                        }
                                                        setShow(false);
                                                    }}
                                                />}

                                        </View>
                                    );
                                }}
                            />

                            {/* Error message */}
                            {errors.dob && (
                                <Text className="text-red-500 text-sm">{errors.dob.message}</Text>
                            )}

                            {/* Gender */}
                            <Text className="mt-2 font-medium">Gender</Text>
                            <Controller
                                control={control}
                                name="gender"
                                rules={{ required: true }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <>
                                        <RadioGroup
                                            radioButtons={radioButtons}
                                            onPress={(id) => {
                                                const selected = radioButtons.find(rb => rb.id === id);
                                                onChange(selected?.value);
                                                onBlur(selected?.value)
                                            }}
                                            containerStyle={{
                                                flexDirection: "row",
                                                justifyContent: "space-around",
                                            }}
                                            selectedId={
                                                radioButtons.find(rb => rb.value === value)?.id
                                            }
                                        />
                                        {errors.gender && (
                                            <Text className="text-red-500 text-sm">Gender is required</Text>
                                        )}
                                    </>
                                )}
                            />
                            {/* {errors.gender && (
                                <Text className="text-red-500 text-sm">Gender is required</Text>
                            )} */}

                            {/* Email */}
                            <Controller
                                control={control}
                                name="email"
                                rules={{
                                    required: "Email is required.",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Enter a valid email address",
                                    },
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <>
                                        <TextInput
                                            placeholder="Email"
                                            placeholderTextColor="gray"
                                            keyboardType="email-address"
                                            value={value}
                                            onChangeText={(text) => onChange(text.trim())}
                                            onBlur={onBlur}
                                            className="bg-white border border-[#0784c9] rounded p-4"
                                        />
                                        {errors?.email && (
                                            <Text className="text-red-500 text-sm">{errors.email?.message}</Text>
                                        )}
                                    </>
                                )}
                            />
                            {/* 
                            {errors.email && (
                                <Text className="text-red-500 text-sm">{errors.email.message}</Text>
                            )} */}

                            {/* WhatsApp Updates */}
                            <Controller
                                control={control}
                                name="whatsappUpdates"
                                render={({ field: { onChange, value } }) => (
                                    <View className="flex-row items-center my-2">
                                        <CheckBox
                                            value={value}
                                            className="bg-black"
                                            onValueChange={onChange}
                                            color={value ? '#0784c9' : "#00"}
                                        />
                                        <Text className="text-gray-700 ml-2">
                                            Send me job updates on WhatsApp
                                        </Text>
                                    </View>
                                )}
                            />


                            <TouchableOpacity className="bg-[#0784c9] flex items-center justify-center rounded-[50] py-2"

                                onPress={handleSubmit(firstStepValidation)}

                            ><Text className="text-white font-bold text-lg">Next</Text></TouchableOpacity>


                        </ScrollView>
                    )}

                    {/* Step 2 */}
                    {steps === 1 && (
                        <ScrollView className="rounded-2xl shadow p-6 m-5 bg-gray-100">
                            <Text className="text-lg font-semibold text-gray-800 mb-4">
                                Experience Details
                            </Text>

                            {/* Years + Months */}
                            <Text className="font-medium text-gray-800 mb-1">
                                Total Years of Experience
                            </Text>
                            <View className="flex-row gap-4">
                                {/* Years Dropdown */}
                                <Controller
                                    control={control}
                                    name="years"
                                    render={({ field: { onChange, value } }) => (
                                        <View className="bg-white w-40 rounded-xl">
                                            <Picker
                                                selectedValue={value}
                                                onValueChange={(itemValue, itemIndex) => {
                                                    onChange(itemValue);
                                                    setExperienceYears(itemIndex);
                                                }}
                                                mode="dropdown"
                                                itemStyle={{ backgroundColor: "white", maxHeight: "100px", color: "#0784c9", fontSize: 18 }}
                                                className="bg-white"
                                            >
                                                {Array.from({ length: 31 }, (_, i) => (
                                                    <Picker.Item key={i} label={`${i} Years`} value={i} />
                                                ))}
                                            </Picker>
                                        </View>
                                    )}
                                />


                                {/* Months Dropdown */}
                                <Controller
                                    control={control}
                                    name="months"

                                    render={({ field: { onChange, value } }) => (

                                        <View className="bg-white rounded-xl w-40">
                                            <Picker
                                                selectedValue={value}
                                                onValueChange={(itemValue, itemIndex) => {
                                                    onChange(itemValue);
                                                    setExperienceMonths(itemIndex);
                                                }}
                                                mode="dropdown"
                                                itemStyle={{ backgroundColor: "white", color: "#0784c9", fontSize: 18 }}
                                                className="bg-red"
                                            >
                                                {Array.from({ length: 11 }, (_, i) => (
                                                    <Picker.Item key={i} label={`${i} months`} value={i} />
                                                ))}
                                            </Picker>
                                        </View>
                                    )}
                                />
                            </View>


                            {(experienceYears !== 0 || experienceMonths !== 0) && (

                                <View className="mt-6">
                                    {/* Job Title */}
                                    <Controller
                                        control={control}
                                        name="experiences.0.jobTitle"
                                        rules={{
                                            required: "Job title is required",
                                            minLength: {
                                                value: 4,
                                                message: "Job title must be at least 4 characters long",
                                            },
                                        }}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <View className="mb-3">
                                                <View className="flex-row items-center mb-1">
                                                    <Text className="text-sm font-medium mb-1">Job Title</Text>
                                                    <Text className="text-red-500 text-sm ml-1">*</Text>
                                                </View>
                                                <TextInput
                                                    value={value ?? ""}
                                                    onChangeText={onChange}
                                                    onBlur={onBlur}
                                                    autoFocus={true}
                                                    placeholder="Enter your job title"
                                                    className="border border-gray-300 rounded-lg p-3"
                                                />
                                                {errors?.experiences?.[0]?.jobTitle && (
                                                    <Text className="text-red-500 text-xs mt-1">
                                                        {errors.experiences[0].jobTitle.message}
                                                    </Text>
                                                )}
                                            </View>
                                        )}
                                    />

                                    <View className="mb-3">
                                        <View className="flex-row item-center mb-1">
                                            <Text className="text-sm font-medium mb-1">Job Role</Text>
                                            <Text className="text-red-500 text-sm ml-1">*</Text>
                                        </View>
                                        <Controller
                                            control={control}
                                            name="experiences.0.jobRole"
                                            rules={{
                                                required: "Job Role is required",
                                                minLength: {
                                                    value: 4,
                                                    message: "Job Role must be at least 4 characters long",
                                                },
                                            }}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <>
                                                    <TextInput
                                                        value={value ?? ""}
                                                        autoFocus={true}
                                                        onChangeText={onChange}
                                                        onBlur={onBlur}
                                                        placeholder="Enter Job role"
                                                        className="border border-gray-300 rounded-lg p-3"
                                                    />{errors?.experiences?.[0]?.jobRole && (
                                                        <Text className="text-red-500 text-xs mt-1">
                                                            {errors?.experiences[0]?.jobRole.message}
                                                        </Text>
                                                    )}
                                                </>
                                            )}
                                        />

                                    </View>

                                    {/* Company Name */}
                                    <View className="mb-3">
                                        <View className="flex-row item-center mb-1">
                                            <Text className="text-sm font-medium mb-1">Company Name</Text>
                                            <Text className="text-red-500 text-sm ml-1">*</Text>
                                        </View>
                                        <Controller
                                            control={control}
                                            name="experiences.0.companyName"
                                            rules={{
                                                required: "Company name is required",
                                                minLength: {
                                                    value: 4,
                                                    message: "Company Name must be at least 4 characters long",
                                                },
                                            }}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <>
                                                    <TextInput
                                                        value={value ?? ""}
                                                        autoFocus={true}
                                                        onChangeText={onChange}
                                                        onBlur={onBlur}
                                                        placeholder="Enter company name"
                                                        className="border border-gray-300 rounded-lg p-3"
                                                    />
                                                    {errors?.experiences?.[0]?.companyName && (
                                                        <Text className="text-red-500 text-xs mt-1">
                                                            {errors?.experiences?.[0]?.companyName?.message}
                                                        </Text>
                                                    )}
                                                </>
                                            )}
                                        />

                                    </View>

                                    {/* Current Salary */}
                                    <View className="mb-3">
                                        <View className="flex-row item-center mb-1">
                                            <Text className="text-sm font-medium mb-1">Current Salary (Monthly)</Text>
                                            {/* <Text className="text-red-500 text-sm ml-1">*</Text> */}
                                        </View>
                                        <Controller
                                            control={control}
                                            name="experiences.0.currentSalary"
                                            rules={{
                                                validate: (value) => {
                                                    if (!value) return true;
                                                    if (value < 5000) return "Salary must be at least ₹5,000";
                                                    if (value > 1000000) return "Salary cannot exceed ₹10,00,000";
                                                    return true;
                                                },
                                            }}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <>
                                                    <TextInput
                                                        value={value?.toString() ?? ""}
                                                        onChangeText={(text) => onChange(Number(text))}
                                                        onBlur={onBlur}
                                                        placeholder="₹ Enter salary"
                                                        autoFocus={true}
                                                        keyboardType="numeric"
                                                        className="border border-gray-300 rounded-lg p-3"
                                                    />
                                                    {errors?.experiences?.[0]?.currentSalary && (
                                                        <Text className="text-red-500 text-xs mt-1">
                                                            {errors.experiences[0].currentSalary.message}
                                                        </Text>
                                                    )}
                                                </>
                                            )}
                                        />
                                    </View>

                                    {/* Salary info box */}
                                    <View className="bg-blue-100 p-3 rounded-lg">
                                        <Text className="text-blue-800 text-sm">
                                            <Text className="font-medium">Salary information is important,</Text>{" "}
                                            we use it only to show relevant jobs.
                                        </Text>
                                    </View>
                                </View>


                            )}

                            {/* Buttons */}
                            <View className="flex-row gap-4 mt-6">
                                <TouchableOpacity
                                    onPress={() => setSteps((prev) => prev - 1)}
                                    className="flex-1 bg-gray-300 py-3 rounded-lg"
                                >
                                    <Text className="text-center font-semibold text-gray-800">Back</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleSubmit((data) => {
                                        if (experienceYears === 0 && experienceMonths === 0) {
                                            setSteps((prev) => prev + 1);
                                            return;
                                        }

                                        // If all experience fields valid, proceed
                                        setSteps((prev) => prev + 1);
                                    })}
                                    className="flex-1 bg-[#0784c9] py-3 rounded-lg"
                                >
                                    <Text className="text-center font-semibold text-white">Next</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}

                    <ScrollView className="flex-1 p-6">
                        {steps === 2 && (
                            <View className="space-y-6">
                                <Text className="text-lg font-semibold">Preferred Language</Text>

                                {/* English proficiency (radio buttons) */}
                                <Text className="text-base font-medium my-2">English</Text>
                                <Controller
                                    name="englishProficiency"
                                    control={control}
                                    rules={{ required: "Proficiency is required" }}
                                    render={({ field: { onChange, value }, fieldState }) => (
                                        <View className="flex flex-col gap-3">
                                            {englishOptions.map((option) => (
                                                <TouchableOpacity
                                                    key={option.value}
                                                    className={`p-3 rounded-lg border ${value === option.value ? "bg-[#0784c9] border-blue-600" : "bg-white border-gray-300"
                                                        }`}
                                                    onPress={() => onChange(option.value)}
                                                >
                                                    <Text
                                                        className={`font-medium ${value === option.value ? "text-white" : "text-gray-800"
                                                            }`}
                                                    >
                                                        {option.label}
                                                    </Text>
                                                    {option.description && (
                                                        <Text
                                                            className={`text-sm ${value === option.value ? "text-gray-100" : "text-gray-500"
                                                                }`}
                                                        >
                                                            {option.description}
                                                        </Text>
                                                    )}
                                                </TouchableOpacity>
                                            ))}

                                            {fieldState?.error && (
                                                <Text className="text-red-500 text-sm">{fieldState.error.message}</Text>
                                            )}
                                        </View>
                                    )}
                                />

                                {/* Other Languages */}
                                <Text className="text-sm font-medium my-4">Select Languages</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {languages.map((lang) => {
                                        const isSelected = selectedLanguages.includes(lang);
                                        return (
                                            <TouchableOpacity
                                                key={lang}
                                                onPress={() => toggleSelection("otherLanguages", lang, selectedLanguages, setSelectedLanguages)}
                                                className={`px-4 py-2 rounded-full border ${isSelected ? "bg-[#0784c9] border-blue-600" : "bg-white border-gray-300"
                                                    }`}
                                            >
                                                <Text className={isSelected ? "text-white" : "text-gray-800"}>{lang}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* Navigation */}
                                <View className="flex-row gap-5 mt-6">
                                    <TouchableOpacity
                                        onPress={() => setSteps((prev) => prev - 1)}
                                        className="flex-1 py-3 bg-gray-300 rounded-lg"
                                    >
                                        <Text className="text-center font-semibold text-gray-800">Back</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={handleSubmit(() => setSteps((prev) => prev + 1))}
                                        className="flex-1 py-3 bg-[#0784c9] rounded-lg"
                                    >
                                        <Text className="text-center font-semibold text-white">Next</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {steps === 3 && (
                            <View className="flex flex-col gap-4">
                                <Text className="text-lg font-semibold">Preferred Shifts</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {shiftOptions.map((shift) => {
                                        const isSelected = selectedShift.includes(shift);
                                        return (
                                            <TouchableOpacity
                                                key={shift}
                                                onPress={() => toggleSelection("preferredShifts", shift, selectedShift, setSelectedShifts)}
                                                className={`px-4 py-2 rounded-full border ${isSelected ? "bg-[#0784c9] border-blue-600" : "bg-white border-gray-300"
                                                    }`}
                                            >
                                                <Text className={isSelected ? "text-white" : "text-gray-800"}>{shift}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                <Text className="text-lg font-semibold">Preferred Workplaces</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {workplaceOptions.map((place) => {
                                        const isSelected = selectedWorkPlaces.includes(place);
                                        return (
                                            <TouchableOpacity
                                                key={place}
                                                onPress={() => toggleSelection("preferredLocationTypes", place, selectedWorkPlaces, setSelectedWorkPlaces)}
                                                className={`px-4 py-2 rounded-full border ${isSelected ? "bg-[#0784c9] border-blue-600" : "bg-white border-gray-300"
                                                    }`}
                                            >
                                                <Text className={isSelected ? "text-white" : "text-gray-800"}>{place}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                <Text className="text-lg font-semibold">Preferred Employment Type</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {employmentType.map((type) => {
                                        const isSelected = selectedEmploymentType.includes(type);
                                        return (
                                            <TouchableOpacity
                                                key={type}
                                                onPress={() => toggleSelection("prefferedEmploymentTypes", type, selectedEmploymentType, setSelectedEmploymentType)}
                                                className={`px-4 py-2 rounded-full border ${isSelected ? "bg-[#0784c9] border-blue-600" : "bg-white border-gray-300"
                                                    }`}
                                            >
                                                <Text className={isSelected ? "text-white" : "text-gray-800"}>{type}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* Navigation */}
                                <View className="flex-row gap-5 mt-6">
                                    <TouchableOpacity
                                        onPress={() => setSteps((prev) => prev - 1)}
                                        className="flex-1 py-3 bg-gray-300 rounded-lg"
                                    >
                                        <Text className="text-center font-semibold text-gray-800">Back</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={handleSubmit(onSubmit)}
                                        className="flex-1 py-3 bg-[#0784c9] rounded-lg"
                                    >
                                        <Text className="text-center font-semibold text-white">Submit</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </ScrollView>

                </ScrollView>
            </KeyboardAvoidingView>
        </View >

    );
}
