import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  Modal,
} from "react-native";
import { User } from "lucide-react-native";

import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "../Redux/getData";
import ProfileModal from "./modals/profileModal";
import Toast from "react-native-toast-message";


export default function Header() {
  const [darkTheme, setDarktheme] = useState(false);
  const [openModel, setOpenModel] = useState(false);
  const anchorRef = useRef(null);
  const dispatch = useDispatch();

  const { employee } = useSelector((state) => state.getDataReducer);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  const openMenu = () => {
    setOpenModel(true);
  };

  // const themeChanged = ()=>{
 
  //   setDarktheme(!darkTheme);
  //     Toast.show({
  //     type:"success",
  //     text1: "Theme",
  //     text2: "Theme Changed Succesfully",
      
  //   })

    
  // }


 

  return (
   
      <View className="bg-white border-b border-gray-200 shadow-sm h-20 justify-center mt-10 ">
      <View className="px-4 flex-row justify-between items-center h-16">
        {/* Left side - Logo */}
        <View className="flex-row items-center">
          <Image
            source={require("../../assets/images/unigrowLogo.png")}
            className="h-[50] w-[65%]"
          />
        </View>

        {/* <Switch
          trackColor={{ false: "#767577", true: "#0784c9" }}
          thumbColor={darkTheme ? "#fff" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          value={darkTheme}
          onValueChange={themeChanged}
        /> */}

        {/* Right side - Actions */}
        <View ref={anchorRef} className="flex-row items-center gap-3 space-x-4">
          {/* Avatar */}
          <TouchableOpacity
            onPress={openMenu}
            className="h-8 w-8 rounded-full overflow-hidden bg-blue-600 items-center justify-center"
          >
            {employee?.profileImage ? (
              <View className="h-full w-full rounded-full overflow-hidden border-2 border-[#0784C9]">
                <Image
                  source={{ uri: employee?.profileImage }}
                  style={{ width: "120%", height: "120%" }}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <User size={16} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {openModel && (
        <ProfileModal
          open={openModel}
          onClose={() => setOpenModel(false)}
          anchor={anchorRef}
          employee={employee}
        />
      )}
    </View>
   
    
  );
}
