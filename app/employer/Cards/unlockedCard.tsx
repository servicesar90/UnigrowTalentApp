import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Avatar, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Paperclip } from 'lucide-react-native';
import ProfileModal from '../modals/viewProfile';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { getNumberApi, getProfileApi } from '@/app/api/api';
import { apiFunction } from '@/app/api/apiFunction';


const DetailRow = ({ logo, label, value }) => (
    <View className="flex-row items-center justify-between w-full">
        <View className="flex-row items-center gap-2.5 w-1/5">
            <View className="text-gray-400">
                {<Ionicons name={logo} size={18} className="text-secondary" />}
            </View>
            <Text className="text-left font-semibold text-gray-400">{label}</Text>
        </View>
        <View className="w-2/3 text-gray-900 text-left">{value}</View>
    </View>
);

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




const CandidateCard = ({ candidate }) => {

    const [openProfileModal, setOpenProfileModal] = useState(false);
    const [unlocked, setUnlocked] = useState(false);
    const [profile, setProfile] = useState({ number: null });

  const [candidateDetail, setCandidateDetail] = useState(null);
  const { employer, jobsById } = useSelector((state) => state.getDataReducer);

   useEffect(() => {
    if (candidate?.EmployeeProfile) {
      setProfile(candidate?.EmployeeProfile);
    } else {
      setProfile(candidate);
    }
  }, [candidate]);



    return (
        <>
            <ScrollView className="w-full mb-8">
                {
                    <View className="p-4 border rounded-lg bg-white">
                        <View className="flex-row items-center">
                            <Avatar.Text
                                size={50}
                                label={candidate?.fullName
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
                                        {candidate?.fullName}
                                    </Text>

                                </View>
                                <View className="flex-row items-center gap-2 mb-1">
                                    <Ionicons name="briefcase-outline" size={16} className="text-md" />
                                    <Text className="text-sm text-gray-650">
                                        {candidate?.TotalExperience?.years || candidate?.TotalExperience?.months
                                            ? `${candidate.TotalExperience.years} years ${candidate.TotalExperience.months} months`
                                            : "N/A"}
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-2 mb-1">
                                    <Ionicons name="cash-outline" size={16} className="text-md" />
                                    <Text className="text-sm text-gray-650">
                                        {candidate?.salary ? `${candidate?.salary}` : "N/A"}
                                    </Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="location-outline" size={16} className="text-md" />
                                    <Text className="text-sm text-gray-650">
                                        {candidate?.currentLocation ? `${candidate?.currentLocation}` : "N/A"}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={()=>setOpenProfileModal(true)} className="mt-2 self-start">
                                    <Text className="font-bold text-sm text-green-500">
                                        View Profile
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="mt-5 self-center w-full">

                            <DetailRow
                                logo="briefcase-outline"
                                label="Current"
                                value={
                                    candidate?.EmployeeExperiences?.[0] ? (
                                        <Text className="text-sm text-gray-650">
                                            {candidate?.EmployeeExperiences[0].jobTitle} at {candidate?.EmployeeExperiences[0].companyName}
                                        </Text>
                                    ) : (
                                        <Text className="text-sm text-gray-650">Not Provided</Text>
                                    )
                                }
                            />
                            <DetailRow
                                logo="briefcase-outline"
                                label="Previous"
                                value={
                                    candidate?.EmployeeExperiences?.[1] ? (
                                        <Text className="text-sm text-gray-650">
                                            {candidate?.EmployeeExperiences[1].jobTitle} at {candidate?.EmployeeExperiences[1].companyName}
                                        </Text>
                                    ) : (
                                        <Text className="text-sm text-gray-650">Not Provided</Text>
                                    )
                                }
                            />
                            <DetailRow
                                logo="school-outline"
                                label="Education"
                                value={
                                    candidate?.EmployeeEducations?.[0] ? (
                                        <Text className="text-sm text-gray-650">
                                            {candidate?.EmployeeEducations[0]?.degree || ""} {candidate?.EmployeeEducations[0]?.specialization || ""} {candidate?.EmployeeEducations[0]?.instituteName || ""}
                                        </Text>
                                    ) : (
                                        <Text className="text-sm text-gray-650">Not Provided</Text>
                                    )
                                }
                            />
                            <DetailRow
                                logo="location-outline"
                                label="Pref. City"
                                value={renderChips(candidate?.preferredJobCity)}
                            />
                            <DetailRow
                                logo="cog-outline" 
                                label="Skills"
                                value={renderChips(candidate?.skills)}
                            />
                            <DetailRow
                                logo="language-outline"
                                label="English"
                                value={
                                    candidate?.englishProficiency ? (
                                        <Text className="text-sm text-gray-650">
                                            {candidate?.englishProficiency}
                                        </Text>
                                    ) : (
                                        <Text className="text-sm text-gray-650">Not Provided</Text>
                                    )
                                }
                            />
                            <DetailRow
                                logo="language-outline"
                                label="Languages"
                                value={renderChips(candidate?.otherLanguages)}
                            />
                            <DetailRow
                                logo="language-outline"
                                label="Matching Criterion"
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

                                        className={`rounded-md py-2 px-4 mr-2 ${candidate?.User?.phone
                                            ? 'bg-white border border-blue-500'
                                            : 'bg-blue-500'
                                            }`}
                                    >
                                        <Text
                                            className={`font-medium text-center ${candidate?.User?.phone ? 'text-blue-500' : 'text-blue'
                                                }`}
                                        >
                                            {candidate?.User?.phone ? candidate?.User?.phone : 'View Phone Number'} 
                                        </Text>
                                    </TouchableOpacity>
                                </View>


                            </View>
                        </View>
                        {/* Divider section */}
                        <View className="h-[1px] bg-gray-300 w-full my-4" />

                        <View className="flex flex-row justify-between text-xs">
                            <View className="flex flex-row gap-1">
                                <Text className="text-gray-600 text-xs">
                                    Profile Unlocked
                                </Text>
                            </View>
                            <View className="flex flex-row gap-1">
                                <View className="flex flex-row items-center">
                                    <Paperclip size={12} className="text-gray-600 mr-1" />
                                    <Text className="text-gray-600 text-xs">
                                        {candidate?.resumeURL ? "Cv Attached" : "Cv not Attached"}
                                    </Text>
                                </View>
                                <Text className="text-gray-600 text-xs">|</Text>
                                <View>
                                    <Text className="text-gray-600 text-xs">
                                        Active on {candidate?.updatedAt.split("T")[0]}
                                    </Text>
                                </View>
                            </View>
                        </View>


                    </View>
                }
            </ScrollView>

            {/* Profile Model */}
            {openProfileModal && <View className="">
                <ProfileModal
                    open={openProfileModal}
                    onClose={() => setOpenProfileModal(false)}
                    jobId={candidate?.jobId}
                    candidate={candidate}
                    phone={candidate?.User?.phone}
                    isDatabase={false}
                    id={candidate?.id}
                    status={candidate?.status}
                />
            </View>}
        </>
    )
}

export default CandidateCard;