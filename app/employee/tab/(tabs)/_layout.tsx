import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { View, Text } from "react-native";
import Header from "../../header";
import { Background } from "@react-navigation/elements";

const TabIcon = ({ focused, icon }) => {
  return (
    <View className="justify-center items-center flex flex-col -mb-5">
      {/* Icon */}
      {icon.type === "ion" ? (
        <Ionicons name={focused ? icon.name : `${icon.name}-outline`} size={focused ? 32 : 25} color={"white"} />
      ) : (
        <MaterialCommunityIcons
          name={focused ? icon.name : `${icon.name}-outline`}
          size={focused ? 32 : 25}
          color={"white"}
        />
      )}
      {/* Tab Name (always visible) */}
      <Text
        className={`text-white text-xs ${focused ? "font-bold " : "opacity-80"}`}
      >
        {icon.title}
      </Text>
    </View>
  );
};

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        header: () => <Header />, // custom header for all tabs
        tabBarShowLabel: false, // This is correct, as you're handling the labels in TabIcon
        tabBarStyle: {
          height: 60,
          paddingVertical: 6,
          backgroundColor: "#0784C9",
          borderRadius: 50,
          width: "90%",
          marginBottom: 50,
          marginLeft: 20,
          position: "absolute",
        },
        sceneStyle:{
          paddingBottom:80,
        },
        tabBarIconStyle: {
          width: "20vw",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={{ type: "ion", name: "home", title: "Home" }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="applied"
        options={{
          title: "Applied",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={{
                type: "ion",
                name: "document-text",
                title: "Applied",
              }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={{
                type: "ion",
                name: "person-circle",
                title: "Profile",
              }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="help"
        options={{
          title: "Help",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={{
                type: "ion",
                name: "help-circle",
                title: "Help",
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}