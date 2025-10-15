// app/company-profile.js 
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
} from "react-native";
import { Linkedin, PlusCircle } from "lucide-react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployerProfile } from "../../Redux/getData";
import CompanyProfileImage from "../modals/companyImageModal";
import { logoUploadApi } from "../../api/api";
import UpdateProfileModal from "../modals/updateProfileModal"


const CompanyProfile = () => {
    const [openModal, setOpenModal] = useState(false);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const [modalField, setModalField] = useState(null);
    const [openFileModal, setOpenFileModal] = useState(false);
    const [fields, setField] = useState([]);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchEmployerProfile());
    }, [dispatch]);
    const { employer } = useSelector((state) => state.getDataReducer);
    console.log("emp",employer);
    

    useEffect(() => {
        if (employer) {
            const companyInfo = [
                {
                    label: "Company name",
                    name: "companyName",
                    value: employer?.company?.companyName,
                },
                {
                    label: "Founded",
                    name: "founded",
                    value: employer?.company?.founded
                        ? employer?.company.founded
                        : "Not available",
                },
                {
                    label: "Website",
                    name: "website",
                    value: employer?.company?.website
                        ? employer?.company.website
                        : "Not available",
                },
                {
                    label: "Company size",
                    name: "numOfEmployees",
                    value: employer?.company?.numOfEmployees,
                },
                {
                    label: "Type of company",
                    name: "isConsultancy",
                    value: employer?.company?.isConsultancy
                        ? "Consultancy"
                        : "Not Consultancy",
                },
                {
                    label: "Industry",
                    name: "industry",
                    value: employer?.company?.industry
                        ? employer?.company.industry
                        : "Not Available",
                },
                {
                    label: "About Company",
                    name: "about",
                    value: employer?.company?.about
                        ? employer?.company.about
                        : "Not Available",
                }
            ]
            setField(companyInfo);
        }
    }, [employer]);

    const showUpdateModal = (item) => {
        setModalField(item); // e.g., { label: "Company name", name: "companyName", value: "..." }
        setOpenUpdateModal(true);
    };

    const showModal = (item) => {
        setModalField(item);
        setOpenModal(true);
    };
    const handleUpdateSuccess = () => {
        dispatch(fetchEmployerProfile());
    };

    return (
        <ScrollView
            className="w-full h-full mx-auto px-4 pb-10 bg-[#DEF3F9] flex flex-col gap-2"
        >


            {/* Alert */}
            <View
                className="flex flex-col border-l-4 text-sm mb-4 rounded p-4 mt-4"
                style={{
                    backgroundColor: "white",
                    borderLeftColor: "#0784C9",
                    color: "#003B70",
                }}
            >
                <Text className="font-medium text-[#003B70]">
                    Please share company information to improve job seekers trust.
                </Text>
                <Text className="ml-1 font-semibold text-[#003B70]">
                    Update 7 information
                </Text>
            </View>

            {/* Profile Card */}



            <View className="bg-white rounded shadow-lg shadow-gray-500 p-6 w-full mb-20">
                <Text className="text-xl font-bold mb-4 text-[#003B70]">
                    Company details
                </Text>

                <View className="flex-row items-start space-x-4 gap-2 mb-6">
                    {employer?.company?.logoUrl ? (
                        <TouchableOpacity
                        onPress={() => setOpenFileModal("logo")}
                        >
                        <Image
                            source={{ uri: employer?.company.logoUrl }}
                            className="w-14 h-14 rounded-full border-2 border-[#0784C9] "
                        />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity>
                        <View className="w-14 h-14 rounded-full flex items-center justify-center font-semibold text-lg"
                            style={{ backgroundColor: "#0784C9" }}>
                            <Text className="text-white text-lg">
                                {employer?.company?.companyName?.split("")[0]?.toUpperCase()}
                            </Text>
                        </View>
                        </TouchableOpacity>
                    )}

                    <View className="flex-1">
                        <View className="flex-row items-center gap-3 mb-2">
                            <Text className="text-xl font-bold text-[#003B70]">
                                {employer?.company?.companyName || "Your Company Name"}
                            </Text>
                            {/* <TouchableOpacity
                                onPress={() => setOpenFileModal("logo")}
                                className="flex-row items-center px-3 py-1 gap-1 rounded-md text-xs font-medium transition-all duration-200"
                                style={{
                                    color: "#0784C9",
                                    backgroundColor: "rgba(7, 132, 201, 0.1)",
                                    borderWidth: 1,
                                    borderColor: "rgba(7, 132, 201, 0.3)",
                                }}
                            >
                                <PlusCircle size={12} className="mr-1 text-[#0784C9]" />
                                <Text className="text-[#0784C9] text-xs">Update Logo</Text>
                            </TouchableOpacity> */}

                        </View>
                        <View className="flex-row flex-wrap gap-2">
                            <Text
                                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: "#0784C9" }}
                            >
                                {employer?.company?.industry || "Industry"}
                            </Text>
                            <Text
                                className="px-3 py-1 rounded-full text-xs font-medium border border-[#0784C9] text-[#003B70] bg-white"
                            >
                                {employer?.company?.numOfEmployees || "Team Size"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Info List */}
                <View className="pr-2">
                    {fields.map((item, index) => {
                        const hasValue = item.value && item.value !== "Not available";
                        return (
                            <View
                                key={index}
                                className={`flex-row justify-between items-center text-left py-3 border-b-1 transition-all duration-200 rounded-lg px-4 mb-2 ${hasValue ? "bg-[#DFF3F9] border-blue-300" : "bg-gray-100 border-gray-200"
                                    }`}
                            >
                                <View>
                                    <View className={`flex-row justify-between items-center pb-2 w-full`}>
                                    <Text className="text-sm font-semibold text-[#003B70]">
                                        {item.label}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => showUpdateModal(item)}
                                        className="flex-row  items-center gap-2 hover:underline text-sm px-3 py-1 rounded-md transition-all duration-200"
                                        style={{
                                            color: "#0784C9",
                                            backgroundColor: "rgba(7, 132, 201, 0.1)",
                                        }}
                                    >
                                        <PlusCircle size={16} className="mr-1" />
                                        <Text className="text-[#0784C9] text-sm">Suggest</Text>
                                    </TouchableOpacity>
                                    </View>
                                    <Text
                                        className={`text-sm ${item.value === "Not available" ? "italic text-gray-500" : "text-[#003B70]"
                                            }`}
                                    >
                                        {item.value}
                                    </Text>
                                </View>

                            </View>
                        );
                    })}
                </View>

            </View>

            {/* Social Profiles */}


            {/* Modals will be handled via component state/router modal logic */}

            {openFileModal && (
                <CompanyProfileImage open={openFileModal === "logo"} label={"Logo Update"} onClose={() => setOpenFileModal(null)} metaData={{ field: "logo", Api: logoUploadApi, default: null }} />

            )}

            {openUpdateModal && modalField && (
                <UpdateProfileModal
                    open={openUpdateModal}
                    label={modalField.label}
                    name={modalField.name}
                    value={modalField.value}
                    onClose={() => setOpenUpdateModal(false)}
                    onUpdate={handleUpdateSuccess} />
            )}
        </ScrollView>
    );
};
export default CompanyProfile;