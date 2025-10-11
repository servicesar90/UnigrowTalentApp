
import { View, Text, Pressable, ScrollView } from "react-native";
import SearchCandidates from '../../Screens/SearchCandidate'
import {UnlockedCandidatesPage} from '../../Screens/unlockedCandidates'
import { useState } from "react";




// Yahan aapka refactored Database component hai
const Database = () => {
  const [activeTab, setActiveTab] = useState("search");

  return (
    <View className="flex-1 bg-[#DEF3F9]">
      {/* Header */}
      

      {/* Tab Bar */}
      <View className="flex-row p-2 bg-white rounded-xl shadow-lg m-4">
        <Pressable
          className={`flex-1 items-center py-3 rounded-lg ${
            activeTab === "search" ? "bg-[#0784C9]" : "bg-transparent"
          }`}
          onPress={() => {setActiveTab("search")
            
          }}
        >
          <Text
            className={`font-semibold ${
              activeTab === "search" ? "text-white" : "text-[#003B70]"
            }`}
          >
            Search Candidates
          </Text>
        </Pressable>
        <Pressable
          className={`flex-1 items-center py-3 rounded-lg ${
            activeTab === "saved" ? "bg-[#0784C9]" : "bg-transparent"
          }`}
          onPress={() => setActiveTab("saved")}
        >
          <Text
            className={`font-semibold ${
              activeTab === "saved" ? "text-white" : "text-[#003B70]"
            }`}
          >
            Unlocked Candidates
          </Text>
        </Pressable>
      </View>

      {/* Conditional rendering of the selected screen */}
      <ScrollView className="flex-1 ">
        {activeTab === "search" ? <SearchCandidates /> : <UnlockedCandidatesPage />}
      </ScrollView>
    </View>
  );
};

export default Database;



