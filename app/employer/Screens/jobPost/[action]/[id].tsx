import { fetchEmployerProfile, fetchJobsById, setJobData } from '@/app/Redux/getData';
import { getCitiesApi, getEducationSuggestionsApi, getSkillsSuggestionsApi, jobPostApi, JobRoleSuggestionsApi } from '@/app/api/api';
import { apiFunction } from '@/app/api/apiFunction';
import { Picker } from "@react-native-picker/picker";
import Checkbox from 'expo-checkbox';
import { Award, Briefcase, ChevronDown, ChevronUp, Handshake, Locate, Pencil, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import { Chip, RadioButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';



const PERKS = [
    "Flexible Working Hours",
    "Weekly Payout",
    "Overtime Pay",
    "Joining Bonus",
    "Annual Bonus",
    "PF",
    "Travel Allowance (TA)",
    "Petrol Allowance",
    "Mobile Allowance",
    "Internet Allowance",
    "Laptop",
    "Health Insurance",
    "ESI (ESIC)",
    "Food/Meals",
    "Accommodation",
    "5 Working Days",
    "One-Way Cab",
    "Two-Way Cab",
];

const additionalSuggestions = {
    gender: ["Male", "Female", "Other"],
    distance: ["<10KM", "10-20KM", ">20KM"],
    languages: [
        "Assamese",
        "Bengali",
        "Bodo",
        "Dogri",
        "Gujarati",
        "Hindi",
        "Kannada",
        "Kashmiri",
        "Konkani",
        "Maithili",
        "Malayalam",
        "Manipuri",
        "Marathi",
        "Nepali",
        "Odia",
        "Punjabi",
        "Sanskrit",
        "Santali",
        "Sindhi",
        "Tamil",
        "Telugu",
        "Urdu",
    ],
    skills: ["Communication", "Sales", "Excel"],
    age: ["18-25", "26-35", "36+"],
}

const DetailRow = ({ label, value }) => (
    <View className="flex flex-row py-1">
        <Text className="w-1/3 text-gray-600 font-bold">{label}</Text>
        <Text className="w-2/3 text-gray-900">{value}</Text>
    </View>
);

const JobPost = () => {

    const dispatch = useDispatch();
    const [RoleSuggestion, setRoleSuggestion] = useState([]);
    const [specializationsuggestion, setSpecializationSuggestion] = useState([]);
    const [isGetAddress, setIsGetAddress] = useState(false);
    const [additional, setAdditional] = useState(null);
    const [skillsSuggestions, setSkillsuggestion] = useState([]);
    const [showDate, setShowDate] = useState(null);
    const [steps, setSteps] = useState(0);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(0);
    const [showJobDetailPreview, setShowJobDetailpreview] = useState(false);
    const [showCandidateRequirementsPreview, setShowCandidateRequirementPreview] = useState(false);
    const [shownterviewDetailPreview, setShowInterviewDetailPreview] = useState(false);
    const [showCompanyModal, setShowCompanyModal] = useState(null);
    const [selectedEmployees, setSelectedEmployees] = useState(null);
    const [isConsultancyCompany, setIsConsultancyCompany] = useState(false);
    const [showCompanyChangeOptions, setShowCompanyChangeOptions] = useState(false);
    const [radioValue, setRadioValue] = useState(null);
    const [skillValue, setSkillValue] = useState(null);
    const { id, action } = useLocalSearchParams();
    const router = useRouter();

    const { employer, jobsById } = useSelector((state) => state.getDataReducer)

    useEffect(() => {
        dispatch(fetchEmployerProfile())
    }, [dispatch]);

    useEffect(() => {
        if (id) {
            dispatch(fetchJobsById(id))

        }

    }, [id])





    const getSuggestions = async (api, val, func) => {
        console.log(val);

        try {
            const response = await apiFunction(api, [val], null, "get", true);
            if (response) {
                console.log("responsedata", response)
                func(response?.data ? response.data : response)
            }
        } catch (e) {
            Toast.show({
                type: "error",
                text1: "Suggestions",
                text2: "Could not get data"
            })
        }
    }




    const {
        handleSubmit,
        control,
        getValues,
        setValue,
        reset,
        watch,
        clearErrors,
        setError,
        formState: { errors },
    } = useForm({
        defaultValues: {
            companyName: employer?.company.companyName || "",
            jobTitle: null,
            jobRoles: null,
            jobType: employer?.jobType || "Full-Time",
            nightShift: "Day Shift",
            workLocationType: "onSite",
            location: null,
            state: null,
            city: null,
            pinCode: null,
            payType: "Fixed-only",
            minimumSalary: null,
            maximumSalary: null,
            incentive: null,
            perks: [],
            joiningFee: false,
            joiningFeeAmount: null,
            joiningFeeReason: null,
            joiningFeeReasonDetail: null,
            joiningFeeAmountTime: null,
            education: null,
            english: null,
            experience: null,
            experienceLevel: null,
            educationSpecialization: null,
            gender: null,
            age: null,
            languages: null,
            distance: null,
            skills: [],
            jobDescription: null,
            walkIn: false,
            walkInAddress: null,
            walkInStartDate: null,
            WalkInEndDate: null,
            walkInStartTime: null,
            walkInInstruction: null,
            contactPrefernece: null,
            otherRecruiterName: null,
            otherRecruiterNumber: null,
            otherRecruiterEmail: null,
            candidateType: null,
            notificationPreference: null,
        },
    });

    const getCurrentLocation = async () => {
        try {

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.log("Permission to access location was denied");
                return null;
            }


            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            console.log("Location:", location);

            let [address] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            setValue("walkInAddress", `${address.name}, ${address.city}, ${address.region}, ${address.country}`);
        } catch (error) {
            console.error("Error getting location:", error);
            return null;
        }
    };


    const handleLocation = async (val) => {
        if (val.length == 6) {
            try {
                const response = await apiFunction(getCitiesApi, ["pincode", val], null, "get", true);
                if (response && response.length > 0) {
                    clearErrors("pinCode");
                    const address = response[0];

                    setIsGetAddress(true);
                    setValue("state", address.state);
                    setValue("city", address.district);
                    setValue("pinCode", address.pincode);
                } else {
                    setIsGetAddress(false);
                    setValue("state", null);
                    setValue("city", null);
                    setError("pinCode", {
                        type: "manual",
                        message: "Not a Valid Pincode",
                    });
                }
            } catch (e) {
                setIsGetAddress(false);
                setError("pinCode", {
                    type: "manual",
                    message: "Could not fetch data",
                });
            }
        }
    }

    const secondStepSubmit = () => {
        console.log(watch("education"))
        if (!watch("education")) {
            setError("education", {
                type: "manual",
                message: "Education is Required",
            });
            return;
        }
        if (!watch("experience")) {
            setError("experience", {
                type: "manual",
                message: "Experience is Required",
            });
            return;
        }

        if (!watch("english")) {
            setError("english", {
                type: "manual",
                message: "English Level is Required",
            });
            return;
        }

        setSteps((prev) => prev + 1);
    };



    useEffect(() => {
        if (id && id !== "null") {
            if (jobsById) {
                const selectedJob = jobsById?.[0];


                reset({
                    companyName: employer?.company.companyName,
                    jobTitle: selectedJob?.jobTitle,
                    jobRoles: selectedJob.jobRoles,
                    jobType: selectedJob.jobType || "Full Time",
                    nightShift: selectedJob.nightShift,
                    workLocationType: selectedJob.workLocationType,
                    location: selectedJob.location,
                    payType: selectedJob.payType,
                    minimumSalary: selectedJob.minimumSalary,
                    maximumSalary: selectedJob.maximumSalary,
                    incentive: selectedJob.incentive,
                    perks: selectedJob?.perks
                        ? Array.isArray(selectedJob.perks)
                            ? selectedJob.perks
                            : JSON.parse(selectedJob.perks)
                        : [],
                    joiningFee: selectedJob.joiningFee,
                    joiningFeeAmount: selectedJob.joiningFeeAmount,
                    joiningFeeReason: selectedJob.joiningFeeReason,
                    joiningFeeReasonDetail: selectedJob.joiningFeeReasonDetail,
                    joiningFeeAmountTime: selectedJob.joiningFeeAmountTime,
                    education: selectedJob.education,
                    english: selectedJob.english,
                    experience: selectedJob.experience,
                    experienceLevel: selectedJob.experienceLevel,
                    educationSpecialization: selectedJob.educationSpecialization,
                    gender: selectedJob.gender,
                    age: selectedJob.age,
                    languages: selectedJob?.languages
                        ? Array.isArray(selectedJob.languages)
                            ? selectedJob.languages
                            : JSON.parse(selectedJob.languages)
                        : [],
                    distance: selectedJob.distance,
                    state: selectedJob.state,
                    city: selectedJob.city,
                    pinCode: selectedJob.pinCode,
                    skills: selectedJob?.skills
                        ? Array.isArray(selectedJob.skills)
                            ? selectedJob.skills
                            : JSON.parse(selectedJob.skills)
                        : [],
                    jobDescription: selectedJob.jobDescription,
                    walkIn: selectedJob.walkIn,
                    walkInAddress: selectedJob.walkInAddress,
                    walkInStartDate: selectedJob.walkInStartDate,
                    WalkInEndDate: selectedJob.WalkInEndDate,
                    walkInStartTime: selectedJob.walkInStartTime,
                    walkInInstruction: selectedJob.walkInInstruction,
                    contactPrefernece: selectedJob.contactPrefernece,
                    otherRecruiterName: selectedJob.otherRecruiterName,
                    otherRecruiterNumber: selectedJob.otherRecruiterNumber,
                    otherRecruiterEmail: selectedJob.otherRecruiterEmail,
                    candidateType: selectedJob.candidateType,
                    notificationPreference: selectedJob.notificationPreference,
                });

            }
        } else {
            reset({

                companyName: employer?.company.companyName || "",
                jobTitle: null,
                jobRoles: null,
                jobType: employer?.jobType || "Full-Time",
                nightShift: "Day Shift",
                workLocationType: "onSite",
                location: null,
                state: null,
                city: null,
                pinCode: null,
                payType: "Fixed-only",
                minimumSalary: null,
                maximumSalary: null,
                incentive: null,
                perks: [],
                joiningFee: false,
                joiningFeeAmount: null,
                joiningFeeReason: null,
                joiningFeeReasonDetail: null,
                joiningFeeAmountTime: null,
                education: null,
                english: null,
                experience: null,
                experienceLevel: null,
                educationSpecialization: null,
                gender: null,
                age: null,
                languages: null,
                distance: null,
                skills: [],
                jobDescription: null,
                walkIn: false,
                walkInAddress: null,
                walkInStartDate: null,
                WalkInEndDate: null,
                walkInStartTime: null,
                walkInInstruction: null,
                contactPrefernece: null,
                otherRecruiterName: null,
                otherRecruiterNumber: null,
                otherRecruiterEmail: null,
                candidateType: null,
                notificationPreference: null,

            })



        }
    }, [jobsById, id]);


    const onSubmit = async (data) => {

        let response;

        if (id !== "null") {
            if (action === "duplicate") {
                response = await apiFunction(jobPostApi, null, { jobId: id }, "post", true);
            } else {
                response = await apiFunction(jobPostApi, [id], data, "patch", true);
            }
        } else {

            response = await apiFunction(jobPostApi, null, data, "post", true);
        }


        if (response) {

            if (response === "plan") {
                dispatch(setJobData(data));
                router.push("/employer/Screens/SelectPlan");
            } else {
                Toast.show({
                    type: "success",
                    text1: "Post Job",
                    text2: "Job Post Succesfully"
                })

                router.push("/employer/tab/(tabs)/Jobs");
            }
        } else {
            Toast.show({
                type: "error",
                text1: "Post Job",
                text2: "could not Post job"
            })
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            className="flex-1  bg-[#DEF3F9]"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 100}
        >


            <ScrollView>

                <View className='flex flex-col justify-center ml-4 items-start mt-2'>

                    {/* step 1 */}
                    {steps === 0 && <View>

                        {/* company name */}
                        <View className='flex flex-col justify-start items-start'>
                            <Text className='text-lg font-bold text-left'>Enter the Company Name</Text>
                            <Controller
                                name='companyName'
                                rules={{ required: "Company is required" }}
                                control={control}
                                render={({ field }) => {
                                    return (
                                        <View className='flex flex-row gap-2 justify-start mt-2 items-center'>
                                            <TextInput
                                                placeholder='Enter Company Name'
                                                value={field.value}
                                                editable={false}
                                                className='w-2/3 border pl-2 border-gray-500 rounded'

                                            />

                                            <TouchableOpacity onPress={() => setShowCompanyChangeOptions(true)} className='bg-[#0784c9] flex rounded-lg px-4 py-2'><Text className='text-white font-bold text-lg'>Change</Text></TouchableOpacity>
                                            {errors.companyName && <Text>{errors.companyName.message}</Text>}
                                        </View>
                                    )
                                }}
                            />
                        </View>


                        {/* jobTitle */}

                        <View className='flex flex-col justify-center items-start mt-4'>

                            <Text className='text-lg font-bold text-left'>Enter the Job Title <Text className='text-red-500'>*</Text></Text>

                            <Controller
                                name='jobTitle'
                                control={control}
                                rules={{ required: "JobTitle is required" }}
                                render={({ field }) => {
                                    return (
                                        <View className='flex flex-col gap-2 justify-start mt-2 items-start'>
                                            <TextInput
                                                placeholder='Enter Job Title'
                                                value={field.value}
                                                className='w-[90vw] border pl-2 border-gray-500 rounded'
                                                onChange={({ nativeEvent: { text } }) => field.onChange(text)}
                                            />
                                            {errors.jobTitle && <Text className='text-red-500 text-sm '>{errors.jobTitle.message}</Text>}

                                        </View>
                                    )
                                }}
                            />

                        </View>



                        {/* job Role */}

                        <View className='flex flex-col w-[90vw] justify-center items-start mt-4'>

                            <Text className='text-lg font-bold text-left'>Choose the Job Roles <Text className='text-red-500'>*</Text></Text>

                            <Controller
                                name="jobRoles"
                                control={control}
                                rules={{ required: "JobRole is Required" }}
                                render={({ field }) => (
                                    <View className='w-full'>

                                        <Autocomplete
                                            data={RoleSuggestion?.filter(
                                                (item) => !field?.value?.includes(item)
                                            )}
                                            value={field.value}
                                            
                                            onChangeText={(text) => getSuggestions(JobRoleSuggestionsApi, text, setRoleSuggestion)}
                                            flatListProps={{
                                                keyExtractor: (_, i) => i.toString(),
                                                renderItem: ({ item }) => (
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            field.onChange(item)
                                                            setRoleSuggestion([]);

                                                        }}
                                                        className="p-2 border-b border-gray-200"
                                                    >
                                                        <Text>{item}</Text>
                                                    </TouchableOpacity>
                                                ),
                                            }}
                                            inputContainerStyle={{
                                                backgroundColor: "white",
                                                borderWidth: 1,
                                                borderColor: "#ccc",
                                                borderRadius: 8,
                                                paddingHorizontal: 8,
                                            }}
                                            listContainerStyle={{
                                                backgroundColor: "white",
                                                borderWidth: 1,
                                                borderColor: "#ccc",
                                                borderRadius: 8,
                                                marginTop: 2,
                                            }}
                                        />

                                        {errors.jobRoles && <Text className='text-red-500 text-sm '>{errors.jobRoles.message}</Text>}

                                    </View>
                                )}

                            />

                        </View>

                        {/* job Type */}


                        <View className='flex flex-col justify-center items-start mt-4'>

                            <Text className='text-lg font-bold text-left'>Type Of Job</Text>

                            <Controller
                                name="jobType"
                                control={control}
                                render={({ field }) => (
                                    <RadioButton.Group
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                        }}
                                        value={field.value}

                                    >
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                flexWrap: "wrap",
                                                alignItems: "center",
                                            }}
                                        >

                                            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}>
                                                <RadioButton color='#0784c9' value="Full-Time" />
                                                <Text>Full Time</Text>
                                            </View>
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <RadioButton color='#0784c9' value="Part-Time" />
                                                <Text>Part Time</Text>
                                            </View>
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <RadioButton color='#0784c9' value="internship" />
                                                <Text>Internship</Text>
                                            </View>
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <RadioButton color='#0784c9' value="contract" />
                                                <Text>Contract</Text>
                                            </View>
                                        </View>
                                    </RadioButton.Group>
                                )}
                            />

                        </View>

                        {/* shift Type */}

                        <View className='flex flex-col justify-center items-start mt-4'>

                            <Text className='text-lg font-bold text-left'>Shift Type</Text>
                            <Controller
                                name="nightShift"
                                control={control}
                                render={({ field }) => (
                                    <View className='flex flex-row gap-2 mt-2 justify-center items-center'>
                                        <Checkbox color={"#0784c9"} value={field?.value === "Night Shift"} onValueChange={(val) => field.onChange(val ? "Night Shift" : "Day Shift")}></Checkbox>
                                        <Text className='text-black-500 text-md '>Is this a night shift job</Text>
                                    </View>
                                )}
                            />

                        </View>

                        {/* work location type */}

                        <View >

                            <View className='flex flex-col justify-center items-start mt-4'>

                                <Text className='text-lg font-bold text-left'>Work Location Type</Text>

                                <Controller
                                    name=" workLocationType"
                                    control={control}
                                    render={({ field }) => (
                                        <RadioButton.Group
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                            }}
                                            value={field.value}
                                        >
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    flexWrap: "wrap",
                                                    alignItems: "center",
                                                }}
                                            >

                                                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}>
                                                    <RadioButton color='#0784c9' value="onSite" />
                                                    <Text>On-Site</Text>
                                                </View>
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <RadioButton color='#0784c9' value="remote" />
                                                    <Text>Remote</Text>
                                                </View>
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <RadioButton color='#0784c9' value="hybrid" />
                                                    <Text>Hybrid</Text>
                                                </View>
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <RadioButton color='#0784c9' value="field-work" />
                                                    <Text>Field-Work</Text>
                                                </View>
                                            </View>
                                        </RadioButton.Group>
                                    )}
                                />

                            </View>

                            {/* locaation */}
                            <Controller
                                name='location'
                                control={control}
                                render={({ field }) => {
                                    return (

                                        <View className='flex flex-col justify-center items-start mt-4'>

                                            <Text className='text-lg font-bold text-left'>Enter Flat/Street No.</Text>
                                            <TextInput
                                                onChange={({ nativeEvent: { text } }) => field.onChange(text)}
                                                value={field.value}
                                                className='border border-gray-500 w-[90vw] rounded-lg'
                                            />
                                        </View>
                                    )
                                }}
                            />

                            {/* pincode */}

                            <Controller
                                name='pinCode'
                                control={control}
                                rules={{
                                    required: "PinCode is required",
                                    pattern: {
                                        value: /^\d{6}$/,
                                        message: "PinCode must be exactly 6 digits",
                                    },
                                }}
                                render={({ field }) => {
                                    return (

                                        <View className='flex flex-col justify-center items-start mt-4'>

                                            <Text className='text-lg font-bold text-left'>Enter PinCode No. <Text className='text-red-500'>*</Text></Text>
                                            <TextInput
                                                onChange={({ nativeEvent: { text } }) => {

                                                    if (text.length === 6) {

                                                        handleLocation(text)

                                                    }
                                                    else {

                                                        setValue("city", null);
                                                        setValue("state", null);
                                                        setIsGetAddress(false);
                                                    }

                                                    field.onChange(text)
                                                }}
                                                inputMode='numeric'
                                                keyboardType='number-pad'
                                                value={field.value}
                                                className='border border-gray-500 w-[90vw] rounded-lg'
                                            />
                                            {errors.pinCode && <Text className='text-red-500 text-sm '>{errors.pinCode.message}</Text>}

                                        </View>
                                    )
                                }}
                            />

                            {/* state */}

                            {isGetAddress &&
                                <View className='flex flex-row gap-4 '>
                                    <Controller
                                        name='state'
                                        control={control}

                                        render={({ field }) => {
                                            return (

                                                <View className='flex flex-col justify-center items-start mt-4'>

                                                    <Text className='text-lg font-bold text-left'>City</Text>
                                                    <TextInput
                                                        editable={false}
                                                        value={field.value}
                                                        onChange={({ nativeEvent: { text } }) => field.onChange(text)}
                                                        className='border border-gray-500 px-4 rounded-lg'
                                                    />
                                                </View>
                                            )
                                        }}
                                    />


                                    {/* city */}
                                    <Controller
                                        name='city'
                                        control={control}
                                        render={({ field }) => {
                                            return (

                                                <View className='flex flex-col justify-center items-start mt-4'>

                                                    <Text className='text-lg font-bold text-left'>State</Text>
                                                    <TextInput
                                                        editable={false}
                                                        value={field.value}
                                                        onChange={({ nativeEvent: { text } }) => field.onChange(text)}
                                                        className='border border-gray-500 px-4 rounded-lg'
                                                    />
                                                </View>
                                            )
                                        }}
                                    />
                                </View>
                            }

                        </View>


                        <View className='flex flex-col justify-center items-start mt-4'>

                            <Text className='text-lg font-bold text-left'>Job Type</Text>
                            <Controller
                                name="payType"
                                control={control}
                                defaultValue={"Fixed-only"}
                                render={({ field }) => (
                                    <RadioButton.Group
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                        }}
                                        value={field.value}
                                    >
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                flexWrap: "wrap",
                                                alignItems: "center",
                                            }}
                                        >

                                            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}>
                                                <RadioButton color='#0784c9' value="Fixed-only" />
                                                <Text>Fixed Only</Text>
                                            </View>
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <RadioButton color='#0784c9' value="Fixed+Incentive" />
                                                <Text>Fixed+Incentive</Text>
                                            </View>
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <RadioButton color='#0784c9' value="Fixed+variable" />
                                                <Text>Fixed+Variable</Text>
                                            </View>
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <RadioButton color='#0784c9' value="incentive" />
                                                <Text>Incentive</Text>
                                            </View>
                                        </View>
                                    </RadioButton.Group>
                                )}
                            />

                        </View>

                        <View className='flex flex-col justify-center items-start mt-4'>

                            <Text className='text-lg font-bold text-left'>Enter Monthly salary</Text>

                            <View className='flex flex-row gap-2 justify-center items-center'>
                                {(watch("payType") !== "incentive") &&
                                    <View className='flex flex-row gap-2'>
                                        <Controller
                                            name='minimumSalary'
                                            control={control}
                                            rules={{
                                                required: "Minimum Salary is required",
                                                pattern: {
                                                    value: /^[0-9]+$/,
                                                    message: "Only numeric values are allowed",
                                                },
                                                validate: (value) => {
                                                    const numericValue = Number(value);
                                                    if (numericValue < 3000)
                                                        return "Minimum salary should be at least ₹3000";
                                                    if (numericValue > 150000)
                                                        return "Salary cannot exceed ₹1.5 Lakh";
                                                    return true;
                                                },
                                            }}
                                            render={({ field }) => {
                                                return (

                                                    <View className='w-[30vw]'>
                                                        <View>
                                                            <Text>Enter Your Minimum Salary<Text className='text-red-500'>*</Text></Text>
                                                        </View>
                                                        <TextInput
                                                            onChange={({ nativeEvent: { text } }) => { field.onChange(text) }}
                                                            keyboardType="number-pad"
                                                            inputMode='numeric'
                                                            value={field.value}
                                                            className='border border-gray-500 rounded-lg'
                                                        />
                                                        {errors.minimumSalary && <Text className='text-red-500 text-sm '>{errors.minimumSalary.message}</Text>}

                                                    </View>
                                                )
                                            }}
                                        />

                                        <Controller
                                            name='maximumSalary'
                                            control={control}
                                            rules={{
                                                required: "Maximum Salary is required",
                                                pattern: {
                                                    value: /^[0-9]+$/,
                                                    message: "Only numeric values are allowed",
                                                },
                                                validate: (value) => {
                                                    const numericValue = Number(value);
                                                    const minSalary = Number(getValues("minimumSalary"));
                                                    if (numericValue < 3000)
                                                        return "Maximum salary should be at least ₹3000";
                                                    if (numericValue > 1000000)
                                                        return "Salary cannot exceed ₹10 lakh";
                                                    if (minSalary && numericValue <= minSalary) {
                                                        return "Maximum salary must be greater than minimum salary";
                                                    }
                                                    return true;
                                                },
                                            }}
                                            render={({ field }) => {
                                                return (

                                                    <View className='w-[30vw]'>
                                                        <View >
                                                            <Text>Enter Your Maximum Salary<Text className='text-red-500'>*</Text></Text>
                                                        </View>
                                                        <TextInput
                                                            onChange={({ nativeEvent: { text } }) => { field.onChange(text) }}
                                                            keyboardType="number-pad"
                                                            value={field.value}
                                                            className='border border-gray-500 rounded-lg'
                                                        />
                                                        {errors.maximumSalary && <Text className='text-red-500 text-sm '>{errors.maximumSalary.message}</Text>}

                                                    </View>
                                                )
                                            }}
                                        />
                                    </View>
                                }

                                {(watch("payType") !== "Fixed-only") &&
                                    <Controller
                                        name='incentive'
                                        control={control}
                                        rules={{
                                            required: "Incentive is required",
                                            pattern: {
                                                value: /^[0-9]+$/,
                                                message: "Only numeric values are allowed",
                                            },
                                        }}
                                        render={({ field }) => {
                                            return (

                                                <View className='w-[30vw]'>
                                                    <View>
                                                        <Text>Enter Your Incentive<Text className='text-red-500'>*</Text></Text>
                                                    </View>
                                                    <TextInput
                                                        onChange={(text) => { field.onChange(text) }}
                                                        keyboardType="number-pad"
                                                        value={field.value}
                                                        className='border border-gray-500 rounded-lg'
                                                    />
                                                    {errors.incentive && <Text className='text-red-500 text-sm '>{errors.incentive.message}</Text>}

                                                </View>
                                            )
                                        }}
                                    />}

                            </View>

                        </View>

                        {/* perks */}

                        <View >
                            <Text className='text-lg font-bold text-left mt-4'>Additional Perks</Text>
                            <Controller
                                name="perks"
                                control={control}
                                defaultValue={[]} // make sure it's an array
                                render={({ field: { value, onChange } }) => (
                                    <FlatList
                                        data={PERKS}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        style={{ maxHeight: 40 }}
                                        keyExtractor={(item) => item}
                                        renderItem={({ item }) => {
                                            const isSelected = value?.includes(item);

                                            return (
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        if (isSelected) {
                                                            onChange(value.filter((perk) => perk !== item));
                                                        } else {
                                                            onChange([...(value || []), item]);
                                                        }
                                                    }}
                                                    className={`px-3 py-1 m-1 rounded-md border ${isSelected
                                                        ? "bg-blue-500 border-blue-500"
                                                        : "bg-white border-gray-300"
                                                        }`}
                                                >
                                                    <Text
                                                        className={`text-sm ${isSelected ? "text-white" : "text-gray-700"
                                                            }`}
                                                    >
                                                        {item}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        }}
                                    />
                                )}
                            />
                        </View>



                        <View className='flex flex-col justify-center items-start mt-4'>

                            <Text className='text-lg font-bold text-left'>Is there any Joining Fees or Deposits required by the candidate</Text>

                            <Controller
                                name="joiningFee"
                                control={control}
                                defaultValue={false}
                                render={({ field }) => (
                                    <RadioButton.Group
                                        onValueChange={(val) => {

                                            field.onChange(val);

                                        }}
                                        value={field.value}
                                    >
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                flexWrap: "wrap",
                                                alignItems: "center",
                                            }}
                                        >
                                            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}>
                                                <RadioButton color='#0784c9' value={true} />
                                                <Text>Yes</Text>
                                            </View>
                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                <RadioButton color='#0784c9' value={false} />
                                                <Text>No</Text>
                                            </View>
                                        </View>
                                    </RadioButton.Group>
                                )}
                            />

                        </View>

                        {/* joiningFees */}
                        {watch("joiningFee") &&
                            <View>
                                <Controller
                                    name='joiningFeeAmount'
                                    control={control}
                                    rules={{
                                        required: "Amount is Required",
                                        pattern: {
                                            value: /^[0-9]+$/,
                                            message: "Only numeric values are allowed",
                                        },
                                        validate: (value) =>
                                            value <= 10000 || "Amount must be 10000 or less",
                                    }}
                                    render={({ field }) => {
                                        return (

                                            <View className='flex flex-col justify-center items-start mt-4'>

                                                <Text className='text-lg font-bold text-left'>Enter the Joining Fees Amount<Text className='text-red-500'>*</Text></Text>
                                                <TextInput
                                                    onChange={({ nativeEvent: { text } }) => { field.onChange(text) }}
                                                    keyboardType="number-pad"
                                                    inputMode='numeric'
                                                    value={field.value}
                                                    className='border border-gray-500 w-[90vw] rounded-lg'
                                                />
                                                {errors.joiningFeeAmount && <Text className='text-red-500 text-sm '>{errors.joiningFeeAmount.message}</Text>}

                                            </View>
                                        )
                                    }}
                                />

                                <Text className='text-lg font-bold text-left mt-4'>  Why is this Joining Fees for?</Text>
                                <FlatList
                                    data={[
                                        "inventory-charge",
                                        "security-deposit",
                                        "registration-fees",
                                        "commission",
                                        "Training/Certification",
                                        "other-reason",
                                    ]}
                                    horizontal
                                    style={{ maxHeight: 40 }}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setValue("joiningFeeReason", item);

                                            }}
                                            className={`px-3 py-1 m-1 rounded-md border ${watch("joiningFeeReason") === item
                                                ? "bg-blue-500 border-blue-500"
                                                : "bg-white border-gray-300"
                                                }`}
                                        >
                                            <Text
                                                className={`text-sm ${watch("joiningFeeReason") === item ? "text-white" : "text-gray-700"
                                                    }`}
                                            >
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />

                                {(watch("joiningFeeReason") === "inventory-charge" || watch("joiningFeeReason") === "registration-fees" || watch("joiningFeeReason") === "other-reason") &&
                                    <Controller
                                        name='joiningFeeReasonDetail'
                                        control={control}
                                        rules={{ required: "Fees Reason is required" }}
                                        render={({ field }) => {
                                            return (

                                                <View className='flex flex-col justify-center items-start mt-4'>

                                                    <Text className='text-lg font-bold text-left'>Mention {watch("joiningFeeReason")} Here <Text className='text-red-500'>*</Text></Text>
                                                    <TextInput
                                                        onChange={({ nativeEvent: { text } }) => { field.onChange(text) }}
                                                        value={field.value}
                                                        className='border border-gray-500 w-[90vw] rounded-lg'
                                                    />
                                                    {errors.joiningFeeReasonDetail && <Text className='text-red-500 text-sm '>{errors.joiningFeeReasonDetail.message}</Text>}

                                                </View>
                                            )
                                        }}
                                    />}



                                <Text className='text-lg font-bold text-left mt-4'> When should the fee be paid?</Text>
                                <FlatList
                                    data={[
                                        "before-interview",
                                        "after-interview",
                                        "deducted-from-salary",
                                    ]}
                                    horizontal
                                    style={{ maxHeight: 40 }}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setValue("joiningFeeAmountTime", item);

                                            }}
                                            className={`px-3 py-1 m-1 rounded-md border ${watch("joiningFeeAmountTime") === item
                                                ? "bg-blue-500 border-blue-500"
                                                : "bg-white border-gray-300"
                                                }`}
                                        >
                                            <Text
                                                className={`text-sm ${watch("joiningFeeAmountTime") === item ? "text-white" : "text-gray-700"
                                                    }`}
                                            >
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />





                            </View>}

                        <TouchableOpacity onPress={handleSubmit(() => { setSteps((prev) => prev + 1) })} className='bg-[#0784c9] rounded-lg p-2 px-2 justify-center items-center mt-4 w-[90vw] mb-10'><Text className='text-white font-bold text-lg'>Continue</Text></TouchableOpacity>
                    </View>}


                    {/* step 2 */}
                    {steps === 1 &&



                        <ScrollView>

                            {/* education */}

                            <View className='flex flex-col justify-center items-start mt-4'>

                                <Text className='text-lg font-bold text-left'>Minimum Education <Text className='text-red-500'>*</Text></Text>

                                <FlatList
                                    data={[
                                        "10th_or_Below_10th",
                                        "12th_Pass",
                                        "Diploma_Categories",
                                        "ITI",
                                        "Graduate",
                                        "Postgraduate",
                                        "Professional_Certification",
                                    ]}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={{ maxHeight: 40 }}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (

                                        <TouchableOpacity
                                            onPress={() => {
                                                console.log(item)
                                                setValue("education", item);
                                                clearErrors("education")
                                                getSuggestions(getEducationSuggestionsApi, item, setSpecializationSuggestion)
                                            }}
                                            className={`px-3 py-1 m-1 rounded-md border ${watch("education") === item
                                                ? "bg-blue-500 border-blue-500"
                                                : "bg-white border-gray-300"
                                                }`}
                                        >
                                            <Text
                                                className={`text-sm ${watch("education") === item ? "text-white" : "text-gray-700"
                                                    }`}
                                            >
                                                {item}
                                            </Text>
                                        </TouchableOpacity>


                                    )}
                                />
                                {errors.education && <Text className='text-red-500 text-sm '>{errors.education.message}</Text>}
                            </View>

                            {/* educationSpecialization */}

                            <View className='flex flex-col justify-center items-start mt-4'>

                                <Text className='text-lg font-bold text-left'>Specialization</Text>


                                <Controller
                                    name="educationSpecialization"
                                    control={control}
                                    render={({ field }) => (
                                        <View className='w-[90vw]'>

                                            <Autocomplete
                                                data={specializationsuggestion?.filter(
                                                    (item) => !field?.value?.includes(item)
                                                )}
                                               value={field.value}
                                                onFocus={() => setSpecializationSuggestion(specializationsuggestion)}
                                                flatListProps={{
                                                    nestedScrollEnabled: true,
                                                    keyExtractor: (_, i) => i.toString(),
                                                    renderItem: ({ item }) => (
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                field.onChange(item)
                                                                setSpecializationSuggestion([]);

                                                            }}
                                                            className="p-2 border-b border-gray-200"
                                                        >
                                                            <Text>{item}</Text>
                                                        </TouchableOpacity>
                                                    ),
                                                }}
                                                inputContainerStyle={{
                                                    backgroundColor: "white",
                                                    borderWidth: 1,
                                                    borderColor: "#ccc",
                                                    borderRadius: 8,
                                                    paddingHorizontal: 8,
                                                }}
                                                listContainerStyle={{
                                                    backgroundColor: "white",
                                                    borderWidth: 1,
                                                    borderColor: "#ccc",
                                                    borderRadius: 8,
                                                    marginTop: 2,
                                                }}
                                            />

                                        </View>
                                    )}

                                />

                            </View>



                            {/* english */}

                            <View className='flex flex-col justify-center items-start mt-4'>

                                <Text className='text-lg font-bold text-left'>English Level <Text className='text-red-500'>*</Text></Text>

                                <FlatList
                                    data={["Basic", "Intermediate", "Advanced"]}
                                    horizontal
                                    style={{ maxHeight: 40 }}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setValue("english", item);
                                                clearErrors("english")
                                            }}
                                            className={`px-3 py-1 m-1 rounded-md border ${watch("english") === item
                                                ? "bg-blue-500 border-blue-500"
                                                : "bg-white border-gray-300"
                                                }`}
                                        >
                                            <Text
                                                className={`text-sm ${watch("english") === item ? "text-white" : "text-gray-700"
                                                    }`}
                                            >
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />
                                {errors.english && <Text className='text-red-500 text-sm '>{errors.english.message}</Text>}
                            </View>

                            {/* experience */}
                            <View className='flex flex-col justify-center items-start mt-4'>

                                <Text className='text-lg font-bold text-left'>Total Experience Required<Text className='text-red-500'>*</Text></Text>

                                <FlatList
                                    data={["Any", "Experienced Only", "Fresher Only"]}
                                    horizontal
                                    style={{ maxHeight: 40 }}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setValue("experience", item);
                                                if (item !== "Experienced Only") {
                                                    setValue("experienceLevel", null)
                                                }

                                                clearErrors("experience")

                                            }}
                                            className={`px-3 py-1 m-1 rounded-md border ${watch("experience") === item
                                                ? "bg-blue-500 border-blue-500"
                                                : "bg-white border-gray-300"
                                                }`}
                                        >
                                            <Text
                                                className={`text-sm ${watch("experience") === item ? "text-white" : "text-gray-700"
                                                    }`}
                                            >
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />

                                {errors.experience && <Text className='text-red-500 text-sm '>{errors.experience.message}</Text>}

                            </View>


                            {(watch("experience") === "Experienced Only") &&
                                <Controller
                                    name="experienceLevel"
                                    control={control}
                                    render={({ field }) => (
                                        <View className='flex flex-col'>
                                            <View className="flex flex-row w-full justify-start mt-2 items-center gap-2">
                                                <View className="bg-white w-[40vw] h-10 justify-center rounded-lg border border-gray-500">
                                                    <Picker
                                                        selectedValue={min}
                                                        onValueChange={(itemValue) => {
                                                            setMin(itemValue);
                                                            if (itemValue && max) {
                                                                field.onChange(`${itemValue}- ${max}`);
                                                            }
                                                        }}
                                                    >
                                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]?.map((item, index) => (
                                                            <Picker.Item key={index} value={item} label={`${item} yrs`} />
                                                        ))}
                                                    </Picker>
                                                </View>

                                                <View className="bg-white w-[40vw] h-10 justify-center rounded-lg border border-gray-500">
                                                    <Picker
                                                        selectedValue={max}
                                                        onValueChange={(itemValue) => {
                                                            if (itemValue < min) {
                                                                setError("experienceLevel", { type: "manual", message: "Maximum experience must be greater then minimum Experience" })
                                                                return
                                                            } else {
                                                                setMax(itemValue);
                                                                if (min && itemValue) {
                                                                    field.onChange(`${min}- ${itemValue}`);
                                                                }
                                                            }

                                                        }}
                                                    >
                                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ">10"]?.map((item, index) => (
                                                            <Picker.Item key={index} value={item} label={`${item} yrs`} />
                                                        ))}
                                                    </Picker>
                                                </View>

                                            </View>
                                            {errors.experienceLevel && <Text className='text-red-500 text-sm '>{errors.experienceLevel.message}</Text>}
                                        </View>
                                    )}
                                />
                            }




                            <View className='flex flex-col justify-center items-start mt-4'>

                                <Text className='text-lg font-bold text-left'>Additional Requirements</Text>

                                <FlatList
                                    data={[{ val: "gender", lab: "Gender" },
                                    { val: "age", lab: "Age" },
                                    { val: "distance", lab: "Distance" },
                                    { val: "languages", lab: "Languages" },
                                    { val: "skills", lab: "Skills" }]}
                                    horizontal
                                    style={{ maxHeight: 40 }}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={(item) => item.val}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setAdditional(item?.val);


                                            }}
                                            className={`px-3 py-1 m-1 rounded-md border ${additional === item?.val
                                                ? "bg-blue-500 border-blue-500"
                                                : "bg-white border-gray-300"
                                                }`}
                                        >
                                            <Text
                                                className={`text-sm ${additional === item?.val ? "text-white" : "text-gray-700"
                                                    }`}
                                            >
                                                {item.lab}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />

                                {(additional && additional !== "skills") &&
                                    <View className='bg-white w-[90vw] border border-gray-500 rounded-lg mt-2 '>
                                        <Picker onValueChange={(itemValue) => setValue(additional, itemValue)}>
                                            {additionalSuggestions[additional]?.map((item, index) => (
                                                <Picker.Item key={index} value={item} label={item} />
                                            ))}
                                        </Picker>
                                    </View>
                                }

                                {additional === "skills" &&
                                    <Controller
                                        name="skills"
                                        control={control}
                                        render={({ field }) => (
                                            <View className='w-[90vw]'>
                                                <View className="flex-row flex-wrap gap-2 mb-2">
                                                    {field?.value?.map((val, idx) => (
                                                        <Chip
                                                            key={idx}
                                                            onClose={() => {
                                                                const remain = field.value.filter((item) => item !== val);
                                                                field.onChange(remain)
                                                            }}
                                                            style={{ margin: 2 }}
                                                        >
                                                            {val}
                                                        </Chip>
                                                    ))}
                                                </View>
                                                <Autocomplete
                                                    data={skillsSuggestions?.filter(
                                                        (item) => !field?.value?.includes(item)
                                                    )}
                                                    value={skillValue}
                                                    onChangeText={(text) => {
                                                        getSuggestions(getSkillsSuggestionsApi, text, setSkillsuggestion)
                                                        setSkillValue(text)
                                                    }}
                                                    flatListProps={{
                                                        nestedScrollEnabled: true,
                                                        keyExtractor: (_, i) => i.toString(),
                                                        renderItem: ({ item }) => (
                                                            <TouchableOpacity
                                                                onPress={() => {
                                                                    field.onChange([...field.value, item])
                                                                    setSkillsuggestion([]);
                                                                    setSkillValue(null)
                                                                }}
                                                                className="p-2 border-b border-gray-200"
                                                            >
                                                                <Text>{item}</Text>
                                                            </TouchableOpacity>
                                                        ),
                                                    }}
                                                    inputContainerStyle={{
                                                        backgroundColor: "white",
                                                        borderWidth: 1,
                                                        borderColor: "#ccc",
                                                        borderRadius: 8,
                                                        paddingHorizontal: 8,
                                                    }}
                                                    listContainerStyle={{
                                                        backgroundColor: "white",
                                                        borderWidth: 1,
                                                        borderColor: "#ccc",
                                                        borderRadius: 8,
                                                        marginTop: 2,
                                                    }}
                                                />
                                            </View>
                                        )}

                                    />
                                }

                                <Controller
                                    name='jobDescription'
                                    control={control}
                                    rules={{ required: "Job Description is required" }}
                                    render={({ field }) => {
                                        return (

                                            <View className='flex flex-col  justify-center items-start mt-4'>

                                                <Text className='text-lg font-bold text-left'>Job Description <Text className='text-red-500'>*</Text></Text>
                                                <TextInput
                                                    onChange={({ nativeEvent: { text } }) => { field.onChange(text) }}
                                                    value={field.value}
                                                    multiline={true}
                                                    numberOfLines={40}
                                                    maxLength={200}
                                                    className='border h-40 border-gray-500 w-[90vw] rounded-lg bg-white'
                                                    textAlignVertical='top'
                                                />
                                                {errors.jobDescription && <Text className='text-red-500 text-sm '>{errors.jobDescription.message}</Text>}
                                            </View>
                                        )
                                    }}
                                />

                            </View>

                            <View className='flex flex-row gap-4 mt-4 justify-center items-center'>
                                <TouchableOpacity className='border border-[#0784c9] justify-center items-center  rounded-lg w-[35vw]' onPress={() => setSteps((prev) => prev - 1)}>
                                    <Text className='text-lg p-2 px-4 font-bold text-[#0784c9]'>Back</Text>
                                </TouchableOpacity>

                                <TouchableOpacity className='bg-[#0784c9]  justify-center items-center  rounded-lg w-[35vw]' onPress={handleSubmit(secondStepSubmit)}>
                                    <Text className='text-lg p-2 px-4 font-bold text-white'>Next</Text>
                                </TouchableOpacity>
                            </View>



                        </ScrollView>

                    }

                    {/* step 3 */}

                    {steps === 2 &&
                        <View>


                            <View className='flex flex-col justify-center items-start mt-4'>

                                <Text className='text-lg font-bold text-left'>Is this a Walk In Interview</Text>

                                <Controller
                                    name="walkIn"
                                    control={control}
                                    defaultValue={false}
                                    render={({ field }) => (
                                        <RadioButton.Group
                                            onValueChange={(val) => {
                                                const boolVal = val === "true";
                                                field.onChange(boolVal);

                                            }}
                                            value={field.value ? "true" : "false"}
                                        >
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    flexWrap: "wrap",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}>
                                                    <RadioButton color='#0784c9' value="true" />
                                                    <Text>Yes</Text>
                                                </View>
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <RadioButton color='#0784c9' value="false" />
                                                    <Text>No</Text>
                                                </View>
                                            </View>
                                        </RadioButton.Group>
                                    )}
                                />

                            </View>

                            {/* walkin address */}

                            {watch("walkIn") &&
                                <View>
                                    <View className='flex flex-col justify-center items-start mt-4'>

                                        <Text className='text-lg font-bold text-left'>Enter Walk In Address <Text className='text-red-500'>*</Text></Text>
                                        <Controller
                                            name='walkInAddress'
                                            control={control}
                                            rules={{ required: "WalkIn Address is Required" }}
                                            render={({ field }) => {
                                                return (
                                                    <View>
                                                        <View className='flex flex-row justify-center items-center border border-gray-500 w-[90vw] rounded-lg bg-white'>

                                                            <TextInput
                                                                value={field.value}
                                                                onChangeText={field.onChange}
                                                                className='w-[75vw]'
                                                            />

                                                            <TouchableOpacity onPress={getCurrentLocation}><Locate size={18} color={"#0784c9"} /></TouchableOpacity>
                                                            {errors.walkInAddress && <Text className='text-red-500 text-sm '>{errors.walkInAddress.message}</Text>}
                                                        </View>

                                                        <View className='mt-2 flex flex-row gap-2'>
                                                            <Checkbox
                                                                value={watch("walkInAddress") === `${watch("location")}, ${watch("city")}, ${watch("state")}, ${watch("pinCode")}`}
                                                                onValueChange={(val) => {
                                                                    if (val) {
                                                                        setValue(
                                                                            "walkInAddress",
                                                                            `${watch("location")}, ${watch("city")}, ${watch("state")}, ${watch("pinCode")}`
                                                                        );
                                                                    } else {
                                                                        setValue("walkInAddress", null);
                                                                    }
                                                                }}
                                                            />
                                                            <Text className='font-semibold'> Same as office address</Text>
                                                        </View>
                                                    </View>
                                                )

                                            }}
                                        />
                                    </View>

                                    {/* walk in start date */}

                                    <View className='flex flex-row items-start justify-start mt-4 gap-4'>

                                        <View className=''>

                                            <Controller

                                                name="walkInStartDate"
                                                control={control}

                                                render={({ field }) => (
                                                    <View>

                                                        <TouchableOpacity


                                                            onPress={() => {
                                                                setShowDate("startDate");

                                                            }}
                                                            className="rounded-lg px-2 my-4 py-3 border border-gray-400"
                                                        ><Text className={`px-2 ${field.value ? "text-black-500" : "text-gray-400"}`}>{field.value ? field.value : "Enter Start Date"}</Text></TouchableOpacity>

                                                        {showDate === "startDate" && <DateTimePicker
                                                            value={field.value ? new Date(field.value) : new Date()}
                                                            mode="date"
                                                            display="spinner"
                                                            textColor="#0784c9"
                                                            style={{ backgroundColor: "white" }}
                                                            onChange={(event, selectedDate) => {

                                                                if (event.type === "set") {
                                                                    field.onChange(selectedDate?.toISOString().split("T")[0])

                                                                }

                                                                setShowDate(false);

                                                            }}
                                                        />}
                                                    </View>
                                                )}
                                            />

                                        </View>

                                        {/* walk in end date */}

                                        <Controller

                                            name="WalkInEndDate"
                                            control={control}
                                            rules={{
                                                required: "End date is required",
                                                validate: (value) => {
                                                    const startDateStr = getValues("WalkInStartDate");

                                                    if (!startDateStr) return true;

                                                    const endDate = new Date(value);
                                                    const startDate = new Date(startDateStr);

                                                    if (endDate < startDate) {
                                                        return "End Date should be greater than Start Date";
                                                    }
                                                    return true;
                                                },
                                            }}
                                            render={({ field }) => (
                                                <View>

                                                    <TouchableOpacity


                                                        onPress={() => {
                                                            setShowDate("endDate");

                                                        }}
                                                        className="rounded-lg px-2 my-4 py-3 border border-gray-400"
                                                    ><Text className={`px-2 ${field.value ? "text-black-500" : "text-gray-400"}`}>{field.value ? field.value : "Enter End Date"}</Text></TouchableOpacity>

                                                    {showDate === "endDate" &&
                                                     <DateTimePicker
                                                        value={field.value ? new Date(field.value) : new Date()}
                                                        mode="date"
                                                        display="spinner"
                                                        textColor="#0784c9"
                                                        style={{ backgroundColor: "white" }}
                                                        onChange={(event, selectedDate) => {

                                                            if (event.type === "set") {
                                                                field.onChange(selectedDate?.toISOString().split("T")[0])

                                                            }

                                                            setShowDate(false);

                                                        }}
                                                    />}
                                                </View>
                                            )}
                                        />

                                    </View>

                                    {/* walk in start time */}

                                    <Controller

                                        name="walkInStartTime"
                                        control={control}
                                        rules={{ required: "Walk-in time is required" }}
                                        render={({ field }) => (
                                            <View className='w-[90vw]'>

                                                <TouchableOpacity


                                                    onPress={() => {
                                                        setShowDate("startTime");

                                                    }}
                                                    className="rounded-lg px-2 my-4 py-3 border border-gray-400"
                                                ><Text className={`px-2 ${field.value ? "text-black-500" : "text-gray-400"}`}>{field.value ? field.value : "Enter Start Time"}</Text></TouchableOpacity>

                                                {showDate === "startTime" && <DateTimePicker
                                                    value={field.value ? new Date(field.value) : new Date()}
                                                    mode="time"
                                                    display="spinner"
                                                    textColor="#0784c9"
                                                    style={{ backgroundColor: "white" }}
                                                    onChange={(event, selectedValue) => {

                                                        if (event.type === "set") {
                                                            field.onChange(selectedValue?.toISOString().split("T")[1].split(".")[0])

                                                        }

                                                        setShowDate(false);

                                                    }}
                                                />}
                                            </View>
                                        )}
                                    />

                                    {/* walk in instruction */}

                                    <Controller
                                        name='walkInInstruction'
                                        control={control}
                                        render={({ field }) => {
                                            return (
                                                <View className='flex flex-row gap-2 justify-start mt-2 items-center'>
                                                    <TextInput
                                                        placeholder='Enter Walk in Instruction'
                                                        value={field.value}
                                                        className='w-2/3 w-[90vw] border border-gray-500 pl-2 border-gray-500 rounded'
                                                        onChange={({ nativeEvent: { text } }) => field.onChange(text)}
                                                    />

                                                </View>
                                            )
                                        }}
                                    />
                                </View>
                            }


                            <View className='flex flex-col justify-center items-start mt-4'>

                                <Text className='text-lg font-bold text-left'>Every time you receive a candidate application,do you want
                                    Whatsapp Alerts from Unigrow?</Text>

                                <Controller
                                    name="notificationPreference"
                                    control={control}
                                    defaultValue="yes"
                                    render={({ field }) => (
                                        <RadioButton.Group
                                            onValueChange={(val) => {

                                                field.onChange(val);

                                            }}
                                            value={field.value}
                                        >
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    flexWrap: "wrap",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}>
                                                    <RadioButton color='#0784c9' value="yes" />
                                                    <Text>Yes, to other recruiter</Text>
                                                </View>
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <RadioButton color='#0784c9' value="no" />
                                                    <Text>No, send me the notifications</Text>
                                                </View>
                                            </View>
                                        </RadioButton.Group>
                                    )}
                                />

                            </View>

                            {watch("notificationPreference") === "yes" &&
                                <View>
                                    <Controller
                                        name='otherRecruiterName'
                                        control={control}
                                        rules={{ required: "Name is Required" }}
                                        render={({ field }) => {
                                            return (
                                                <View className='flex flex-col gap-2 justify-start mt-2'>
                                                    <TextInput
                                                        placeholder='Enter Other Recruiter Name'
                                                        value={field.value}
                                                        className='w-2/3 border pl-2 w-[90vw] border-gray-500 rounded'
                                                        onChange={({ nativeEvent: { text } }) => field.onChange(text)}
                                                    />
                                                    {errors.otherRecruiterName && <Text className='text-red-500 text-sm '>{errors.otherRecruiterName.message}</Text>}
                                                </View>
                                            )
                                        }}
                                    />

                                    <Controller
                                        name='otherRecruiterNumber'
                                        control={control}
                                        rules={{
                                            required: "WhatsApp number is required",
                                            pattern: {
                                                value: /^[0-9]{10}$/,
                                                message: "Enter a valid 10-digit number",
                                            },
                                        }}
                                        render={({ field }) => {
                                            return (
                                                <View className='flex flex-col gap-2 justify-start mt-2 '>
                                                    <TextInput
                                                        placeholder='Enter Other Recruiter Number'
                                                        inputMode='numeric'
                                                        keyboardType='number-pad'
                                                        value={field.value}
                                                        className='w-2/3 border w-[90vw] pl-2 border-gray-500 rounded'
                                                        onChange={({ nativeEvent: { text } }) => field.onChange(text)}
                                                    />
                                                    {errors.otherRecruiterNumber && <Text className='text-red-500 text-sm '>{errors.otherRecruiterNumber.message}</Text>}

                                                </View>
                                            )
                                        }}
                                    />

                                    <Controller
                                        name='otherRecruiterEmail'
                                        control={control}
                                        rules={{
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: "Enter a valid email address",
                                            },
                                        }}
                                        render={({ field }) => {
                                            return (
                                                <View className='flex flex-col gap-2 justify-start mt-2'>
                                                    <TextInput
                                                        placeholder='Enter Other Recruiter Email'
                                                        inputMode='email'
                                                        value={field.value}
                                                        className='w-2/3 border w-[90vw] pl-2 border-gray-500 rounded'
                                                        onChange={({ nativeEvent: { text } }) => field.onChange(text)}
                                                    />
                                                    {errors.otherRecruiterEmail && <Text className='text-red-500 text-sm '>{errors.otherRecruiterEmail.message}</Text>}
                                                </View>
                                            )
                                        }}
                                    />

                                </View>

                            }

                            <View className='flex flex-col justify-center items-start mt-4'>

                                <Text className='text-lg font-bold text-left'> Which candidates should be able to contact you ?</Text>

                                <Controller
                                    name="candidateType"
                                    control={control}
                                    defaultValue="all candidate"
                                    render={({ field }) => (
                                        <RadioButton.Group
                                            onValueChange={(val) => {

                                                field.onChange(val);

                                            }}
                                            value={field.value}
                                        >
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    flexWrap: "wrap",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <View style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}>
                                                    <RadioButton color='#0784c9' value="all candidate" />
                                                    <Text>All candidates</Text>
                                                </View>
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <RadioButton color='#0784c9' value="matched-candidate" />
                                                    <Text>Only matched candidates (~20% of all candidates)</Text>
                                                </View>
                                            </View>
                                        </RadioButton.Group>
                                    )}
                                />

                            </View>

                            <View className='flex flex-row gap-4 mt-4 mb-10  justify-center items-center'>
                                <TouchableOpacity className='border border-[#0784c9] justify-center items-center  rounded-lg w-[35vw]' onPress={() => setSteps((prev) => prev - 1)}>
                                    <Text className='text-lg p-2 px-4 font-bold text-[#0784c9]'>Back</Text>
                                </TouchableOpacity>

                                <TouchableOpacity className='bg-[#0784c9]  justify-center items-center  rounded-lg w-[35vw]' onPress={handleSubmit(() => setSteps((prev) => prev + 1))}>
                                    <Text className='text-lg p-2 px-4 font-bold text-white'>Next</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    }

                    {steps === 3 &&
                        <View>
                            <TouchableOpacity
                                className="w-full bg-white flex flex-row p-4 justify-between items-center"
                                onPress={() => setShowJobDetailpreview(!showJobDetailPreview)}
                            >
                                <View className="flex flex-row gap-4 items-center">
                                    <Briefcase size={24} />
                                    <Text className="font-bold text-lg">Job Details</Text>
                                </View>
                                <View className="flex flex-row gap-4 items-center">
                                    <TouchableOpacity onPress={() => setSteps(0)}>
                                        <Pencil size={24} className="bg-gray-200 text-black p-1 rounded-lg" />
                                    </TouchableOpacity>
                                    {showJobDetailPreview ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </View>
                            </TouchableOpacity>

                            {showJobDetailPreview && (
                                <View className="bg-white m-2 p-4 rounded-xl shadow">
                                    <DetailRow label="Company name" value={watch("companyName")} />
                                    <DetailRow label="Job title" value={watch("jobTitle")} />
                                    <DetailRow label="Job role" value={watch("jobRoles")} />
                                    <DetailRow label="Job type" value={watch("jobType")} />
                                    <DetailRow label="Is Night Shift" value={watch("nightShift")} />
                                    <DetailRow label="Work type" value={watch("workLocationType")} />
                                    <DetailRow
                                        label="Job location"
                                        value={`${watch("location")}, ${watch("city")}, ${watch("state")}`}
                                    />
                                    <DetailRow
                                        label="Monthly Salary | Pay Type"
                                        value={`${watch("minimumSalary")}-${watch("maximumSalary")} ${watch("incentive") !== "" ? `incentive-${watch("incentive")}` : ""
                                            } per month (${watch("payType")})`}
                                    />
                                    <DetailRow label="Additional perks" value={watch("perks")} />
                                    <DetailRow
                                        label="Joining Fee"
                                        value={
                                            watch("joiningfee") === "true"
                                                ? `${watch("joiningFeeAmount")} for ${watch("joiningFeeReason")} (${watch("joiningFeeReasonDetail")}) at ${watch("joiningFeeAmountTime")}`
                                                : "No"
                                        }
                                    />
                                </View>
                            )}

                            {/* Candidate Requirements */}
                            <TouchableOpacity
                                className="w-full bg-white flex flex-row mt-4 p-4 justify-between items-center"
                                onPress={() =>
                                    setShowCandidateRequirementPreview(!showCandidateRequirementsPreview)
                                }
                            >
                                <View className="flex flex-row gap-4 items-center">
                                    <Award size={24} />
                                    <Text className="font-bold text-lg">Candidate Requirement</Text>
                                </View>
                                <View className="flex flex-row gap-4 items-center">
                                    <TouchableOpacity onPress={() => setSteps(1)}>
                                        <Pencil size={24} className="bg-gray-200 text-black p-1 rounded-lg" />
                                    </TouchableOpacity>
                                    {showCandidateRequirementsPreview ? (
                                        <ChevronUp size={20} />
                                    ) : (
                                        <ChevronDown size={20} />
                                    )}
                                </View>
                            </TouchableOpacity>

                            {showCandidateRequirementsPreview && (
                                <View className="bg-white m-2 p-4 rounded-xl shadow">
                                    <DetailRow label="Minimum Education" value={watch("education")} />
                                    <DetailRow
                                        label="Specialization"
                                        value={watch("educationSpecialization")}
                                    />
                                    <DetailRow
                                        label="Experience Required"
                                        value={`${watch("experienceLevel")} (${watch("experience")})`}
                                    />
                                    <DetailRow label="English" value={watch("english")} />
                                    {/* {expanded.map((type) => (
                                        <DetailRow key={type} label={type} value={values[type]} />
                                    ))} */}
                                </View>
                            )}

                            {/* Interview Details */}
                            <TouchableOpacity
                                className="w-full bg-white flex flex-row mt-4 p-4 justify-between items-center"
                                onPress={() => setShowInterviewDetailPreview(!shownterviewDetailPreview)}
                            >
                                <View className="flex flex-row gap-4 items-center">
                                    <Handshake size={24} />
                                    <Text className="font-bold text-lg">Interview Information</Text>
                                </View>
                                <View className="flex flex-row gap-4 items-center">
                                    <TouchableOpacity onPress={() => setSteps(2)}>
                                        <Pencil size={24} className="bg-gray-200 text-black p-1 rounded-lg" />
                                    </TouchableOpacity>
                                    {shownterviewDetailPreview ? (
                                        <ChevronUp size={20} />
                                    ) : (
                                        <ChevronDown size={20} />
                                    )}
                                </View>
                            </TouchableOpacity>

                            {shownterviewDetailPreview && (
                                <View className="bg-white m-2 p-4 rounded-xl shadow">
                                    <DetailRow
                                        label="Is this a walk-in interview ?"
                                        value={watch("walkIn")}
                                    />
                                    {watch("notificationPreference") === "yes" && (
                                        <DetailRow
                                            label="HR Detail"
                                            value={`${watch("otherRecruiterName")}, email: ${watch("otherRecruiterEmail")}, number ${watch("otherRecruiterNumber")}`}
                                        />
                                    )}

                                    <DetailRow
                                        label="Whatsapp alert"
                                        value={watch("notificationPreference")}
                                    />
                                </View>
                            )}

                            {/* Footer Buttons */}
                            <View className='flex flex-row gap-4 mt-4 mb-10  justify-center items-center'>
                                <TouchableOpacity className='border border-[#0784c9] justify-center items-center  rounded-lg w-[35vw]' onPress={() => setSteps((prev) => prev - 1)}>
                                    <Text className='text-lg p-2 px-4 font-bold text-[#0784c9]'>Back</Text>
                                </TouchableOpacity>

                                <TouchableOpacity className='bg-[#0784c9]  justify-center items-center  rounded-lg w-[35vw]' onPress={handleSubmit(onSubmit)}>
                                    <Text className='text-lg p-2 px-4 font-bold text-white'>Post</Text>
                                </TouchableOpacity>
                            </View>

                        </View>}


                </View>
            </ScrollView>

            <Modal
                visible={showCompanyChangeOptions}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCompanyChangeOptions(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/30 justify-center items-center"
                    onPress={() => setShowCompanyChangeOptions(false)}
                    activeOpacity={1}
                >
                    <View className="bg-white w-[90%] rounded-xl p-4">
                        <TouchableOpacity
                            className={`border p-3 rounded-lg mb-3 ${radioValue === "same" ? "border-blue-500" : "border-gray-300"
                                }`}
                            onPress={() => {
                                setRadioValue("same");
                                setShowCompanyModal("same");
                                setShowCompanyChangeOptions(false);
                            }}
                        >
                            <Text>I changed my company</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`border p-3 rounded-lg mb-3 ${radioValue === "consultancy"
                                ? "border-blue-500"
                                : "border-gray-300"
                                }`}
                            onPress={() => {
                                setRadioValue("consultancy");
                                setShowCompanyModal("consultancy");
                                setShowCompanyChangeOptions(false);
                            }}
                        >
                            <Text>
                                I belong to a consultancy & want to post for my client's company
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`border p-3 rounded-lg ${radioValue === "other" ? "border-blue-500" : "border-gray-300"
                                }`}
                            onPress={() => {
                                setRadioValue("other");
                                setShowCompanyModal("other");
                                setShowCompanyChangeOptions(false);
                            }}
                        >
                            <Text>
                                I want to post for another company/business/consultancy of my own
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Replace Dialog with RN Modal */}
            <Modal
                visible={!!showCompanyModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCompanyModal(null)}
            >
                <View className="flex-1 bg-black/40 justify-center items-center">
                    <View className="bg-white w-[90%] max-h-[90%] rounded-xl p-4">
                        {/* Header */}
                        <View className="flex flex-row justify-between items-center mb-3">
                            <Text className="font-bold text-lg">Company Hiring For</Text>
                            <TouchableOpacity onPress={() => setShowCompanyModal(null)}>
                                <X size={22} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Description */}
                            <Text className="text-sm mb-3">
                                You're changing your company from{" "}
                                <Text className="font-bold text-md text-black">
                                    {employer?.company.companyName}
                                </Text>{" "}
                                Please select/add company below:
                            </Text>

                            {/* Input */}
                            <Text className="text-sm font-medium mb-1">
                                Your company name <Text className="text-red-500">*</Text>
                            </Text>
                            <Controller
                                name='companyName'
                                control={control}
                                render={({ field }) => (
                                    <TextInput
                                        className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
                                        placeholder="Select company"
                                        value={field.value}
                                        onChange={({ nativeEvent: { text } }) => field.onChange(text)}
                                    />
                                )}
                            />


                            {/* Checkbox */}
                            <View className="flex flex-row items-center mb-3">
                                <Checkbox
                                    value={
                                        showCompanyModal === "consultancy"
                                            ? true
                                            : isConsultancyCompany
                                    }
                                    onValueChange={setIsConsultancyCompany}
                                    disabled={showCompanyModal === "consultancy"}
                                    color="#0784C9"
                                />
                                <Text className="ml-2 text-sm">
                                    This is a Consultancy (Hiring or Staffing agency)
                                </Text>
                            </View>

                            {/* Chips */}
                            <Text className="text-sm font-medium mb-2">
                                Number of employees in your company{" "}
                                <Text className="text-red-500">*</Text>
                            </Text>
                            <View className="flex flex-row flex-wrap gap-2 mb-6">
                                {["0-50", "51-100", "101-300", "301-500", "501-1000", "1000 above"].map(
                                    (option) => (
                                        <TouchableOpacity
                                            key={option}
                                            onPress={() => setSelectedEmployees(option)}
                                            className={`px-3 py-1 rounded-full ${selectedEmployees === option
                                                ? "bg-[#0784c9]"
                                                : "bg-gray-200"
                                                }`}
                                        >
                                            <Text
                                                className={`text-sm ${selectedEmployees === option
                                                    ? "text-white"
                                                    : "text-gray-800"
                                                    }`}
                                            >
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                )}
                            </View>

                            <TouchableOpacity onPress={() => setShowCompanyModal(null)} className='bg-[#0784c9] rounded-lg justify-center p-2 items-center'><Text className='font-bold text-white text-lg'>Save</Text></TouchableOpacity>


                        </ScrollView>
                    </View>
                </View>
            </Modal>

        </KeyboardAvoidingView>
    )
}

export default JobPost