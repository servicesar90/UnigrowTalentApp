import { Image, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Menu, Divider } from "react-native-paper"
import { apiFunction } from '@/app/api/apiFunction';
import { logOutApi } from '@/app/api/api';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

type ProfileModalProps = {
  open: boolean;
  onClose: () => void;
  anchor: React.RefObject<any>;
  employee: {
    id: number;
    fullName: string;
    phone: string;
    profileImage: URL;
    gender: string;
  };
};

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose, anchor, employee }) => {
  const [user, setUser] = useState(null)
  const [anchorPosition, setAnchorPosition] = useState(null);
  const router = useRouter();


  const getUser = async () => {
    const userr = await AsyncStorage.getItem("User");
    if (userr) {
      setUser(JSON.parse(userr))
    }

  }

  useEffect(() => {
    anchor.current?.measureInWindow((x, y, width, height) => {
      setAnchorPosition({ x: x + width, y: y + height + 35 });
    })
    getUser()
  }, [anchor]);


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
        text2: "Could Not Logout"
      })
    }
  };



  return (
    <Menu
      visible={open}
      onDismiss={onClose}
      anchor={anchorPosition && anchorPosition}
      style={{
        borderRadius: 12,
        elevation: 4,
      }}
      contentStyle={{
        backgroundColor: "white",
        paddingVertical: 8,
        minWidth: 220,
      }}
    >
      {/* Profile Section */}
      <View className="flex flex-row items-center gap-3 px-3 py-2">
        <View className="h-12 w-12 rounded-full overflow-hidden border border-gray-300">
          <Image
            source={
              employee?.profileImage
                ? { uri: employee.profileImage }
                : employee?.gender === "Female" ? require("../../../assets/images/worker.png") : require("../../../assets/images/accountant.png")
            }
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>
        <View>
          <Text style={{ fontWeight: "600", fontSize: 16 }}>
            {employee?.fullName}
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 14 }}>
            {user?.phone || "No number"}
          </Text>
        </View>
      </View>

      <Divider />

      {/* Menu Items */}
      {/* <Menu.Item
        onPress={() => { }}
        title="Settings"
        leadingIcon="cog"
        titleStyle={{ fontSize: 15 }}
      /> */}
      <Menu.Item
        onPress={() => {
          onClose()
          router.push("/employee/tab/(tabs)/help") 
        }}
        title="Help & Support"
        leadingIcon="help-circle"
        titleStyle={{ fontSize: 15, color: "black" }}
      />

      <Divider />

      <Menu.Item
        onPress={logOut}
        title="Sign Out"
        leadingIcon="logout"
        titleStyle={{ color: "red", fontWeight: "600" }}
      />
    </Menu>
  )
}

export default ProfileModal;