import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { HandCoins, DatabaseIcon, User } from 'lucide-react-native'
import { fetchEmployerProfile, fetchCredits } from "../Redux/getData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFunction } from "../api/apiFunction";
import { logOutApi } from "../api/api";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Divider, Menu } from "react-native-paper";
import ProfileImageModal from "./modals/ProfileImageModal";
// import ProfileModal from "./modals/ProfileModal";

export default function Header() {

    const [openModel, setOpenModel] = useState(false);
    const [user, setUser] = useState(null)
    const anchorRef = useRef(null);
    const dispatch = useDispatch();
    const [anchorPosition, setAnchorPosition] = useState({ x: 0, y: 0 });
    const [openFileModal, setOpenFileModal] = useState(false)
    const router = useRouter();


    const { employer, jobCredit, dataBaseCredit } = useSelector((state) => state.getDataReducer);

    const getUser = async () => {
        const userr = await AsyncStorage.getItem("User");
        if (userr) {
            setUser(JSON.parse(userr))
        }

    }



    useEffect(() => {
        dispatch(fetchEmployerProfile());
        dispatch(fetchCredits());
        getUser(); 
    }, [dispatch]);

    const handlePress = () => {
        if (anchorRef.current) {
            anchorRef.current.measureInWindow((x, y, width, height) => {
                setAnchorPosition({ x: x + width, y: y + height + 35 });
                setOpenModel(true);
            });
        }
    };



    const logOut = async () => {

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
    };






    return (
        <View className="bg-white border-b border-gray-200 shadow-sm h-20 justify-center mt-10 ">
            <View className="p-4 flex-row justify-between items-center h-16 ">
                {/* Left side - Logo */}
                <View className="flex-row  items-center  ">
                    <Image source={require("../../assets/images/unigrowLogo.png")} className="h-[50] w-[65%] ml" />
                </View>


                <View
                    className="flex flex-row items-center gap-2 text-sm text-gray-300 -ml-10 "
                >
                    <View className="flex flex-row gap-1 justify-center items-center">
                        <HandCoins size='18' />
                        <Text>{jobCredit ? jobCredit : 0}</Text>
                    </View>

                    <View className="flex flex-row gap-1 justify-center items-center ">
                        <DatabaseIcon size="18" />
                        <Text>{dataBaseCredit ? dataBaseCredit : 0}</Text>
                    </View>
                </View>

                {/* <Switch
          trackColor={{ false: "#767577", true: "#0784c9" }}
          thumbColor={darkTheme ? "#fff" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          value={darkTheme}
          onValueChange={() => setDarktheme(!darkTheme)}
        /> */}



                {/* Right side - Actions */}
                <View ref={anchorRef} className="flex-row items-center gap-5  ">


                    {/* Avatar */}
                    <TouchableOpacity onPress={handlePress} className="h-8 w-8 rounded-full overflow-hidden bg-blue-600 items-center justify-center">
                        {employer?.profile ? (
                            <View className="h-full w-full rounded-full overflow-hidden border-2 border-[#0784C9]">
                                <Image
                                    source={{ uri: employer.profile }}
                                    style={{ width: "120%", height: "120%", borderColor: '#078' }}
                                    resizeMode="cover"
                                />
                            </View>

                        ) : (
                            <User size={16} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>


                        {/* profile Model Begin */}
            {openModel &&
                <View>
                    <Menu
                        visible={openModel}
                        onDismiss={() => setOpenModel(false)}
                        anchor={anchorPosition && anchorPosition}
                        style={{
                            borderRadius: 12,
                            elevation: 4,
                        }}
                        contentStyle={{
                            backgroundColor: "white",
                            paddingVertical: 6,
                            minWidth: 220,
                        }}
                    >
                        {/* Profile Section */}
                        <View className="flex flex-row items-center gap-3 px-3 py-2">
                            <TouchableOpacity onPress={() => {
                                setOpenFileModal(true)

                            }}>
                                <View className="h-12 w-12 rounded-full overflow-hidden border border-gray-300 border-2 border-[#0784C9]"

                                >
                                    <Image
                                        source={
                                            employer?.profile
                                                ? { uri: employer.profile }
                                                : employer?.gender === "Female" ? require("../../assets/images/worker.png") : require("../../assets/images/accountant.png")
                                        }

                                        style={{ width: "100%", height: "100%" }}
                                        resizeMode="cover"
                                    />
                                </View>
                            </TouchableOpacity>

                            <View>
                                <Text style={{ fontWeight: "600", fontSize: 16 }}>
                                    {employer?.name}
                                </Text>
                                <Text style={{ color: "#6b7280", fontSize: 14 }}>
                                    {user?.phone || "No number"}
                                </Text>
                            </View>
                        </View>

                        <Divider />

                        {/* Menu Items */}
                        <Menu.Item
                            onPress={() => {
                                setOpenModel(false)
                                router.push("/employer/Screens/Profile")
                            }}
                            title="View Profile"
                            leadingIcon="cog"
                            titleStyle={{ fontSize: 15, color: 'black' }}
                        />
                        <Menu.Item
                            onPress={() => {
                                setOpenModel(false)
                                router.push("/employer/Screens/CompanyProfile")
                            }}
                            title="Company Detail"
                            leadingIcon="help-circle"
                            titleStyle={{ fontSize: 15, color: 'black' }}
                        />
                        {/* <Menu.Item
          onPress={() => { }}
          title="Verify Gst"
          leadingIcon="help-circle"
          titleStyle={{ fontSize: 15, color: 'black' }}
        /> */}

                        <Divider />

                        <Menu.Item
                            onPress={logOut}
                            title="Sign Out"
                            leadingIcon="logout"
                            titleStyle={{ color: "red", fontWeight: "600" }}
                        />
                    </Menu>
                    {openFileModal && (
                        <ProfileImageModal open={openFileModal} label={"Profile Image"} onClose={() => setOpenFileModal(false)} metaData={{ field: "employerProfile", Api: profilePicUploadApi, default: null }} />

                    )}

                </View>

            }

                {/* profile model end */}




        </View>
    );
}
