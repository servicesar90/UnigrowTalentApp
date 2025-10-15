import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getBill, getPlans } from "../../api/apiFunction";
// import { showErrorToast } from "../ui/toast";
// import { Dialog } from "@rneui/themed";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Modal } from "react-native-paper";
import Toast from "react-native-toast-message";


// Helper component for Plan Card
const PlanCard = ({ plan, freeUsed, handleSelect, icons }) => {
  const isBasicAndUsed = plan?.name === "Basic" && freeUsed;


  const IconComponent = ({ index }) => {
    const iconData = icons[index];
    if (!iconData) return null;

    const { library, name, color } = iconData;

    const IconLib =
      library === "Ionicons"
        ? Ionicons
        : library === "MaterialCommunityIcons"
          ? MaterialCommunityIcons
          : FontAwesome;



    return <IconLib name={name} size={14} color={color} />;
  };



  return (
    <View
      style={{
        width: 288,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 16,
        padding: 24,
        shadowColor: "#000",
        elevation: 10,
      }}
    >

      <View className="flex items-center justify-center text-center mb-5">
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          {plan.name}
        </Text>
        <View className="bg-gray-50 px-2 py-1 rounded-xl">
          <Text className="text-xs text-gray-600 font-medium">
            {plan.Validity} days validity
          </Text>
        </View>
      </View>

      <View className="text-center justify-center items-center flex mb-3">
        <Text className="text-3xl font-extrabold">
          ₹{plan.price}
        </Text>
      </View>

      {/* <View className="grid grid-rows-2 gap-3 mb-6">
        <View className="bg-blue-100/70 p-3 rounded-xl border border-blue-200 text-center">
          <View className="flex items-center justify-center mb-1">
            <FontAwesome name="briefcase" size={20} color="#0784C9" />
          </View>
          <Text className="text-lg font-bold text-[#0784C9]">
            {plan.job_credits}
          </Text>
          <Text className="text-[10px] text-gray-600 font-medium">
            Job Credits
          </Text>
        </View>
        <View className="bg-green-100/70 p-3 rounded-xl border border-green-200 text-center">
          <View className="flex items-center justify-center mb-1">
            <MaterialCommunityIcons name="database" size={20} color="#16a34a" />
          </View>
          <Text className="text-lg font-bold text-[#16a34a]">
            {plan.Database_credits}
          </Text>
          <Text className="text-[10px] text-gray-600 font-medium">
            Database
          </Text>
        </View>
      </View> */}

      <View className="flex flex-row gap-3 mb-6 justify-between">
        {/* Job Credits Box */}
        <View className="flex-1 bg-blue-100/70 p-3 rounded-xl border border-blue-200 items-center">
          <View className="flex items-center justify-center mb-1">
            <FontAwesome name="briefcase" size={20} color="#0784C9" />
          </View>
          <Text className="text-lg font-bold text-[#0784C9] text-center">
            {plan.job_credits}
          </Text>
          <Text className="text-[10px] text-gray-600 font-medium text-center">
            Job Credits
          </Text>
        </View>

        {/* Database Box */}
        <View className="flex-1 bg-green-100/70 p-3 rounded-xl border border-green-200 items-center">
          <View className="flex items-center justify-center mb-1">
            <MaterialCommunityIcons name="database" size={20} color="#16a34a" />
          </View>
          <Text className="text-lg font-bold text-[#16a34a] text-center">
            {plan.Database_credits}
          </Text>
          <Text className="text-[10px] text-gray-600 font-medium text-center">
            Database
          </Text>
        </View>
      </View>


      <View className="mb-12">
        {(Array.isArray(plan?.features) ? plan.features : JSON.parse(plan.features)).map((item, index) => (
          <View key={index} className="flex-row items-center gap-2 px-1 py-1">
            <IconComponent index={index} />
            <Text className="text-xs text-gray-700 font-medium">{item}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => handleSelect(plan)}
        disabled={isBasicAndUsed}
        className={`absolute bottom-5 right-10 w-[90%] py-3 rounded-xl font-semibold  duration-300 ${isBasicAndUsed ? "bg-gray-500" : "bg-[#0784c9]"}`}
      >
        <Text className="text-white text-center font-semibold">
          {isBasicAndUsed ? "Plan Used" : "Choose Plan"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function SelectPlan() {
  const [allplans, setAllPlans] = useState([]);
  const [filter, setFilter] = useState("Starter");
  const [plans, setPlan] = useState([]);
  const [freeUsed, setFreeUsed] = useState(false);
  const [openBillModal, setOpenBillModal] = useState(false);
  const [choosePlan, setChoosePlan] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const response = await getPlans();
      if (response) {
        setAllPlans(response.data.data);
      } else {
        Toast.show({
                type: "error",
                text1: "Could not fetch plans",
                text2: "Please try after some time"
              });
      }
    };

    const checkFreePlan = async () => {
      const response = await getBill();
      if (response) {
        const purchased = response?.data?.data?.filter(
          (dat) => dat.Plan?.name === "Basic"
        );
        if (purchased.length > 0) {
          setFreeUsed(true);
        }
      }
    };
    getData();
    checkFreePlan();
  }, []);

  useEffect(() => {
    let filteredPlans;
    switch (filter) {
      case "Starter":
        filteredPlans = allplans.filter((ele) => ele.Validity === 20);
        break;
      case "Monthly":
        filteredPlans = allplans.filter((ele) => ele.Validity === 30);
        break;
      case "Quarterly":
        filteredPlans = allplans.filter((ele) => ele.Validity === 90);
        break;
      case "Half Yearly":
        filteredPlans = allplans.filter((ele) => ele.Validity === 180);
        break;
      case "Yearly":
        filteredPlans = allplans.filter((ele) => ele.Validity === 365);
        break;
      default:
        filteredPlans = allplans;
        break;
    }
    setPlan(filteredPlans);
  }, [allplans, filter]);

  const handleSelect = async (plan) => {

    const price = plan?.price || 0;
    const CGST = +(price * 0.09).toFixed(2);
    const SGST = +(price * 0.09).toFixed(2);
    const basePlan = +price.toFixed(2);
    const total = +(basePlan + CGST + SGST).toFixed(2);

    const selectedPlan = { ...plan, price: total };
    console.log("seleceted", selectedPlan)
    await AsyncStorage.setItem("selectedPlan", JSON.stringify(selectedPlan));

    setChoosePlan({
      plan: basePlan,
      CGST,
      SGST,
      total,
      desc: plan?.description,
    });
    setOpenBillModal(true);
  };



  // Mapped your original icons to similar-looking ones from @expo/vector-icons
  const icons = [
    { library: "Ionicons", name: "eye-outline", color: "black" },
    { library: "MaterialCommunityIcons", name: "timer-sand", color: "blue" },
    { library: "Ionicons", name: "logo-whatsapp", color: "green" },
    { library: "MaterialCommunityIcons", name: "fire", color: "orange" },
    {
      library: "MaterialCommunityIcons",
      name: "align-vertical-top",
      color: "darkBlue",
    },
    { library: "Ionicons", name: "bulb-outline", color: "yellow" },
    { library: "Ionicons", name: "man-outline", color: "black" },
  ];

  return (
    // <View>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      className="flex-1  bg-[#DEF3F9]"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 100}
    >




      <ScrollView
        className="flex-1 bg-[#DEF3F9] p-5"
      >

        <View className="mb-20">
          <View className="text-center mb-8">
            <Text className="text-4xl font-extrabold text-[#065a94] mb-2">
              Choose Your Plan
            </Text>
            <Text className="text-lg text-[#065a94] font-normal">
              Select the perfect plan that fits your needs
            </Text>
          </View>



          <View className="flex-row flex-wrap justify-center gap-2 mb-12">
            {["Starter", "Monthly", "Quarterly", "Half Yearly", "Yearly"].map(
              (type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setFilter(type)}
                  className={`px-5 py-2 rounded-full border font-semibold text-sm duration-300 ${filter === type
                    ? "bg-white text-[#0784C9] border-white scale-105"
                    : "bg-white/70 text-slate-700 border-slate-300 hover:bg-white hover:scale-105"
                    }`}
                >
                  <Text
                    className={`${filter === type ? "text-[#0784C9]" : "text-slate-700"
                      } font-semibold`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>

          <View className="flex-col items-center flex justify-center gap-6  ">
            {plans.length > 0 ? (
              plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  freeUsed={freeUsed}
                  handleSelect={handleSelect}
                  icons={icons}
                />
              ))
            ) : (
              <View className="text-center mt-16">
                <Text className="text-5xl mb-5 opacity-70">📋</Text>
                <Text className="text-2xl font-semibold mb-2">
                  No plans available
                </Text>
                <Text className="text-base opacity-80">
                  Please try selecting a different plan type.
                </Text>
              </View>
            )}
          </View>

        </View>

      </ScrollView>


      {/* Bill modal start */}
      <Modal
        visible={!!openBillModal}
        onDismiss={() => setOpenBillModal(false)}
        contentContainerStyle={{ justifyContent: "center", alignItems: "center" }}
      >
        <View className="bg-[#DEF3F9] w-[90vw] h-[70vh] flex justify-center flex-col gap-6 p-4 rounded-lg z-10  ">



          <View className="bg-white m-4 rounded-xl shadow-md border border-[#0784C9]/20">
            <Text className="text-center font-bold text-lg text-[#003B70] py-4">
              📄 Invoice / Bill
            </Text>

          </View>

          <View className="bg-white rounded-xl border-2 border-[#0784C9] p-5 mt-2 shadow-lg">

            <View className="text-center mb-5">
              <Text className="text-lg font-bold text-[#003B70] mb-2">
                Thank you for your purchase!
              </Text>
              <Text className="text-xs text-[#0784C9] font-medium">
                Here is the breakdown of your bill:
              </Text>
            </View>

            <View className="bg-[#DEF3F9] rounded-xl p-4 border border-[#0784C9]/20">
              <View className="flex-row justify-between items-center py-2">
                <Text className="font-semibold text-sm text-[#003B70]">
                  Base Amount
                </Text>
                <Text className="text-sm font-bold text-[#0784C9]">
                  ₹ {choosePlan?.plan}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text className="font-semibold text-sm text-[#003B70]">
                  CGST (9%)
                </Text>
                <Text className="text-sm font-bold text-[#0784C9]">
                  ₹ {choosePlan?.CGST}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text className="font-semibold text-sm text-[#003B70]">
                  SGST (9%)
                </Text>
                <Text className="text-sm font-bold text-[#0784C9]">
                  ₹ {choosePlan?.SGST}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-3 bg-[#0784C9]/10 rounded-lg px-2">
                <Text className="font-bold text-base text-[#003B70]">
                  Total Payable
                </Text>
                <Text className="font-bold text-base text-[#0784C9]">
                  ₹ {choosePlan?.total}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between items-center p-4 bg-white m-4 rounded-xl shadow-md border border-[#0784C9]/20">
            <TouchableOpacity
              onPress={() => setOpenBillModal(false)}
              className="py-2.5 px-5 rounded-lg border-2 border-[#0784C9]"
            >
              <Text className="text-[#0784C9] font-bold text-xs">← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setOpenBillModal(false);
                router.push("/employer/Screens/checkOut");
              }}
              className="py-2.5 px-5 rounded-lg bg-[#0784c9] z-5"
            >
              <Text className="text-white font-bold text-xs">
                Confirm & Pay 💳
              </Text>
            </TouchableOpacity>
          </View>


        </View>
      </Modal>
      {/* bill modal end */}


    </KeyboardAvoidingView>

  );
}