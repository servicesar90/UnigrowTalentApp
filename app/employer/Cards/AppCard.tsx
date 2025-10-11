import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { Avatar, Chip, Button, Modal } from "react-native-paper"; 
import { useDispatch, useSelector } from "react-redux";

import { Ionicons } from "@expo/vector-icons";
import { Paperclip } from 'lucide-react-native';
import { apiFunction } from "@/app/api/apiFunction";
import { applyJobApi, getNumberApi, getProfileApi } from "@/app/api/api";
import { fetchJobsById } from "@/app/Redux/getData";
import ProfileModal from "../modals/viewProfile";
import Toast from "react-native-toast-message";

const DetailRow = ({ logo, label, value }) => (
    <View className="flex-row items-center justify-between w-full">
        <View className="flex-row items-center gap-2.5 w-1/5">
            <View className="text-gray-400">{logo}</View>
            <Text className="text-left font-semibold text-gray-400">{label}</Text>
        </View>
        <View className="w-2/3 text-gray-900 text-left">{value}</View>
    </View>
);

export default function SimplePaper({ jobId, candidate }) {
    //   const { width } = useWindowDimensions();
    //   const isMobile = width <= 768;
    const [openProfileModal, setOpenProfileModal] = useState(false);

    const [profile, setProfile] = useState(null);
    const [isDatabase, setIsDatabase] = useState(false);
    const [candidateDetail, setCandidateDetail] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        if (candidate?.EmployeeProfile) {
            setProfile(candidate?.EmployeeProfile);
            setIsDatabase(false);
        }
        else {
            setProfile(candidate);
            setIsDatabase(true);
        }
    }, [candidate]);

    const { employer, jobsById } = useSelector((state) => state.getDataReducer);

    //   const setUnlocked = useCallback(async () => {
    //     try {
    //       const response = await getUnlockedByIdFunc(jobId);
    //       if (response?.data?.data) {
    //         const unlocked = response.data.data.some(
    //           (dat) => dat?.EmployeeProfile?.user_id === profile.user_id
    //         );
    //         setProfile((prev) => ({
    //           ...prev,
    //           unlocked: unlocked || !isDatabase,
    //         }));
    //       } else {
    //         setProfile((prev) => ({
    //           ...prev,
    //           unlocked: false,
    //         }));
    //       }
    //     } catch (error) {
    //       console.error("Failed to fetch unlocked:", error);
    //       setProfile((prev) => ({
    //         ...prev,
    //         unlocked: false,
    //       }));
    //     }
    //   }, [jobId, profile, isDatabase]);


    const handleReject = async (id) => {

        const response = await apiFunction(applyJobApi, [id], { status: "Rejected" }, "patch", true);
        if (response) {
            Toast.show({
                type: "success",
                text1: "Reject",
                text2: "Succesfully Rejected"
            })

            dispatch(fetchJobsById(jobId));
        } else {
            Toast.show({
                type: "error",
                text1: "Reject",
                text2: "Could not rejected! please try again"
            })
        }
    };

    const handleShortList = async (id) => {
        const response = await apiFunction(applyJobApi, [id], { status: "Selected" }, "patch", true);

        if (response) {
            Toast.show({
                type: "success",
                text1: "Shortlist",
                text2: "Succesfully shortlisted"
            })

            dispatch(fetchJobsById(jobId));
        } else {
            Toast.show({
                type: "error",
                text1: "Shortlist",
                text2: "Could not Shortlist"
            })
        }
    };

    const handleViewPhone = async () => {

        if (!profile) return;

        try {
            if (isDatabase) {
                const data = {
                    employeeId: profile.user_id,
                    jobId,
                    company: employer?.company?.companyName,
                    job: jobsById[0]?.jobTitle,
                };


                const response = await apiFunction(getNumberApi, null, data, "post", true);


                if (response) {
                    setProfile((prev) => ({ ...prev, number: response.data.phone }));
                }
            } else {
                const number = profile?.User?.phone || "";
                setProfile((prev) => ({ ...prev, number }));
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Contact",
                text2: "Error fetching Phone Number"
            })
        }
    };

    const getProfile = async () => {
        if (profile) {
            if (!isDatabase) {
                setCandidateDetail(candidate);
            } else {
                const data = {
                    employeeId: profile?.user_id,
                    jobId: jobId,
                    company: employer?.company?.companyName,
                    job: jobsById[0]?.jobTitle,
                };
                const response = await apiFunction(getProfileApi, null, data, "post", true);
                if (response === "plan") {
                    Toast.show({
                        type: "error",
                        text1: "Credits",
                        text2: "You Don't have enogh credits"
                    })
                } else if (response) {
                    setCandidateDetail(response.data);

                } else {
                    return Toast.show({
                        type: "error",
                        text1: "Profile",
                        text2: "Could not get Profile"
                    })
                }
            }
            setOpenProfileModal(true);
        }
    };

    // Helper function to render chips
    const renderChips = (data) => {
        let items = data;
        if (typeof items === "string") {
            try {
                items = JSON.parse(items);
            } catch {
                items = [];
            }
        }
        if (Array.isArray(items) && items.length > 0) {
            return (
                <View className="flex-row flex-wrap gap-2">
                    {items.map((item, index) => (
                        <Chip
                            key={index}
                            mode="outlined"
                            style={{
                                backgroundColor: "#E0F2FE", // light blue
                                color: "gray", // text
                                fontSize: 10,
                                paddingHorizontal: 0,
                                paddingVertical: 0,
                                fontWeight: "500",
                                borderRadius: 8,
                            }}
                        >
                            <Text className="text-gray-700 text-xs">{item}</Text>
                        </Chip>
                    ))}
                </View>
            );
        }
        return <Text className="text-sm text-gray-650">Not Provided</Text>;
    };

    return (
        <>

            <ScrollView className="w-full mb-8">
                {
                    <View className="p-4 border rounded-lg bg-white">
                        <View className="flex-row items-center">
                            <Avatar.Text
                                size={50}
                                label={profile?.fullName
                                    ?.split(" ")
                                    .map((word) => word[0])
                                    .slice(0, 2)
                                    .join("")
                                    .toUpperCase()}
                                style={{ backgroundColor: "#ff5722" }}
                            />
                            <View className="flex-1 ml-4">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-base font-semibold text-gray-800">
                                        {profile?.fullName}
                                    </Text>
                                    <Chip
                                        mode="outlined"
                                        style={{
                                            backgroundColor: "#0784C9",
                                            color: "white",
                                            borderRadius: 4,
                                        }}
                                    >
                                        <Text className="text-white text-xs">
                                            {candidate?.matchingPrecent ? candidate?.matchingPrecent : 0}% matched
                                        </Text>
                                    </Chip>
                                </View>
                                <View className="flex-row items-center gap-2 mb-1">
                                    <Ionicons name="briefcase-outline" size={16} className="text-secondary" />
                                    <Text className="text-sm text-gray-650">
                                        {profile?.TotalExperience?.years || profile?.TotalExperience?.months
                                            ? `${profile.TotalExperience.years} years ${profile.TotalExperience.months} months`
                                            : "N/A"}
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-2 mb-1">
                                    <Ionicons name="cash-outline" size={16} className="text-secondary" />
                                    <Text className="text-sm text-gray-650">
                                        {profile?.salary ? `${profile?.salary}` : "N/A"}
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="location-outline" size={16} className="text-secondary" />
                                    <Text className="text-sm text-gray-650">
                                        {profile?.currentLocation ? `${profile?.currentLocation}` : "N/A"}
                                    </Text>
                                </View>
                                <Pressable onPress={getProfile} className="mt-2 self-start">
                                    <Text className="font-bold text-sm text-green-500">
                                        View Profile
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                        <View className="mt-5 self-center w-full">
                            {/* DetailRow components for desktop view */}
                            <DetailRow
                                logo={<Ionicons name="briefcase-outline" size={18} className="text-secondary" />}
                                label={<Text className="text-sm font-semibold text-gray-650">Current</Text>}
                                value={
                                    profile?.EmployeeExperiences?.[0] ? (
                                        <Text className="text-sm text-gray-650">
                                            {profile?.EmployeeExperiences[0].jobTitle} at {profile?.EmployeeExperiences[0].companyName}
                                        </Text>
                                    ) : (
                                        <Text className="text-sm text-gray-650">Not Provided</Text>
                                    )
                                }
                            />
                            <DetailRow
                                logo={<Ionicons name="briefcase-outline" size={18} className="text-secondary" />}
                                label={<Text className="text-sm font-semibold text-gray-650">Previous</Text>}
                                value={
                                    profile?.EmployeeExperiences?.[1] ? (
                                        <Text className="text-sm text-gray-650">
                                            {profile?.EmployeeExperiences[1].jobTitle} at {profile?.EmployeeExperiences[1].companyName}
                                        </Text>
                                    ) : (
                                        <Text className="text-sm text-gray-650">Not Provided</Text>
                                    )
                                }
                            />
                            <DetailRow
                                logo={<Ionicons name="school-outline" size={18} className="text-secondary" />}
                                label={<Text className="text-sm font-semibold text-gray-650">Education</Text>}
                                value={
                                    profile?.EmployeeEducations?.[0] ? (
                                        <Text className="text-sm text-gray-650">
                                            {profile?.EmployeeEducations[0]?.degree || ""} {profile?.EmployeeEducations[0]?.specialization || ""} {profile?.EmployeeEducations[0]?.instituteName || ""}
                                        </Text>
                                    ) : (
                                        <Text className="text-sm text-gray-650">Not Provided</Text>
                                    )
                                }
                            />
                            <DetailRow
                                logo={<Ionicons name="location-outline" size={18} className="text-secondary" />}
                                label={<Text className="text-sm font-semibold text-gray-650">Pref. City</Text>}
                                value={renderChips(profile?.preferredJobCity)}
                            />
                            <DetailRow
                                logo={<Ionicons name="cog-outline" size={18} className="text-secondary" />}
                                label={<Text className="text-sm font-semibold text-gray-650">Skills</Text>}
                                value={renderChips(profile?.skills)}
                            />
                            <DetailRow
                                logo={<Ionicons name="language-outline" size={18} className="text-secondary" />}
                                label={<Text className="text-sm font-semibold text-gray-650">English</Text>}
                                value={
                                    profile?.englishProficiency ? (
                                        <Text className="text-sm text-gray-650">
                                            {profile?.englishProficiency}
                                        </Text>
                                    ) : (
                                        <Text className="text-sm text-gray-650">Not Provided</Text>
                                    )
                                }
                            />
                            <DetailRow
                                logo={<Ionicons name="language-outline" size={18} className="text-secondary" />}
                                label={<Text className="text-sm font-semibold text-gray-650">Languages</Text>}
                                value={renderChips(profile?.otherLanguages)}
                            />
                            <DetailRow
                                logo={<Ionicons name="language-outline" size={18} className="text-secondary" />}
                                label={<Text className="text-sm font-semibold text-gray-650">Matching Criterion</Text>}
                                value={renderChips(candidate.matchedprofiles)
                                    // candidate?.matchedField?.length > 0 ? (
                                    //     candidate?.matchedField.map((field, index) => (
                                    //         <Text key={index} className="mr-3 text-sm text-gray-650">
                                    //             {field}
                                    //         </Text>
                                    //     ))
                                    // ) : (
                                    //     <Text className="text-sm text-gray-650">Not Provided</Text>
                                    // )
                                }
                            />
                            <View className="flex-col gap-2 justify-between">
                                <View className="flex">
                                    <TouchableOpacity
                                        onPress={handleViewPhone}
                                        // disabled={!profile?.number}
                                        className={`rounded-md py-2 px-4 mr-2 ${profile?.number
                                            ? 'bg-white border border-blue-500' // Outlined variant
                                            : 'bg-blue-500' // Contained variant
                                            }`}
                                    >
                                        <Text
                                            className={`font-medium text-center ${profile?.number ? 'text-blue-500' : 'text-white'
                                                }`}
                                        >
                                            {profile?.number ? profile.number : 'View Phone Number'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {!isDatabase && (
                                    <View className="flex flex-row gap-4 w-full">
                                        <TouchableOpacity
                                            onPress={() => handleShortList(candidate?.id)}
                                            disabled={candidate?.status === 'Selected'}
                                            className={`rounded-md py-2 px-4 border flex-1 w-1/3 items-center ${candidate?.status === 'Selected'
                                                ? 'bg-gray-400 border-gray-400'
                                                : 'bg-white border-green-500'
                                                }`}
                                        >
                                            <Text
                                                className={`font-medium text-center ${candidate?.status === 'Selected'
                                                    ? 'text-gray-600'
                                                    : 'text-green-500'
                                                    }`}
                                            >
                                                {candidate?.status === 'Selected' ? 'Shortlisted' : 'ShortList'}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => handleReject(candidate?.id)}
                                            disabled={candidate?.status === 'Rejected'}
                                            className={`rounded-md py-2 px-4 flex-1 w-1/3 items-center ${candidate?.status === 'Rejected'
                                                ? 'bg-gray-400'
                                                : 'bg-red-400'
                                                }`}
                                        >
                                            <Text
                                                className={`font-medium text-center ${candidate?.status === 'Rejected'
                                                    ? 'text-gray-600'
                                                    : 'text-white'
                                                    }`}
                                            >
                                                {candidate?.status === 'Rejected' ? 'Rejected' : 'Reject'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                            </View>
                        </View>
                        {/* Divider section */}
                        <View className="h-[1px] bg-gray-300 w-full my-4" />

                        <View className="flex flex-row justify-between text-xs">
                            <View className="flex flex-row gap-1">
                                <Text className="text-gray-600 text-xs">
                                    Profile {profile?.unlocked ? "Unlocked" : "locked"}
                                </Text>
                            </View>
                            <View className="flex flex-row gap-1">
                                <View className="flex flex-row items-center">
                                    <Paperclip size={12} className="text-gray-600 mr-1" />
                                    <Text className="text-gray-600 text-xs">
                                        {profile?.resumeURL ? "Cv Attached" : "Cv not Attached"}
                                    </Text>
                                </View>
                                <Text className="text-gray-600 text-xs">|</Text>
                                <View>
                                    <Text className="text-gray-600 text-xs">
                                        Active on {profile?.updatedAt.split("T")[0]}
                                    </Text>
                                </View>
                            </View>
                        </View>


                    </View>
                }
            </ScrollView>

            {/* Profile Model */}
            <View className="">
                <ProfileModal
                    open={openProfileModal}
                    onClose={() => setOpenProfileModal(false)}
                    jobId={jobId}
                    candidate={candidateDetail?.EmployeeProfile}
                    phone={candidateDetail?.phone}
                    isDatabase={isDatabase}
                    id={candidateDetail?.id}
                    status={candidateDetail?.status}
                />
            </View>

        </>
    );
}