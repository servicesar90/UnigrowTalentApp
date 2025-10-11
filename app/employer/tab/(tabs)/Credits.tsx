import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchCredits } from "../../../Redux/getData";
import { router } from "expo-router";
import { apiFunction } from "../../../api/apiFunction";
import { creditReportApi } from "@/app/api/api";
import { Calendar, CalendarX2 } from "lucide-react-native";
import { DatePickerModal } from "react-native-paper-dates";
import Toast from "react-native-toast-message";

const CreditsUsage = () => {
  const [showDatabaseCredit, setShowDatabaseCredit] = useState(false);
  const [showJobCredit, setShowJobCredit] = useState(false);
  const dispatch = useDispatch();
  const [tab, setTab] = useState(0);
  const [allTransactions, setAllTransactions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dates, setDates] = useState(null)




  const getTransactions = async () => {
    try {
      const response = await apiFunction(`${creditReportApi}${dates?.startDate ? `?startDate=${dates?.startDate?.toISOString().split("T")[0]}` : ""}${dates?.endDate ? `&endDate=${dates?.endDate?.toISOString().split("T")[0]}` : ""}`, null, null, "get", true)


      if (response) {
        setTransactions(response?.data);
        setAllTransactions(response?.data);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {


    getTransactions()

  }, [dates])




  useEffect(() => {
    dispatch(fetchCredits());
    getTransactions();
  }, [dispatch]);

  const { jobCredit, dataBaseCredit, creditsData } = useSelector((state) => state.getDataReducer);



  const handleTabChange = (newValue) => {
    setTab(newValue);

    switch (newValue) {
      case 0:
        setTransactions(allTransactions);
        break;
      case 1:
        const added = allTransactions.filter((txn) => txn.credit === "added");
        setTransactions(added);
        break;
      case 2:
        const spent = allTransactions.filter((txn) => txn.credit === "spent");
        setTransactions(spent);
        break;
      default:
        setTransactions(allTransactions);
        break;
    }
  };

  return (
    <View className="flex-1 bg-[#DEF3F9]">
      <View className="p-4 mx-auto w-full max-w-2xl">
        {/* Header and Button */}
        <View className="flex-row justify-between items-center mb-5 bg-white p-4 rounded-lg shadow-md">
          <Text className="text-xl font-semibold text-[#003B70]">
            Credits & Usage
          </Text>
          <TouchableOpacity
            onPress={() => router.push("../../Screens/SelectPlan")}
            className="bg-[#0784C9] py-2 px-4 rounded-md"
          >
            <Text className="text-white text-sm font-bold ">
              Buy more credits
            </Text>
          </TouchableOpacity>
        </View>

        {/* Available Credits Section */}

        <ScrollView>
          <View className="bg-white p-4 rounded-lg mb-4 shadow-md">
            <Text className="text-base font-semibold text-[#003B70] mb-2">
              Available Credits
            </Text>
            <Text className="text-[#0784C9] mb-4 text-xs">
              Credits are charged each time you retrieve job posting and database unlocks.
            </Text>
            <View className="flex-row gap-4">
              {/* Job Credits */}
              <View className="bg-[#DEF3F9] p-3 rounded-md border border-[#0784C9] flex-1">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="briefcase-outline" size={16} color="#0784C9" />
                    <Text className="text-sm font-semibold text-[#003B70]">
                      Job Credits
                    </Text>
                  </View>

                </View>
                <TouchableOpacity onPress={() => setShowJobCredit(!showJobCredit)}>
                  <View className='flex flex-row gap-3  items-center '>
                    <Text className="text-[#0784C9] text-xs underline">
                      {showJobCredit ? "Hide" : "View"} all
                    </Text>
                    <Text className="text-md font-bold text-[#0784C9]">
                      {jobCredit && jobCredit}
                    </Text>
                  </View>

                </TouchableOpacity>
                {showJobCredit && (
                  <View className="mt-3">
                    <View className="flex-row gap-2 p-2 bg-white rounded-sm mb-2 font-semibold text-xs text-[#003B70]">
                      <Text className="flex-1 text-xs">Job Credits</Text>
                      <Text className="flex-1 text-xs">Expires On</Text>
                    </View>
                    {/* {creditsData?.map((credit, index) => (
                      
                      <View
                        key={index}
                        className="flex-row gap-2 p-2 bg-white rounded-sm mb-1 text-xs"
                      >
                        <Text className="flex-1 text-[#0784C9] font-semibold">
                          {credit.job_credits.length > 0 ? credit.job_credits: "credite used"}
                        </Text>
                        <Text className="flex-1 text-[#003B70]">
                          {credit.expired_at?.split("T")[0]}
                        </Text>
                      </View>
                    ))} */}

                    {creditsData?.map((credit, index) => (
                      <React.Fragment key={index}>
                        {credit?.job_credits > 0 ? (
                          <View
                            className="flex-row gap-2 p-2 bg-white rounded-sm mb-1 text-xs"
                          >
                            <Text className="flex-1 text-[#0784C9] text-xs font-semibold">
                              {credit.job_credits}
                            </Text>
                            <Text className="flex-1 text-xs text-[#003B70] font-semibold">
                              {credit.expired_at?.split("T")[0]}
                            </Text>
                          </View>
                        ) : null}
                      </React.Fragment>
                    ))}
                  </View>
                )}
              </View>

              {/* Database Credits */}
              <View className="bg-[#DEF3F9] p-3 rounded-md border border-[#0784C9] flex-1">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="people-outline" size={16} color="#0784C9" />
                    <Text className="text-sm font-semibold text-[#003B70]">
                      Database Credits
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowDatabaseCredit(!showDatabaseCredit)}>
                  <View className='flex flex-row gap-3 items-center'>
                    <Text className="text-[#0784C9] text-xs underline">
                      {showDatabaseCredit ? "Hide" : "View"} all
                    </Text>
                    <Text className="text-md font-bold text-[#0784C9]">
                      {dataBaseCredit && dataBaseCredit}
                    </Text>
                  </View>

                </TouchableOpacity>
                {showDatabaseCredit && (
                  <View className="mt-3">
                    <View className="flex-row gap-2 p-2 bg-white rounded-sm mb-2 font-semibold text-xs text-[#003B70]">
                      <Text className="flex-1 text-xs">Database Credits</Text>
                      <Text className="flex-1 text-xs">Expires On</Text>
                    </View>
                    {creditsData?.map((credit, index) => (
                      <React.Fragment key={index}>
                        {credit?.database_credits > 0 ? (
                          <View
                            className="flex-row gap-2 p-2 bg-white rounded-sm mb-1 text-xs"
                          >
                            <Text className="flex-1 text-[#0784C9] text-xs font-semibold">
                              {credit.database_credits}
                            </Text>
                            <Text className="flex-1 text-xs text-[#003B70] font-semibold">
                              {credit.expired_at?.split("T")[0]}
                            </Text>
                          </View>
                        ) : null}
                      </React.Fragment>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Transaction History Section */}
          <View className="bg-white p-4 rounded-lg shadow-md mb-[100]">
            <View className="flex flex-row mb-4 justify-between items-center">

              <Text className="text-lg font-semibold  text-[#003B70]">
                Transaction History
              </Text>
              {!dates ?
                <TouchableOpacity onPress={() => setShowDatePicker(true)} ><Calendar size={22} color={"#0784c9"} /></TouchableOpacity>
                : <TouchableOpacity onPress={() => setDates(null)} > <CalendarX2 size={22} color={"#0784c9"} /></TouchableOpacity>

              }
            </View>
            {showDatePicker &&
              <DatePickerModal
                locale="en"
                mode="range"
                visible={showDatePicker}
                startDate={dates?.startDate}
                endDate={dates?.endDate}
                onDismiss={() => setShowDatePicker(false)}
                onConfirm={({ startDate, endDate }) => {
                  if (startDate && startDate.getTime() <= Date.now()) {
                    setShowDatePicker(false);

                    setDates({ startDate, endDate });

                  } else {
                    Toast.show({
                      type: "error", // better type than "success" for invalid case
                      text1: "Date Range",
                      text2: "Could not choose this date"
                    });
                  }
                }}


              />
            }
            <View className="flex-row flex-wrap gap-2 mb-4">
              <TouchableOpacity
                onPress={() => handleTabChange(0)}
                className={`py-1.5 px-4 rounded-full border ${tab === 0 ? "bg-[#0784C9] border-transparent" : "bg-white border-[#0784C9]"}`}
              >
                <Text className={`text-xs font-medium ${tab === 0 ? "text-white" : "text-[#0784C9]"}`}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleTabChange(1)}
                className={`py-1.5 px-4 rounded-full border ${tab === 1 ? "bg-[#0784C9] border-transparent" : "bg-white border-[#0784C9]"}`}
              >
                <Text className={`text-xs font-medium ${tab === 1 ? "text-white" : "text-[#0784C9]"}`}>Credits added</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleTabChange(2)}
                className={`py-1.5 px-4 rounded-full border ${tab === 2 ? "bg-[#0784C9] border-transparent" : "bg-white border-[#0784C9]"}`}
              >
                <Text className={`text-xs font-medium ${tab === 2 ? "text-white" : "text-[#0784C9]"}`}>Credits spent</Text>
              </TouchableOpacity>
            </View>

            {/* Table */}
            <View className="">
              <View className="">
                <View className="flex-row bg-[#DEF3F9] border-t border-b border-[#0784C9]">
                  <View className="flex-1 p-3">
                    <Text className="text-xs font-semibold text-[#003B70]">Transaction details</Text>
                  </View>
                  <View className="flex-1 p-3">
                    <Text className="text-xs font-semibold text-[#003B70]">Credits</Text>
                  </View>
                  <View className="flex-1 p-3">
                    <Text className="text-xs font-semibold text-[#003B70]">Date & Time</Text>
                  </View>
                </View>

                {/* Table Body */}

                {transactions?.length > 0 ? (
                  transactions.map((txn, index) => (
                    <View
                      key={index}
                      className="flex-row border-b border-[#DEF3F9]"
                    >
                      <View className="flex-1 p-3">
                        <Text className="text-sm text-[#003B70]">
                          {txn?.credit === "spent" ? "Credit Spent" : "Credit Added"}
                        </Text>
                        <Text className="text-xs text-[#0784C9] " numberOfLines={1} ellipsizeMode="tail">{txn.action}</Text>
                      </View>
                      <View className="flex-1 p-3">
                        <Text className="text-sm text-[#003B70]">{txn?.creditsUsed}</Text>
                        <Text className="text-xs ml-1 text-[#0784C9]">{txn?.type}</Text>
                      </View>
                      <View className="flex-1 p-3">
                        <Text className="text-sm text-[#003B70]">
                          {txn?.createdAt?.split("T")[0]}
                        </Text>
                        <Text className="text-xs text-[#0784C9]">{formatTime(txn?.createdAt)}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View className="flex-row justify-center p-4">
                    <Text className="text-center text-gray-500">No transactions found.</Text>
                  </View>
                )}



              </View>
            </View>
          </View>
        </ScrollView>

      </View>
    </View>
  );
};

export default CreditsUsage;