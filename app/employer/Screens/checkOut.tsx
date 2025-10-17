// Checkout.js (Expo + NativeWind)
import React, { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchCredits, fetchEmployerProfile, fetchJobs, setJobData } from "../../Redux/getData";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking"


// ⚡ AsyncStorage instead of localStorage
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFunction } from "@/app/api/apiFunction";
import { getFreeCreditsApi, giveRazorpayApi, jobPostApi, verifyPaymentApi } from "@/app/api/api";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";


const Checkout = () => {
  const [plan, setPlan] = useState(null);
  const checkRef = useRef(false);
  const dispatch = useDispatch();



  const jobData = useSelector((state) => state.getDataReducer.jobData);
  const { employer } = useSelector((state) => state.getDataReducer);

  const router = useRouter()
  useEffect(() => {
    dispatch(fetchEmployerProfile())
  }, [dispatch])

  useEffect(() => {
    const fetchPlan = async () => {
      const storedPlan = await AsyncStorage.getItem("selectedPlan");

      if (storedPlan) {
        console.log("store", storedPlan)
        setPlan(JSON.parse(storedPlan));
      }
    };
    fetchPlan();
  }, []);

    

  useEffect(() => {

    const handleDeepLink = async ({ url }) => {
      const data = Linking.parse(url);

    
      if (plan) {

        const res = await apiFunction(verifyPaymentApi, null, {
          razorpay_order_id: data.queryParams.order_id,
          razorpay_payment_id: data.queryParams.payment_id,
          razorpay_signature: data.queryParams.signature,
          employerId: employer?.user_id,
          planId: plan.id,
        }, "post", true);




        if (res) {
          if (jobData) {
            await apiFunction(jobPostApi, null, jobData, "post", true)
            dispatch(setJobData(null))
          }

          dispatch(fetchJobs())
          dispatch(fetchCredits())
          router.push("/employer/tab/(tabs)/Jobs")
        }
      }


    };

 

      const subscription = Linking.addEventListener('url', handleDeepLink);
      return () => subscription.remove();
    
  }, [plan]);





  const loadRazorpay = async (plan, orderId, jobData) => {

   

    const token = await AsyncStorage.getItem("Token")


    if (token) {
      const paymentUrl = `https://backend.unigrowtalent.com/api/v1/paymentExpo?orderId=${orderId}&planName=${plan?.name}&email=recruiter@example.com&name=recruiter&employerId=100010&planId=${plan.id}&token=${token} `;

      await WebBrowser.openBrowserAsync(paymentUrl);
    }



  };

  useEffect(() => {
    if (plan && !checkRef.current) {
      checkRef.current = true;

      if (plan?.name !== "Basic") {
        
        const giveData = async () => {
          const response = await apiFunction(giveRazorpayApi, null, { id: plan?.id, price: plan?.price }, "post", true);
          if (response) {
            if(response?.orderId){
              await loadRazorpay(plan, response?.orderId, jobData);
            }

          }
        };
        giveData();
      } else if (plan?.name === "Basic") {
        const giveFreeCredit = async () => {
          const response = await apiFunction(getFreeCreditsApi, null, { planId: plan?.id }, "post", true);
          if (response) {
            Toast.show({
              type: "success",
              text1: "Plan",
              text2: "Succesfully added"
            })

            if (jobData) {
              const res = await apiFunction(jobPostApi, null, jobData, "post", true);
              if (res) {
                Toast.show({
                  type: "success",
                  text1: "Plan",
                  text2: "Succesfully Posted"
                })

              } else {
                Toast.show({
                  type: "error",
                  text1: "Plan",
                  text2: "Could not Post"
                })
              }
              dispatch(setJobData(null));
            }
            router.push("/employer/tab/(tabs)/Jobs");
          } else {
            Toast.show({
              type: "error",
              text1: "Plan",
              text2: "Could not post"
            })
          }
        };
        giveFreeCredit();
      }
    }
  }, [plan]);

  if (!plan) {
    return (
      <View className="flex-1 justify-center items-center bg-[#DEF3F9]">
        <ActivityIndicator size="large" color="#0784C9" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#DEF3F9] justify-center items-center p-5">
      <View className="bg-white p-8 rounded-2xl shadow-xl w-11/12 max-w-md items-center">
        {/* Loader Circle */}
        <View className="w-16 h-16 bg-[#0784C9] rounded-full justify-center items-center mb-5">
          <ActivityIndicator size="large" color="#fff" />
        </View>

        {/* Title */}
        <Text className="text-2xl font-semibold text-[#003B70] mb-3">
          Processing Payment
        </Text>

        {/* Subtitle */}
        <Text className="text-base text-[#0784C9] mb-5">
          Redirecting to payment...
        </Text>

        {/* Plan Info */}
        <View className="bg-[#DEF3F9] p-3 rounded-lg border border-[#0784C9]">
          <Text className="text-sm font-medium text-[#003B70]">
            Plan ID: {plan?.id}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Checkout;
