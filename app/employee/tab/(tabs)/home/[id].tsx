import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions, Share } from "react-native";
import { MapPin, Briefcase, Clock, Building2, Users, DollarSign, Calendar, LocationEdit, AlertTriangle, IndianRupee, Timer, BookUser, MapPinCheck, SunMoon, CalendarArrowUp, Phone, Mail, GraduationCap, Building, Share2 } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobs, fetchUserProfile } from "@/app/Redux/getData";
import RenderHTML from "react-native-render-html";
import { apiFunction } from "@/app/api/apiFunction";
import { applyJobApi } from "@/app/api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const DetailRow = ({ icon, label, value }) => {
  return (
    <View className="flex-row items-center justify-between py-3 px-4 border-b border-gray-200">

      <View className="flex-row items-center gap-3">
        <View className="p-2 rounded-lg bg-[#dff3f9]">
          {icon}
        </View>
        <Text className="text-gray-700 font-medium text-sm">{label}</Text>
      </View>


      <Text
        className="font-semibold text-sm max-w-[200px] text-right text-[#003B70]"
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
};

export default function JobDetails() {
  const [data, setData] = useState(null);
  const [postedAt, setPostedAt] = useState(null)
  const dispatch = useDispatch();
  const { id } = useLocalSearchParams();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [applied, setApplied] = useState(false);
  const [appliedData, setAppliedData] = useState(null);
  const [user, setUser] = useState(null)

  const { width } = useWindowDimensions();
  
  const { jobs, employee } = useSelector((state) => state.getDataReducer);

  const getUser = async()=>{
    const user = await AsyncStorage.getItem("User");
    if(user){
      setUser(JSON.parse(user))
    }
  }

  useEffect(() => {
    dispatch(fetchJobs())
    dispatch(fetchUserProfile())
    getUser()
  }, [dispatch])

  useEffect(() => {
    const newjobs = jobs?.filter((job) => job.id == id);
    setData(newjobs?.[0]);

    const today = Date.now();
    const createdAt = new Date(newjobs[0]?.createdAt).getTime();
    const posted = today - createdAt;
    const diffInDays = Math.floor(posted / (1000 * 60 * 60 * 24));
    setPostedAt(diffInDays)
  }, [jobs]);

  useEffect(() => {
    const alreadyApplied = data?.JobApplications.filter(
      (ids) => ids.employeeId == user?.id
    );

    if (alreadyApplied?.length > 0) {
      setApplied(true);
      setAppliedData(alreadyApplied[0]);
    } else {
      setApplied(false);
    }
  }, [data]);

   const handleApplyClick = async () => {
    setApplied(true)
   
    const dataa={number: user?.phone, jobRole: employee?.EmployeeExperiences[0]? employee?.EmployeeExperiences[0]?.jobTitle : "Fresher", jobApplied: data?.jobRoles, totalExperience: employee?.TotalExperience?.years, company: employee?.EmployeeExperiences[0]?.companyName}
    const response = await apiFunction(applyJobApi,[id,data?.employerId], dataa, "post", true);
    if (response) {
     
      dispatch(fetchJobs());
      setAppliedData(response.application);
      Toast.show({
        type: "success",
        text1: "Apply",
        text2: "Applied Successfully"
      })

    } else {
      Toast.show({
        type: "error",
        text1: "Apply",
        text2: "Could not apply"
      })
      setApplied(false)
    }
  };

const handleShare = async () => {
  try {
    const result = await Share.share({
      message: "Check this out! Here is something interesting I found.",
      url: "https://app.unigrowTalent.com/Jobs", // optional
      title: "Check this out!",
    });

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        Toast.show({
          type: "success",
          text1: "Share",
          text2: result.activityType
        })
       
      } else {
        Toast.show({
          type: "success",
          text1: "Share",
          text2: "Share Successfully"
        })
      }
    } else if (result.action === Share.dismissedAction) {
     Toast.show({
      type: "error",
      text1: "Share",
      text2: "Sharing is Dismissed",
    });
    }
  } catch (error: any) {
   
    Toast.show({
      type: "error",
      text1: "Share",
      text2: "Sharing is not supported on this device",
    });
  }
};

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      {/* <View className="bg-white shadow-sm">
        <View className="px-4 py-3 flex-row items-center">
          <TouchableOpacity className="p-2 -ml-2" onPress={()=> router.back()}>
            <Text>{"<"}</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-center text-lg font-semibold text-gray-900">
            Job Details
          </Text>
          <TouchableOpacity className="p-2 -mr-2">
            <Text>♥</Text>
          </TouchableOpacity>
        </View>
      </View> */}

      <ScrollView className="px-4 py-6 pb-28">
        {/* Company Logo & Basic Info */}
        <View className="flex-row items-start gap-4 mb-6">
          <View className="w-16 h-16 bg-primary-100 rounded-xl items-center justify-center">
            <Building2 size={32} color="#2563eb" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 mb-1">
              {data?.jobTitle}
            </Text>
            <Text className="text-lg text-gray-700 font-medium mb-2">
              {data?.Employer?.company?.companyName}
            </Text>
            <View className="flex-row items-center text-gray-600 mb-3">
              <MapPin size={16} color="#4b5563" />
              <Text className="text-sm ml-1">{data?.location}, {data?.city}</Text>
            </View>
          </View>
        </View>

        {/* Tags */}
        <View className="flex-row flex-wrap gap-2 mb-6">
          <View className="flex-row items-center px-3 py-1 rounded-full bg-blue-100">
            <Briefcase size={14} color="#0784c9" />
            <Text className="text-sm ml-1 text-[#0784c9]">{data?.jobType}</Text>
          </View>
          <View className="flex-row items-center px-3 py-1 rounded-full bg-blue-100">
            <Users size={14} color="#0784c9" />
            <Text className="text-sm ml-1 text-[#0784c9]">{data?.workLocationType}</Text>
          </View>
          <View className="flex-row items-center px-3 py-1 rounded-full bg-blue-100">
            <Clock size={14} color="#0784c9" />
            <Text className="text-sm ml-1 text-[#0784c9]">{data?.payType}</Text>
          </View>
          <View className="flex-row items-center px-3 py-1 rounded-full bg-blue-100">
            <Clock size={14} color="#0784c9" />
            <Text className="text-sm ml-1 text-[##0784c9]">{data?.experience}</Text>
          </View>
          <View className="flex-row items-center px-3 py-1 rounded-full bg-blue-100">
            <Clock size={14} color="#0784c9" />
            <Text className="text-sm ml-1 text-[#0784c9]">{data?.english}</Text>
          </View>
        </View>

        {/* Salary & Posted Date */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-white rounded-lg p-4 border border-[#0784c9]">
            <View className="flex-row items-center mb-1">
              <DollarSign size={16} color="#4b5563" />
              <Text className="text-sm font-medium text-gray-600 ml-1">
                Salary
              </Text>
            </View>
            <Text className="text-sm font-bold" style={{ color: "#0784c9" }}>
              {data?.minimumSalary
                ? `₹${data.minimumSalary} - ₹${data.maximumSalary}`
                : "N/A"}
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-lg p-4 border border-[#0784c9]">
            <View className="flex-row items-center mb-1">
              <Calendar size={16} color="#4b5563" />
              <Text className="text-sm font-medium text-gray-600 ml-1">
                Posted at
              </Text>
            </View>
            <Text className="text-sm font-bold text-[#0784c9]">{postedAt} Days Ago</Text>
          </View>
        </View>

        <View className="flex flex-row gap-3 items-center w-full mb-3">
          <TouchableOpacity onPress={handleShare} className="flex w-1/5 justify-center items-center p-4 rounded-lg shadow-lg bg-[#DEF3F9]">
            <Share2 size={20} color={"#0784c9"}/>
          </TouchableOpacity>

    
        <TouchableOpacity onPress={handleApplyClick} disabled={applied || data?.status == "E"} style={{
                  backgroundColor: applied ? "#22c55e" : data?.status == "E" ?"rgba(240, 16, 16, 0.5)":"#0784C9",
                }} className=" bg-[#0784c9] py-4 rounded-xl w-3/4">
          
            {applied ? <Text className="text-white font-semibold text-lg text-center">{appliedData?.status ? appliedData.status : "Applied"}</Text>:
            <Text className="text-white font-semibold text-lg text-center">{data?.status == "E"? "Expired" : "Apply Now"}</Text>
            }
        
        </TouchableOpacity>
    
        </View>

        {data && (
          <View className="border rounded-lg p-4" style={{ backgroundColor: "#dff3f9", borderColor: "#0784C9" }}>
            <View className="flex-row items-start gap-3">
              <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: "white" }}>
                <AlertTriangle size={16} color="#0784C9" />
              </View>
              <View className="flex-1">
                <Text className="font-bold mb-2 text-base" style={{ color: "#003B70" }}>Urgently hiring</Text>
                <View className="flex-col gap-3">
                  {data?.walkIn && (
                    <View className="flex-row items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "white" }}>
                      <View className="w-2 h-2 rounded-full" style={{ backgroundColor: "#0784C9" }} />
                      <Text className="font-medium text-[#003B70]">Walk In Available</Text>
                    </View>
                  )}
                  <View className="flex-row items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "white" }}>
                    <Users size={16} color="#0784C9" />
                    <Text className="text-[#003B70]">{data?.JobApplications.length} applicants so far</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Joining Fee Section */}
        {data?.joiningFee && (
          <View className="border border-yellow-300 mt-4 rounded-lg overflow-hidden bg-yellow-50">
            <View className="px-4 py-3 border-b border-yellow-200" style={{ backgroundColor: "#fff3cd" }}>
              <View className="flex-row items-center gap-3">
                <View className="w-6 h-6 bg-yellow-200 rounded-full items-center justify-center">
                  <AlertTriangle size={16} color="#92400e" />
                </View>
                <Text className="text-lg font-bold text-yellow-800">Pay For Job</Text>
              </View>
            </View>
            <View className="bg-white">
              <DetailRow icon={<IndianRupee size={16} color="#0784C9" />} label="Joining Fee Amount:" value={`₹${data?.joiningFeeAmount}`} />
              <DetailRow icon={<Timer size={16} color="#0784C9" />} label="Payment Time:" value={data?.joiningFeeAmountTime} />
              <DetailRow icon={<BookUser size={16} color="#0784C9" />} label="Reason:" value={data?.joiningFeeReason} />
              <DetailRow icon={<BookUser size={16} color="#0784C9" />} label="Details:" value={data?.joiningFeeReasonDetail} />
            </View>
          </View>
        )}

        {/* Job Role */}
        <View className="bg-white rounded-lg mt-4 border border-gray-200 overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-200" style={{ backgroundColor: "#dff3f9" }}>
            <View className="flex-row items-center gap-3">
              <Briefcase size={20} color="#0784C9" />
              <Text className="text-lg font-bold" style={{ color: "#003B70" }}>Job Role</Text>
            </View>
          </View>
          <DetailRow icon={<MapPin size={16} color="#0784C9" />} label="Work location:" value={data?.location} />
          <DetailRow icon={<Briefcase size={16} color="#0784C9" />} label="Department:" value={data?.jobTitle} />
          <DetailRow icon={<BookUser size={16} color="#0784C9" />} label="Role:" value={data?.jobRoles} />
          <DetailRow icon={<Timer size={16} color="#0784C9" />} label="Employment type:" value={data?.jobType} />
          <DetailRow icon={<SunMoon size={16} color="#0784C9" />} label="Shift:" value={data?.nightShift} />
        </View>

        {/* WalkIn Details */}
        {data?.walkIn && (
          <View className="bg-white rounded-lg mt-4 border border-gray-200 overflow-hidden">
            <View className="px-4 py-3 border-b border-gray-200" style={{ backgroundColor: "#dff3f9" }}>
              <View className="flex-row items-center gap-3">
                <MapPin size={20} color="#0784C9" />
                <Text className="text-lg font-bold" style={{ color: "#003B70" }}>WalkIn Details</Text>
              </View>
            </View>
            <DetailRow icon={<MapPin size={16} color="#0784C9" />} label="WalkIn Address:" value={data.walkInAddress} />
            <DetailRow icon={<CalendarArrowUp size={16} color="#0784C9" />} label="End Date:" value={data.WalkInEndDate} />
            <DetailRow icon={<Timer size={16} color="#0784C9" />} label="Start Time:" value={data.walkInStartTime} />
            <DetailRow icon={<BookUser size={16} color="#0784C9" />} label="Instructions:" value={data.walkInInstruction} />
          </View>
        )}

        {/* Contact */}
        {data?.otherRecruiterName && (
          <View className="bg-white rounded-lg mt-4 border border-gray-200 overflow-hidden">
            <View className="px-4 py-3 border-b border-gray-200" style={{ backgroundColor: "#dff3f9" }}>
              <View className="flex-row items-center gap-3">
                <Phone size={20} color="#0784C9" />
                <Text className="text-lg font-bold" style={{ color: "#003B70" }}>Contact</Text>
              </View>
            </View>
            <DetailRow icon={<Users size={16} color="#0784C9" />} label="Recruiter Name:" value={data.otherRecruiterName} />
            <DetailRow icon={<Phone size={16} color="#0784C9" />} label="Phone Number:" value={data.otherRecruiterNumber} />
            <DetailRow icon={<Mail size={16} color="#0784C9" />} label="Email:" value={data.otherRecruiterEmail} />
            <DetailRow icon={<Users size={16} color="#0784C9" />} label="Candidate Type:" value={data.candidateType} />
          </View>
        )}

        {/* Job Description */}
        <View className="bg-white rounded-lg mt-4 border border-gray-200 overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-200" style={{ backgroundColor: "#dff3f9" }}>
            <View className="flex-row items-center gap-3">
              <BookUser size={20} color="#0784C9" />
              <Text className="text-lg font-bold" style={{ color: "#003B70" }}>Job Description</Text>
            </View>
          </View>
          {data ? (
            <View className="p-4 bg-white border border-gray-200">
              <Text className="text-lg font-bold text-[#003B70] mb-2">
                Job Description
              </Text>

              {/* Render HTML */}
              <RenderHTML
                contentWidth={width}
                source={{
                  html: showFullDescription ? data?.jobDescription : data?.jobDescription?.slice(0, 200) + '...',
                }}
                baseStyle={{
                  fontSize: 14,
                  color: "#374151", // gray-700
                  lineHeight: 20,
                }}
              />

              {/* Toggle button */}
              <TouchableOpacity
                onPress={() => setShowFullDescription(!showFullDescription)}
                className="mt-2"
              >
                <Text className="text-[#0784C9] font-medium">
                  {showFullDescription ? "Show Less" : "Show More"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text className="text-center text-gray-400 py-6">Loading...</Text>
          )}
        </View>

        {/* Job Requirements */}
        <View className="bg-white rounded-lg mt-4 border border-gray-200 overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-200" style={{ backgroundColor: "#dff3f9" }}>
            <View className="flex-row items-center gap-3">
              <GraduationCap size={20} color="#0784C9" />
              <Text className="text-lg font-bold" style={{ color: "#003B70" }}>Job Requirements</Text>
            </View>
          </View>
          <DetailRow icon={<Timer size={16} color="#0784C9" />} label="Experience:" value={data?.experience} />
          <DetailRow icon={<GraduationCap size={16} color="#0784C9" />} label="Education:" value={data?.education} />
          <DetailRow icon={<Briefcase size={16} color="#0784C9" />} label="Past Role:" value={data?.jobTitle} />
          <DetailRow icon={<Users size={16} color="#0784C9" />} label="Gender:" value={data?.gender} />
          <DetailRow icon={<BookUser size={16} color="#0784C9" />} label="English Level:" value={data?.english} />
        </View>

        {/* About Company */}
        <View className="bg-white rounded-lg mt-4 mb-20  border border-gray-200 overflow-hidden">
          <View className="px-4 py-3 border-b border-gray-200" style={{ backgroundColor: "#dff3f9" }}>
            <View className="flex-row items-center gap-3">
              <Building size={20} color="#0784C9" />
              <Text className="text-lg font-bold" style={{ color: "#003B70" }}>About Company</Text>
            </View>
          </View>
          {data?.Employer?.company?.companyName ? (
            <View className="p-4 space-y-3">
              <Text className="text-lg font-bold mb-2" style={{ color: "#003B70" }}>{data?.Employer.company.companyName}</Text>
              {data?.Employer.company.location && (
                <View className="flex-row items-center gap-2 mb-3">
                  <MapPin size={16} color="#0784C9" />
                  <Text className="text-gray-600">{data?.Employer.company.location}</Text>
                </View>
              )}
              <Text className="text-gray-700 text-sm leading-relaxed">{data?.Employer.company.about}</Text>
            </View>
          ) : (
            <View className="p-4">
              <Text className="text-gray-500 italic text-center py-6 text-sm">No company information provided.</Text>
            </View>
          )}
        </View>




      </ScrollView>

      {/* Apply Button */}
      
    </View>
  );
}
