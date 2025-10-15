// components/ProfileModal.js
import { useEffect, useState } from "react";
import { View, Text, Modal, Pressable, ScrollView, Linking, Alert, Touchable } from "react-native";
import { useDispatch } from "react-redux";
import {
  X,
  Phone,
  MessageCircle,
  FileText,
  Eye,
  MapPin,
  Briefcase,
  GraduationCap,
  Check,
} from "lucide-react-native";
import { Ionicons } from '@expo/vector-icons';
// import { tw } from 'nativewind';
import { fetchJobsById } from "../../Redux/getData";
import { apiFunction } from "../../api/apiFunction";
// import { showErrorToast, showSuccessToast } from "../../ui/toast"; // Assuming these are implemented for Native
import  handlestring  from "../../utilsFunctions/functions"
import { applyJobApi } from "@/app/api/api";
import Toast from "react-native-toast-message";
// import { applyJobApi } from "@/app/api/api";

const ProfileModal = ({
  open,
  onClose,
  jobId,
  candidate,
  phone,
  isDatabase,
  id,
  status,
}) => {

  const [age, setAge] = useState(0);
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);

  const handleReject = async (applicationId) => {
    const response = await apiFunction(applyJobApi, [applicationId], { status: "Rejected" }, "patch", true);
    if (response) {
      Toast.show({
        type: "success",
        text1: "Reject",
        text2: "succesfully Rejected"
      })

      dispatch(fetchJobsById(jobId));
    } else {
      Toast.show({
        type: "error",
        text1: "Reject",
        text2: "could not rejceted! Try again"
      })
    }
  };

  const handleShortList = async (applicationId) => {
    const response = await apiFunction(applyJobApi, [applicationId], { status: "Selected" }, "patch", true);
    if (response) {
      Toast.show({
        type: "success",
        text1: "Shortlist",
        text2: "Succesfully Shortlisted"
      })

      dispatch(fetchJobsById(jobId));
    } else {
      Toast.show({
        type: "error",
        text1: "Shortlist",
        text2: "Could not shortlisted! Try again"
      })
    }
  };

  const whatsApp = (name, number) => {
    const message = `Hey ${name}, I got your number through Unigrow Talent.`;
    const url = `whatsapp://send?phone=${number}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Toast.show({
        type: "error",
        text1: "whatsapp",
        text2: "whatsapp not installed, please try again after installing whatsapp"
      })
    });
  };

  const call = (number) => {
    const url = `tel:${number}`;
    Linking.openURL(url).catch(() => {
     Toast.show({
        type: "error",
        text1: "Device",
        text2: "Your Device is not supporting Calling"
      })
    });
  };

  const openResume = (url) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Toast.show({
        type: "error",
        text1: "Resume",
        text2: "Could not open the resume link"
      })
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Resume",
        text2: "Resume not uploaded"
      })
    }
  };

  useEffect(() => {
    if (candidate?.dob) {
      const dob = candidate.dob;
      const years = dob.split("-")[0];
      const currentYear = new Date().getFullYear();
      setAge(currentYear - years);
    }


  }, [candidate]);

  if (!open) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={open}
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-center items-center bg-black/50 p-4 mb-10 mt-20"
      // onPress={onClose}
      >
        <View className="relative bg-white rounded-xl w-full max-w-4xl max-h-[100vh] overflow-hidden flex flex-col">
          {/* Header */}
          <View
            className="p-5"
            style={{
              backgroundColor: "#0784C9",
              background: "linear-gradient(to right, #003B70, #0784C9)",
            }}
          >
            <View className="flex-row items-center">
              {/* Candidate Info */}
              <View className="flex-1 flex-row items-center gap-4">
                <View className="w-14 h-14 bg-white/20 rounded-lg flex justify-center items-center text-xl font-bold">
                  <Text className="text-white text-xl font-bold">
                    {candidate?.fullName?.split("")[0]?.toUpperCase() || "N/A"}
                  </Text>
                </View>

                <View className="flex-1">
                  {/* Full Name with click-to-view */}
                  <Pressable
                    onPress={() =>
                      Alert.alert("Full Name", candidate?.fullName || "N/A")
                    }
                  >
                    <Text
                      className="text-xl font-bold mb-1 text-white"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {candidate?.fullName || "N/A"}
                    </Text>
                  </Pressable>

                  {/* Other details with truncate */}
                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        "Details",
                        `${candidate?.gender || "N/A"} ${age ? `, ${age} years` : ""
                        } ${candidate?.salary ? `• ₹ ${candidate.salary}/mo.` : ""} ${candidate?.currentLocation || ""
                        }`
                      )
                    }
                  >
                    <Text
                      className="text-white/90 text-sm"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {candidate?.gender || "N/A"}
                      {age ? `, ${age} years` : ""}
                      {candidate?.salary && ` • ₹ ${candidate.salary}/mo.`}{" "}
                      {candidate?.currentLocation || ""}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Close Button */}
              <Pressable
                onPress={onClose}
                className="p-2 rounded-lg ml-2"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              >
                <X size={20} color="white" />
              </Pressable>
            </View>
          </View>


          {/* Main Content */}
          <ScrollView className="p-5 flex h-[70vh] ">
            <View className="lg:grid lg:grid-cols-3 gap-5 mb-10 ">
              {/* Left Column */}
              <View className="lg:col-span-2 gap-3 space-y-4">
                {/* Work Experience */}
                <View className="rounded-lg p-4 border" style={{ backgroundColor: "#dff3f9", borderColor: "rgba(7, 132, 201, 0.2)" }}>
                  <View className="flex-row items-center gap-2 mb-3">
                    <Briefcase size={16} color="#003B70" />
                    <Text className="text-base font-semibold text-[#003B70]">
                      Work Experience
                    </Text>
                  </View>
                  <View className="space-y-3 gap-2">

                    {candidate?.EmployeeExperiences?.length > 0 ? (
                      candidate.EmployeeExperiences.map((experience, index) => (
                        <View key={index} className="bg-white rounded-lg p-3">
                          <Text className="font-medium text-[#003B70] text-sm">
                            {experience.jobTitle}
                          </Text>
                          <Text className="text-[#0784C9] text-sm">
                            {experience.companyName}
                          </Text>
                          <Text className="text-[#6A6A6A] text-xs">
                            {experience.startDate} - {experience.endDate}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text className="text-gray-500">No Experience provided</Text>
                    )}
                  </View>
                </View>

                {/* Education */}
                <View className="rounded-lg p-4 border" style={{ backgroundColor: "#dff3f9", borderColor: "rgba(7, 132, 201, 0.2)" }}>
                  <View className="flex-row items-center gap-2 mb-3">
                    <GraduationCap size={16} color="#003B70" />
                    <Text className="text-base font-semibold text-[#003B70]">
                      Education
                    </Text>
                  </View>
                  <View className="space-y-3 gap-2">
                    {candidate?.EmployeeEducations?.length > 0 ? (
                      candidate.EmployeeEducations.map((edu, index) => (
                        <View key={index} className="bg-white rounded-lg p-3">
                          <Text className="font-medium text-[#003B70] text-sm">
                            {edu?.degree && `${edu.degree}, `}
                            {edu.specialization}
                          </Text>
                          <Text className="text-[#0784C9] text-sm">
                            {edu.instituteName}
                          </Text>
                          <Text className="text-[#6A6A6A] text-xs">
                            {edu.startDate?.split("-")[0]} - {edu.endDate?.split("-")[0]}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text className="text-gray-500">No Education provided</Text>
                    )}
                  </View>
                </View>


                {/* Skills & Languages */}
                <View className="flex-row flex-wrap justify-between gap-3">
                  <View className="flex-1 rounded-lg p-4 border" style={{ backgroundColor: "#dff3f9", borderColor: "rgba(7, 132, 201, 0.2)" }}>
                    <Text className="text-sm font-semibold text-[#003B70] mb-3">
                      Skills
                    </Text>
                    <View className="flex-row flex-wrap gap-1">
                      {(Array.isArray(candidate?.skills)
                        ? candidate.skills
                        : JSON.parse(candidate?.skills || "[]")
                      )?.map((skill, idx) => (
                        <Text
                          key={idx}
                          className="px-2 py-1 bg-[#003B70] text-white rounded text-xs"
                        >
                          {skill}
                        </Text>
                      ))}
                    </View>
                  </View>

                  <View className="flex-1 rounded-lg p-4 border" style={{ backgroundColor: "#dff3f9", borderColor: "rgba(7, 132, 201, 0.2)" }}>
                    <Text className="text-sm font-semibold text-[#003B70] mb-3">
                      Languages
                    </Text>
                    <View className="flex-row flex-wrap gap-1">
                      <Text className="px-2 py-1 bg-[#0784C9] text-white rounded text-xs">
                        English ({candidate?.englishProficiency})
                      </Text>
                      {(Array.isArray(candidate?.otherLanguages)
                        ? candidate.otherLanguages
                        : JSON.parse(candidate?.otherLanguages || "[]")
                      )?.map((lang, idx) => (
                        <Text
                          key={idx}
                          className="px-2 py-1 text-[#003B70] border rounded text-xs"
                          style={{ backgroundColor: "#dff3f9", borderColor: "rgba(7, 132, 201, 0.3)" }}
                        >
                          {lang}
                        </Text>
                      ))}
                    </View>
                  </View>

                </View>


              </View>

              {/* Right Column */}
              <View className="space-y-6 gap-3 lg:mt-0">
                {/* Contact & Resume */}
                <View className="rounded-2xl p-6 text-white shadow-lg"
                  style={{
                    backgroundColor: "#0784C9",
                    background: "linear-gradient(to bottom right, #003B70, #0784C9)",
                  }}
                >
                  <Text className="text-lg font-bold mb-4 text-white">Contact & Resume</Text>
                  <View className="space-y-4 gap-2">
                    <View className="rounded-xl p-4 w-full" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
                      <Text className="text-white/80 text-sm mb-1">Email</Text>
                      <Text className="font-small text-white">
                        {handlestring(candidate?.email, 20) || 'N/A'}
                      </Text>
                    </View>

                    <View className="rounded-xl p-4" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}>
                      <View className="flex-row justify-between items-center">
                        <View>
                          <Text className="text-white/80 text-sm mb-1">Resume</Text>
                          <Text className="font-medium text-sm text-white">
                            {candidate?.resumeURL?.split("/").pop() || "No resume"}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => openResume(candidate?.resumeURL)}
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                        >
                          <Eye size={20} color="white" />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Preferences */}
                <View className="rounded-2xl p-6 border shadow-lg"
                  style={{
                    backgroundColor: "#dff3f9",
                    background: "linear-gradient(to bottom right, #dff3f9, #ffffff)",
                    borderColor: "rgba(7, 132, 201, 0.2)",
                  }}
                >
                  <Text className="text-lg font-bold text-[#003B70] mb-4">
                    Preferences
                  </Text>
                  <View className="space-y-4">
                    <View>
                      <Text className="text-[#6A6A6A] text-sm font-medium mb-2">
                        Shifts
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {(Array.isArray(candidate?.preferredShifts)
                          ? candidate.preferredShifts
                          : JSON.parse(candidate?.preferredShifts || "[]")
                        )?.map((shift, idx) => (
                          <Text
                            key={idx}
                            className="px-2 py-1 text-[#003B70] rounded-lg text-xs border"
                            style={{ backgroundColor: "#dff3f9", borderColor: "rgba(7, 132, 201, 0.2)" }}
                          >
                            {shift}
                          </Text>
                        ))}
                      </View>
                    </View>

                    <View>
                      <Text className="text-[#6A6A6A] text-sm font-medium mb-2">
                        Job Types
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {(Array.isArray(candidate?.prefferedEmploymentTypes)
                          ? candidate.prefferedEmploymentTypes
                          : JSON.parse(candidate?.prefferedEmploymentTypes || "[]")
                        )?.map((type, idx) => (
                          <Text
                            key={idx}
                            className="px-2 py-1 text-[#003B70] rounded-lg text-xs border"
                            style={{ backgroundColor: "#dff3f9", borderColor: "rgba(7, 132, 201, 0.2)" }}
                          >
                            {type}
                          </Text>
                        ))}
                      </View>
                    </View>

                    <View>
                      <Text className="text-[#6A6A6A] text-sm font-medium mb-2">
                        Cities
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {(Array.isArray(candidate?.preferredJobCity)
                          ? candidate.preferredJobCity
                          : JSON.parse(candidate?.preferredJobCity || "[]")
                        )?.map((city, idx) => (
                          <Text
                            key={idx}
                            className="px-2 py-1 text-[#003B70] rounded-lg text-xs border"
                            style={{ backgroundColor: "#dff3f9", borderColor: "rgba(7, 132, 201, 0.2)" }}
                          >
                            {city}
                          </Text>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>

                {/* Application Status */}
                <View className="rounded-2xl p-6 border shadow-lg"
                  style={{
                    backgroundColor: "#dff3f9",
                    background: "linear-gradient(to bottom right, #ffffff, #dff3f9)",
                    borderColor: "rgba(7, 132, 201, 0.2)",
                  }}
                >
                  <Text className="text-lg font-bold text-[#003B70] mb-4">
                    Application
                  </Text>
                  <View className="space-y-3">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-[#6A6A6A] text-sm">Applied</Text>
                      <Text className="text-[#003B70] font-medium">
                        {candidate?.appliedAgo || "N/A"}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-[#6A6A6A] text-sm">Status</Text>
                      <Text
                        className={`px-3 py-1 rounded-full text-sm font-medium ${status === "Selected"
                            ? "bg-green-100 text-green-800"
                            : status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {status || "Pending"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View
            className="border-t p-3"
            style={{
              borderColor: "#dff3f9",
              background: "linear-gradient(to right, #951919ff, rgba(223, 243, 249, 0.3))",
            }}
          >
            <View className="flex-row flex gap-2 justify-center">
              <Pressable
                onPress={() => call(phone)}
                className="flex-row items-center gap-2 px-6 py-3 rounded-xl bg-[#0784c9] hover:bg-primary font-medium shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Phone size={20} color="white" />
                {/* <Text className="text-white font-medium">Call {phone}</Text> */}
              </Pressable>

              <Pressable
                onPress={() => whatsApp(candidate?.fullName, phone)}
                className="flex-row items-center gap-2 px-6 py-3 rounded-xl bg-[#0784c9] hover:bg-primary font-medium shadow-lg hover:shadow-xl hover:scale-105"
              >
                <MessageCircle size={20} color="white" />
                {/* <Text className="text-white font-medium">WhatsApp</Text> */}
              </Pressable>

              {!isDatabase && (
                <>
                  <Pressable
                    onPress={() => handleShortList(id)}
                    disabled={status === "Selected"}
                    className={`flex-row items-center gap-2 px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl ${status === "Selected"
                        ? "bg-green-100 text-green-800 opacity-50"
                        : "bg-[#0784C9] text-white"
                      }`}
                  >
                    <Check size={20} color={status === "Selected" ? "green" : "white"} />
                    {/* <Text className={status === "Selected" ? "text-green-800" : "text-white"}>
                      Shortlist
                    </Text> */}
                  </Pressable>

                  <Pressable
                    onPress={() => handleReject(id)}
                    disabled={status === "Rejected"}
                    className={`flex-row items-center gap-2 px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl ${status === "Rejected"
                        ? "bg-red-100 text-red-800 opacity-50"
                        : "bg-red-600 text-white"
                      }`}
                  >
                    <X size={20} color={status === "Rejected" ? "red" : "white"} />
                    {/* <Text className={status === "Rejected" ? "text-red-800" : "text-white"}>
                      Reject
                    </Text> */}
                  </Pressable>
                </>
              )}
            </View>
          </View>

        </View>

      </View>
    </Modal>
  );
};

export default ProfileModal;