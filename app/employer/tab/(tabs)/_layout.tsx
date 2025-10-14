import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { View, Text } from "react-native";
import Header from "../../header";

const TabIcon = ({ focused, icon }) => {
  return (
    <View className="justify-center items-center flex flex-col py-2 -mb-5">
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
        className={`text-white text-xs ${focused ? "font-bold mt-1" : "opacity-80"}`}
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
        header: () => <Header />,
        tabBarShowLabel: false,
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
          marginBottom: 80 
        },
        tabBarIconStyle: {
          width: "20vw",
        },
      }}
    >
      <Tabs.Screen
        name="Jobs"
        options={{
          title: "Jobs",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={{ type: "ion", name: "briefcase", title: "Jobs" }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Database"
        options={{
          title: "Database",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={{
                type: "ion",
                name: "server",
                title: "Database",
              }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Credits"
        options={{
          title: "Credits & Usage",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={{
                type: "ion",
                name: "cash",
                title: "Balance",
              }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Bills"
        options={{
          title: "Bills",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon={{
                type: "ion",
                name: "document-text",
                title: "Bills",
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}