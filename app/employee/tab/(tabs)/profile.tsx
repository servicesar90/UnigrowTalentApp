import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Platform,
} from "react-native";
import {
  Calendar,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Award,
  FileText,
  Clock,
  DollarSign,
  Heart,
  Pencil,
  Building,
} from "lucide-react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "@/app/Redux/getData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UpdateResume from "../../modals/updateResume";
import {
  addExpApi,
  createEducationApi,
  createEmpProfile,
  createResumeApi,
  getCertificationSuggestionsApi,
  getCitiesApi,
  getEducationSuggestionsApi,
  getSkillsSuggestionsApi,
  JobRoleSuggestionsApi,
  uploadProfileApi,
  uploadResumeApi,
} from "@/app/api/api";
import DynamicModal from "../../modals/updateProfile";
import { apiFunction } from "@/app/api/apiFunction";
import EditExperienceModal from "../../modals/experienceModal";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import handlestring from "@/app/utilsFunctions/functions";

const graduateDegrees = [
  "B.A.",
  "B.Sc",
  "B.Com",
  "BBA",
  "BCA",
  "B.Tech",
  "B.E.",
  "B.Arch",
  "B.Pharm",
  "LLB",
  "B.Des",
  "BFA",
  "B.Ed",
  "BHM",
  "B.Voc",
  "B.Lib",
  "BMS",
  "BASLP",
  "BPT",
  "BDS",
  "B.Sc (Nursing)",
  "B.A. (Hons)",
  "B.Com (Hons)",
  "B.Sc (Hons)",
];

const postGraduateDegrees = [
  "M.A.",
  "M.Sc",
  "M.Com",
  "MBA",
  "MCA",
  "M.Tech",
  "M.E.",
  "LLM",
  "M.Arch",
  "M.Pharm",
  "M.Des",
  "MFA",
  "M.Ed",
  "MHM",
  "M.Lib",
  "M.P.Ed",
  "MSW",
  "M.Phil",
  "M.Voc",
  "MDS",
  "M.Sc (Nursing)",
  "PGDM",
  "PGDCA",
  "PG Diploma",
];

export default function EmployeeProfile() {
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();

  const [updateFileModal, setUpdateFileModal] = useState(null);
  const [updateModal, setUpdateModal] = useState(null);
  const [selectedEducation, setSelectedEducation] = useState(null);
  const [educationvalue, setEducationValue] = useState(null);
  const [experienceIndex, setExperienceIndex] = useState(null);
  const [specialisationSuggestions, setSpecializationSuggestions] = useState([]);
  const [profileComplete, setProfileComplete] = useState(0);
  const [resumeText, setResumeText] = useState("");
  const resumeRef = useRef(null);
  const [loader, setLoader] = useState(false);
  const [fullString, showFullSring] = useState(false);

  const { employee } = useSelector((state) => state.getDataReducer);

  const getUser = async () => {
    const userr = await AsyncStorage.getItem("User");
    if (userr) {
      setUser(JSON.parse(userr));
    }
  };

  useEffect(() => {
    dispatch(fetchUserProfile());
    getUser();
    handleProfileCompleted()
  }, [dispatch]);

  useEffect(() => {
    const getEducationSuggestion = async (value) => {
      const response = await apiFunction(
        getEducationSuggestionsApi,
        [value],
        null,
        "get",
        true
      );
      if (response) {

        setSpecializationSuggestions(response?.data ? response.data : response);
      }
    };

    if (educationvalue) {
      getEducationSuggestion(educationvalue);
    }
  }, [educationvalue]);

  const handleProfileCompleted = () => {
    let profileComp = 0;
    if (employee?.EmployeeExperiences?.length > 0) {
      profileComp += 10;
    }
    if (employee?.EmployeeEducations?.length > 0) {
      profileComp += 10;
    }
    if (employee?.TotalExperience) {
      profileComp += 10;
    }
    if (employee?.salary) {
      profileComp += 10;
    }
    if (employee?.skills) {
      profileComp += 10;
    }
    if (employee?.profileImage) {
      profileComp += 10;
    }
    if (employee?.otherLanguages) {
      profileComp += 10;
    }
    if (employee?.resumeURL) {
      profileComp += 10;
    }
    if (employee?.preferredJobCity) {
      profileComp += 2;
    }
    if (employee?.preferredJobRoles) {
      profileComp += 2;
    }
    if (employee?.preferredLocationTypes) {
      profileComp += 2;
    }
    if (employee?.preferredShifts) {
      profileComp += 2;
    }
    if (employee?.prefferedEmploymentTypes) {
      profileComp += 2;
    }
    if (employee?.currentLocation) {
      profileComp += 10;
    }

    setProfileComplete(profileComp);
  };

  const renderResume = (text) => {
    const lines = text.split("\n");

    return lines.map((line, idx) => {
      const match = line.match(/\*\*(.+?)\*\*/);

      if (match) {
        return (
          <Text
            key={idx}
            style={{
              fontWeight: "bold",
              textDecorationLine: "underline",
              fontSize: 18,
              marginTop: 12,
              marginBottom: 4,
            }}
          >
            {match[1]}
          </Text>
        );
      } else {
        return (
          <Text key={idx} style={{ marginBottom: 4 }}>
            {line}
          </Text>
        );
      }
    });
  };

  const createResume = async () => {
    if (profileComplete >= 50) {
      try {
        const response = await apiFunction(
          createResumeApi,
          null,
          employee,
          "post",
          true
        );

        if (response) {

          const resumeFormatted = renderResume(response.resume);
          setResumeText(resumeFormatted);
        } else {
          Toast.show({
            type: "error",
            text1: "Resume",
            text2: "Could not get resume response"
          })
        }
      } catch (err) {
        Toast.show({
          type: "error",
          text1: "Resume",
          text2: "Something went wrong while fetching resume"
        })
      } finally {
        setLoader(false);
      }
    } else {
      Toast.show({
        type: "error",
        text1: "Resume",
        text2: "Profile Should be atleast 50%"
      })
    }

  };

  const flattenText = (node) => {
    if (node == null) return "";
    if (typeof node === "string" || typeof node === "number")
      return String(node);
    if (Array.isArray(node)) return node.map(flattenText).join("");
    if (typeof node === "object" && node.props)
      return flattenText(node.props.children);
    return "";
  };

  const escapeHtml = (s: string) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");


  const exportResumePDF = async (resumeText: any, fileName: string) => {
    try {
      // Build HTML body
      let htmlBody = "";
      if (Array.isArray(resumeText)) {
        htmlBody = resumeText
          .map((item) => {
            const text = flattenText(item);
            const m = text.match(/^\*\*(.+?)\*\*$/);
            if (m) {
              return `<div style="font-weight:bold;text-decoration:underline;font-size:18px;margin:12px 0 4px;">${escapeHtml(
                m[1]
              )}</div>`;
            }
            return `<div style="font-size:14px;margin:4px 0;">${escapeHtml(
              text
            )}</div>`;
          })
          .join("");
      } else {
        htmlBody = `<div style="white-space:pre-wrap;font-size:14px;line-height:1.6;">${escapeHtml(
          flattenText(resumeText)
        )}</div>`;
      }

      const html = `
      <html>
        <head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
        <body style="font-family: Arial, sans-serif; padding:30px; color:#000;">
          ${htmlBody}
        </body>
      </html>
    `;

      // 1) Create PDF file
      const { uri } = await Print.printToFileAsync({ html });

      // 2) Platform-specific handling
      if (Platform.OS === "android") {
        if (FileSystem.StorageAccessFramework) {

          const perm =
            await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

          if (perm.granted) {
            const base64 = await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            const targetUri =
              await FileSystem.StorageAccessFramework.createFileAsync(
                perm.directoryUri,
                `${fileName}.pdf`,
                "application/pdf"
              );
            await FileSystem.writeAsStringAsync(targetUri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
            Toast.show({
              type: "success",
              text1: "Pdf",
              text2: "Pdf saved successfully",
            });
            return;
          }
        }

        // Fallback → use system share sheet
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            UTI: ".pdf",
            mimeType: "application/pdf",
          });
          return;
        }

        Toast.show({
          type: "info",
          text1: "Pdf",
          text2: uri,
        });
      } else {
        // iOS (no SAF, always share)
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            UTI: ".pdf",
            mimeType: "application/pdf",
          });
          return;
        }
        Toast.show({
          type: "info",
          text1: "Pdf",
          text2: uri,
        });
      }
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Pdf",
        text2: "Failed to generate Pdf",
      });
      console.log("PDF Export Error:", e);
    }
  };

  const exportPDF = async () => {

    await exportResumePDF(resumeText, "resume");
  };

  return (
    <ScrollView className="flex-1 bg-[#def3f9]">
      {/* Profile */}
      <View className="p-6 bg-white mt-4 mx-4 rounded-xl shadow">
        <View className="flex flex-row justify-start items-center gap-6 mb-2">
          <TouchableOpacity
            onPress={() => setUpdateFileModal("profile")}
            className="flex w-[100] h-[100] justify-center items-center gap-0"
          >
            <AnimatedCircularProgress
              size={100}
              width={6}
              fill={profileComplete}
              tintColor={profileComplete <= 50 ? "red" : (profileComplete <= 75 ? "green" : "#0784C9")}
              backgroundColor="#e0e0e0"

              rotation={0}
              childrenContainerStyle={{
                display: "flex",
                position: "absolute"

              }}
            >
              {
                (fill) => (

                  <Image
                    source={{ uri: employee?.profileImage }}
                    className="w-full h-full rounded-full border-2 border-blue-100"
                  />

                )
              }
            </AnimatedCircularProgress>
            <View>
              <Text className="font-bold">{profileComplete}%</Text>
            </View>
          </TouchableOpacity>



          <View className="flex flex-col items-start justify-center">
            <Text className="text-xl font-bold mt-3 text-gray-900">
              {employee?.fullName}
            </Text>
            <Text className="text-[#0784c9] font-semibold" numberOfLines={1} ellipsizeMode="tail">
              {employee?.EmployeeExperiences[0]?.jobTitle}
            </Text>
            <View className="mt-2 items-start flex flex-col">
              <View className="flex-row items-center">
                <Mail size={14} color="gray" />
                <TouchableOpacity onPress={() => showFullSring(!fullString)}>
                  <Text className="ml-1 text-gray-600">{handlestring(employee?.email, 10, fullString)}</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center mt-1">
                <Phone size={14} color="gray" />
                <Text className="ml-1 text-gray-600">{user?.phone}</Text>
              </View>
              <View className="flex-row items-center mt-1">
                <MapPin size={14} color="gray" />
                <Text className="ml-1 text-gray-600">
                  {employee?.currentLocation
                    ? employee?.currentLocation
                    : "Location Not Povided"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View className="mt-6 flex-row flex-wrap justify-between">
          <View className="bg-blue-50 p-4 rounded-lg w-[48%] mb-3 items-center">
            <Briefcase size={20} color="#3b82f6" />
            <Text className="font-bold text-gray-900">
              {employee?.years} years {employee?.months} months
            </Text>
            <Text className="text-gray-600 text-sm">Experience</Text>
          </View>
          <View className="bg-green-50 p-4 rounded-lg w-[48%] mb-3 items-center">
            <Clock size={20} color="green" />
            <Text className="font-bold text-gray-900">
              {employee?.EmployeeExperiences[0]?.noticePeriod
                ? employee?.EmployeeExperiences[0]?.noticePeriod
                : "No Notice Period"}
            </Text>
            <Text className="text-gray-600 text-sm">Notice Period</Text>
          </View>
          <View className="bg-purple-50 p-4 rounded-lg w-[48%] mb-3 items-center">
            <DollarSign size={20} color="purple" />
            <Text className="font-bold text-gray-900">
              {employee?.EmployeeExperiences[0]?.currentSalary}
            </Text>
            <Text className="text-gray-600 text-sm">Current Salary</Text>
          </View>
          <View className="bg-orange-50 p-4 rounded-lg w-[48%] mb-3 items-center">
            <Heart size={20} color="orange" />
            <Text className="font-bold text-gray-900">
              {(Array.isArray(employee?.prefferedEmploymentTypes)
                ? employee?.prefferedEmploymentTypes
                : JSON.parse(employee?.prefferedEmploymentTypes)
              )?.map((type) => type)}
            </Text>
            <Text className="text-gray-600 text-sm">Job Preference</Text>
          </View>
        </View>

        {/* Skills */}
        <View className="mt-6">
          <View className="flex flex-row justify-between items-center">
            <Text className="text-lg font-bold text-[#0784c9] mb-4">
              Key Skills
            </Text>
            <TouchableOpacity
              onPress={() => {
                setUpdateModal("skills");
              }}
            >
              <Text className="text-[#0784c9]"> +Add</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap">
            {employee?.skills &&
              (Array.isArray(employee?.skills)
                ? employee?.skills
                : JSON.parse(employee?.skills)
              ).map((skill) => (
                <View
                  key={skill}
                  className="bg-blue-100 px-3 py-1 rounded-full mr-2 mb-2"
                >
                  <Text className="text-blue-700">{skill}</Text>
                </View>
              ))}
          </View>
        </View>
      </View>

      {/* Resume Builder */}

      <View className="p-6 bg-white mt-4 mx-4 rounded-xl shadow flex items-center justify-center">
        <View className=" flex-row flex-wrap justify-between">
          <TouchableOpacity
            onPress={() => {
              setLoader(true);
              createResume();
            }}
            disabled={loader}
            className={`p-2 rounded-lg ${loader ? "bg-gray-200" : "bg-[#0784c9]"}`}
          >
            <Text className="text-white">Resume Builder</Text>
          </TouchableOpacity>
        </View>

        {resumeText && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginTop: 16,
              padding: 16,
              backgroundColor: "#f3f4f6",
              borderRadius: 8,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              maxWidth: 400,
              alignSelf: "center",
            }}
          >
            <MaterialIcons name="picture-as-pdf" size={24} color="red" />
            <Text style={{ flex: 1 }}>resume.pdf</Text>

            <TouchableOpacity
              onPress={exportPDF}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#2563eb",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Feather name="download" size={18} color="white" />
              <Text style={{ color: "white", marginLeft: 6 }}>Download</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Experience */}
      <View className="p-6 bg-white mt-4 mx-4 rounded-xl shadow">
        <View className="flex flex-row justify-between items-center">
          <Text className="text-lg font-bold text-[#0784c9] mb-4">
            professional Experience
          </Text>
          <TouchableOpacity
            onPress={() => {
              setExperienceIndex(null);
              setUpdateModal("addExperience");
            }}
          >
            <Text className="text-[#0784c9]"> +Add</Text>
          </TouchableOpacity>
        </View>
        {employee?.EmployeeExperiences?.map((exp, index) => (
          <View key={index} className="mb-6 shadow-sm p-2">
            <View className="flex flex-row justify-between mt-1 items-center">
              <Text className="font-semibold text-gray-900">{exp.jobRole}</Text>
              <Pencil
                size={18}
                color={"#0784c9"}
                onPress={() => {
                  setUpdateModal("editExperience");
                  setExperienceIndex(index);
                }}
              />
            </View>

            <Text className="text-blue-600">{exp.companyName}</Text>
            <View className="flex-row mt-1">
              <Calendar size={12} color="gray" />
              <Text className="text-gray-500 ml-1 text-sm">
                {exp?.startDate} - {exp.endDate}
              </Text>
            </View>
            <Text className="text-gray-600 mt-2 text-sm">
              {exp?.description}
            </Text>
            <View className="flex-row flex-wrap mt-2">
              {(Array.isArray(exp?.skillsUsed)
                ? exp?.skillsUsed
                : JSON.parse(exp?.skillsUsed)
              )?.map((skill) => (
                <View
                  key={skill}
                  className="border border-blue-200 px-2 py-1 rounded-full mr-2 mb-2"
                >
                  <Text className="text-blue-600 text-xs">{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Education */}
      <View className="p-6 bg-white mt-4 mx-4 rounded-xl shadow">
        <View className="flex flex-row justify-between items-center">
          <Text className="text-lg font-bold text-[#0784c9] mb-4">
            Education
          </Text>
          <TouchableOpacity
            onPress={() => {
              setUpdateModal("education");
              setSelectedEducation(null);
            }}
          >
            <Text className="text-[#0784c9]"> +Add</Text>
          </TouchableOpacity>
        </View>
        {employee?.EmployeeEducations?.length > 0 &&
          employee?.EmployeeEducations?.map((edu, i) => (
            <View
              key={i}
              className="bg-blue-50 rounded-xl mb-6 flex flex-row justify-between p-4"
            >
              <View className="">
                <Text className="font-semibold text-[#0784c9] flex flex-row justify-between">
                  {edu?.degree}
                  <Text className="font-semibold text-black">
                    ({edu?.specialization})
                  </Text>
                </Text>
                <View className="flex-row items-center mt-1">
                  <Building size={15} color="#0784c9" />
                  <Text className="text-gray-900">{edu?.instituteName}</Text>
                </View>
                <View className="flex-row mt-1">
                  <Calendar size={12} color="gray" />
                  <Text className="text-gray-500 ml-1 text-sm">
                    {edu?.startDate}- {edu?.endDate}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setUpdateModal("education");
                  setSelectedEducation(edu);
                }}
              >
                <Pencil color={"#0784c9"} size={18} />
              </TouchableOpacity>
            </View>
          ))}
      </View>

      {/* Certifications */}
      <View className="p-6 bg-white mt-4 mx-4 rounded-xl shadow">
        <View className="flex flex-row justify-between items-center">
          <Text className="text-lg font-bold text-[#0784c9] mb-4">
            Certifications
          </Text>
          <TouchableOpacity onPress={() => setUpdateModal("certificate")}>
            <Text className="text-[#0784c9]">
              {employee?.certification ? "Edit" : "+Add"}
            </Text>
          </TouchableOpacity>
        </View>
        {employee?.certification &&
          (Array.isArray(employee?.certification)
            ? employee?.certification
            : JSON.parse(employee?.certification)
          )?.map((cert, i) => (
            <View
              key={i}
              className="flex-row p-4 bg-purple-50 rounded-lg mb-3 items-start"
            >
              <Award size={20} color="purple" />
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-gray-900">{cert}</Text>
              </View>
            </View>
          ))}
      </View>

      {/* Other Languages */}
      <View className="p-6 bg-white mt-4 mx-4 rounded-xl shadow">
        {/* Header */}

        <View className="flex flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-[#0784c9]">
            Language Known
          </Text>
          <TouchableOpacity
            onPress={() => setUpdateModal("languageKnown")}
            className="p-1.5 rounded-md"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <Pencil size={16} color="#0784c9" />
          </TouchableOpacity>
        </View>
        <View className="py-2">
          {employee && (
            <View className="">
              {/* English Proficiency */}
              <View className="flex flex-row items-center gap-2 mb-2">
                <Text className="font-medium text-[#003b70] text-md">
                  English:
                </Text>
                <Text className="bg-[#0784C9] text-white px-2 py-0.5 rounded-full text-sm font-medium">
                  {employee.englishProficiency}
                </Text>
              </View>

              {/* Other Languages */}
              <View className="flex flex-row flex-wrap gap-1.5">
                {employee?.otherLanguages &&
                  (Array.isArray(employee.otherLanguages)
                    ? employee.otherLanguages
                    : JSON.parse(employee.otherLanguages)
                  ).map((language, idx) => (
                    <Text
                      key={idx}
                      className="bg-[#dff3f9] border border-[#0784C9] text-[#1e40af] px-2 py-0.5 rounded-full text-sm font-medium"
                    >
                      {language}
                    </Text>
                  ))}
              </View>
            </View>
          )}
        </View>

        {/* Body */}
      </View>

      {/* Resume Upload */}
      <View className="p-6 bg-white mt-4 mx-4 rounded-xl shadow">
        <Text className="text-lg font-bold text-[#0784c9] mb-4">Resume</Text>
        <View className="border-2 border-dashed border-blue-200 rounded-lg p-6 items-center">
          <FileText size={40} color="#3b82f6" />
          <Text className="text-gray-600 mt-3">
            {employee?.resumeURL &&
              employee?.resumeURL.split("/")[
              employee?.resumeURL.split("/").length - 1
              ]}
          </Text>
          <TouchableOpacity
            onPress={() => setUpdateFileModal("resume")}
            className="mt-3 border border-blue-300 px-4 py-2 rounded-lg"
          >
            <Text className="text-blue-600">Update Resume</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Job Preferences */}
      <View className="p-6 bg-white mt-4 mx-4 rounded-xl shadow">
        <Text className="text-lg font-bold text-[#0784c9] mb-4">
          Job Preferences
        </Text>
        <View className="p-6 space-y-6">
          {/* Preferred Job Roles */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-[#1e40af]">
                Preferred Job Roles
              </Text>
              <TouchableOpacity
                onPress={() => setUpdateModal("preferredJobs")}
                className="p-1.5 rounded-md"
              >
                <Pencil size={16} color="#0784C9" />
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap gap-1.5">
              {employee &&
                (Array.isArray(employee?.preferredJobRoles)
                  ? employee.preferredJobRoles
                  : JSON.parse(employee?.preferredJobRoles || "[]")
                ).map((role, index) => (
                  <Text
                    key={index}
                    className="bg-[#0784C9] flex align-center text-white px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {role}
                  </Text>
                ))}
            </View>
          </View>

          {/* Preferred Job City */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-[#1e40af]">
                Preferred Job City
              </Text>
              <TouchableOpacity
                onPress={() => setUpdateModal("preferredJobCity")}
                className="p-1.5 rounded-md"
              >
                <Pencil size={16} color="#0784C9" />
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap gap-1.5">
              {employee &&
                (Array.isArray(employee?.preferredJobCity)
                  ? employee.preferredJobCity
                  : JSON.parse(employee?.preferredJobCity || "[]")
                ).map((city, index) => (
                  <Text
                    key={index}
                    className="bg-[#dff3f9] border border-[#0784C9] text-[#1e40af] px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {city}
                  </Text>
                ))}
            </View>
          </View>

          {/* Job Preference */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-[#1e40af]">
                Job Preference
              </Text>
              <TouchableOpacity
                onPress={() => setUpdateModal("jobPreference")}
                className="p-1.5 rounded-md"
              >
                <Pencil size={16} color="#0784C9" />
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {employee && (
                <>
                  {/* Employment Types */}
                  {employee?.prefferedEmploymentTypes &&
                    (Array.isArray(employee?.prefferedEmploymentTypes)
                      ? employee?.prefferedEmploymentTypes
                      : JSON.parse(employee?.prefferedEmploymentTypes)
                    )?.map((role, index) => (
                      <Text
                        key={index}
                        className="bg-[#1e40af] flex align text-white px-2 py-0.5 rounded-full text-xs font-medium"
                      >
                        {role}
                      </Text>
                    ))}

                  {/* Shifts */}
                  {(Array.isArray(employee?.preferredShifts)
                    ? employee.preferredShifts
                    : JSON.parse(employee?.preferredShifts || "[]")
                  ).map((role, index) => (
                    <View  key={index} className="bg-[#0784C9] px-2 py-0.5 rounded-full items-center justify-center">
                      <Text className="text-white text-xs font-medium text-center p-1">{role}</Text>
                    </View>
                    // <Text
                    //   key={index}
                    //   className="bg-[#0784C9] text-white px-2 py-0.5 rounded-full text-xs font-medium text-center"
                    // >
                    //   {role}
                    // </Text>
                  ))}

                  {/* Location Types */}
                  {employee?.preferredLocationTypes &&
                    JSON.parse(employee?.preferredLocationTypes || "[]").map(
                      (role, index) => (
                        <Text
                          key={index}
                          className="bg-[#dff3f9] border border-[#0784C9] text-[#1e40af] px-2 py-0.5 rounded-full text-xs font-medium"
                        >
                          {role}
                        </Text>
                      )
                    )}
                </>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Basic Details */}
      <View className="p-6 bg-white mt-4 mx-4 mb-20 rounded-xl shadow">
        <View className="flex flex-row justify-between items-center">
          <Text className="text-lg font-bold text-[#0784c9] mb-4">
            Basic Details
          </Text>
          <TouchableOpacity
            className="flex flex-row gap-1 justify-center items-center"
            onPress={() => setUpdateModal("basicDetails")}
          >
            <Pencil color={"#0784c9"} size={12} />
            <Text className="text-[#0784c9]"> Edit</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="font-medium text-gray-700">Full Name</Text>
          <Text className="text-gray-900">{employee?.fullName}</Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="font-medium text-gray-700">Email Address</Text>

          <TouchableOpacity onPress={() => showFullSring(!fullString)}><Text className="text-gray-900">{handlestring(employee?.email, 10, fullString)}</Text></TouchableOpacity>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="font-medium text-gray-700">Phone Number</Text>
          <Text className="text-gray-900">{user?.phone}</Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="font-medium text-gray-700">Current Location</Text>
          <Text className="text-gray-900">{employee?.currentLocation}</Text>
        </View>
        <View className="flex-row justify-between mb-3">
          <Text className="font-medium text-gray-700">Total Experience</Text>
          <Text className="text-gray-900">
            {employee?.years} years {employee?.months} months
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="font-medium text-gray-700">Notice Period</Text>
          <Text className="text-gray-900">
            {employee?.EmployeeExperiences[0]?.noticePeriod}
          </Text>
        </View>
      </View>
      <UpdateResume
        open={updateFileModal === "profile"}
        label={"Profile Update"}
        onClose={() => setUpdateFileModal(null)}
        metaData={{
          field: "profileImage",
          Api: uploadProfileApi,
          default: null,
        }}
      />
      <UpdateResume
        open={updateFileModal === "resume"}
        label={"Upload Resume"}
        onClose={() => setUpdateFileModal(null)}
        metaData={{ field: "resume", Api: uploadResumeApi, default: null }}
      />

      <DynamicModal
        open={updateModal === "certificate"}
        onClose={() => setUpdateModal(null)}
        fields={{
          certification: Array.isArray(employee?.certification)
            ? employee?.certification
            : (employee?.certification &&
              JSON.parse(employee?.certification)) ||
            [],
        }}
        label={{ certification: "Add Your Certification Name" }}
        type={{
          certification: "multi",
        }}
        suggestions={{
          certification: getCertificationSuggestionsApi,
        }}
        metaData={{
          title: " Add Certification",
          type: "patch",
          api: createEmpProfile,
          params: null,
          id: null,
        }}
      />

      <DynamicModal
        open={updateModal === "basicDetails"}
        onClose={() => setUpdateModal(null)}
        fields={{
          fullName: employee?.fullName || "",
          email: employee?.email || "",
          gender: employee?.gender || "",
          dob: employee?.dob || "",
          currentLocation: employee?.currentLocation || "",
          hometown: employee?.hometown || "",
        }}
        label={{
          fullName: "Enter Your Name",
          email: "Enter Your Email",
          gender: "Enter Your Gender",
          dob: "Enter your Date of birth",
          currentLocation: "Enter Your Current Location",
          hometown: "Enter the Home Town",
        }}
        type={{
          fullName: "text",
          email: "text",
          gender: "text",
          dob: "date",
          currentLocation: "location",
          hometown: "text",
        }}
        suggestions={{
          gender: ["Male", "Female", "Other"],
        }}
        metaData={{
          title: " Edit Basic Details",
          type: "patch",
          api: createEmpProfile,
          params: null,
          id: null,
        }}
      />

      <DynamicModal
        open={updateModal === "education"}
        onClose={() => setUpdateModal(null)}
        setInitials={() => setSelectedEducation(null)}
        fields={{
          qualification: "",
          isHighestQualification: false,
          schoolMedium: "Hindi",
          instituteName: selectedEducation?.instituteName || "",
          ...(educationvalue === "Graduate" || educationvalue === "Postgraduate"
            ? { degree: selectedEducation?.degree || "" }
            : {}),
          specialization: selectedEducation?.specialisation || "",
          studyMode: selectedEducation?.studyMode || "Full-time",
          startDate: selectedEducation?.startDate || "",
          endDate: selectedEducation?.endDate || "",
        }}
        label={{
          qualification: "Education Level",
          instituteName: "College/School Name",
          isHighestQualification: "Is this your highest qualification",
          schoolMedium: "Medium of this study",
          degree: "Degree",
          specialization: "Specialization",
          studyMode: "Mode of your study",
          startDate: "Start Date",
          endDate: "End Date",
        }}
        type={{
          qualification: "radio",
          instituteName: "text",
          isHighestQualification: "radio",
          schoolMedium: "radio",
          degree: "single",
          specialization: "single",
          studyMode: "radio",
          startDate: "date",
          endDate: "date",
        }}
        suggestions={{
          qualification: [
            { "10th": "10th_or_Below_10th" },
            { "12th": "12th_Pass" },
            { Diploma: "Diploma_Categories" },
            { ITI: "ITI" },
            { Graduate: "Graduate" },
            { "Post Graduate": "Postgraduate" },
            { "CA/CS/ICWA": "Professional_Certification" },
          ],
          isHighestQualification: [{ Yes: true }, { No: false }],
          degree:
            educationvalue === "Graduate"
              ? graduateDegrees
              : postGraduateDegrees,
          specialization: specialisationSuggestions,
          schoolMedium: [{ Hindi: "Hindi" }, { English: "English" }],
          studyMode: [
            { "Full-Time": "f" },
            { "Part-Time": "p" },
            { Correspondence: "c" },
          ],
        }}
        metaData={{
          title: " Edit Education",
          api: createEducationApi,
          type: selectedEducation ? "patch" : "post",
          params: selectedEducation?.id ? [selectedEducation.id] : null,
          dynamicChange: setEducationValue,
          educationvalue: educationvalue,
        }}
      />

      <DynamicModal
        open={updateModal === "preferredJobs"}
        onClose={() => setUpdateModal(null)}
        fields={{
          preferredJobRoles: Array.isArray(employee?.preferredJobRoles)
            ? employee?.preferredJobRoles
            : (employee?.preferredJobRoles &&
              JSON.parse(employee?.preferredJobRoles)) ||
            [],
        }}
        label={{ preferredJobRoles: "Add Your Job Preference" }}
        type={{
          preferredJobRoles: "autocomplete",
        }}
        suggestions={{ preferredJobRoles: JobRoleSuggestionsApi }}
        metaData={{
          title: "preferredJobs",
          api: createEmpProfile,
          type: "patch",
          params: null,
          id: null,
        }}
      />

      <DynamicModal
        open={updateModal === "jobPreference"}
        onClose={() => setUpdateModal(null)}
        fields={{
          prefferedEmploymentTypes: Array.isArray(
            employee?.prefferedEmploymentTypes
          )
            ? employee?.prefferedEmploymentTypes
            : (employee?.prefferedEmploymentTypes &&
              JSON.parse(employee?.prefferedEmploymentTypes)) ||
            [],
          preferredLocationTypes: Array.isArray(
            employee?.preferredLocationTypes
          )
            ? employee?.preferredLocationTypes
            : (employee?.preferredLocationTypes &&
              JSON.parse(employee?.preferredLocationTypes)) ||
            [],
          preferredShifts: Array.isArray(employee?.preferredShifts)
            ? employee?.preferredShifts
            : (employee?.preferredShifts &&
              JSON.parse(employee?.preferredShifts)) ||
            [],
        }}
        label={{
          prefferedEmploymentTypes: "Preferred employement type",
          preferredLocationTypes: "Preferred Work Place",
          preferredShifts: "Preferred Work Shift",
        }}
        type={{
          prefferedEmploymentTypes: "multi",
          preferredLocationTypes: "multi",
          preferredShifts: "multi",
        }}
        suggestions={{
          prefferedEmploymentTypes: [
            "Part Time",
            "Full Time",
            "Internships",
            "Contract",
          ],
          preferredLocationTypes: ["onSite", "remote", "hybrid", "field-work"],
          preferredShifts: ["Night Shift", "Day Shift"],
        }}
        metaData={{
          title: "jobPreference",
          api: createEmpProfile,
          type: "patch",
          params: null,
          id: null,
        }}
      />

      <DynamicModal
        open={updateModal === "languageKnown"}
        onClose={() => setUpdateModal(null)}
        fields={{
          englishProficiency: employee?.englishProficiency || "",
          otherLanguages: Array.isArray(employee?.otherLanguages)
            ? employee?.otherLanguages
            : (employee?.otherLanguages &&
              JSON.parse(employee?.otherLanguages)) ||
            [],
        }}
        label={{
          englishProficiency: "What is your englsih speaking level",
          otherLanguages: "Select other language",
        }}
        type={{
          englishProficiency: "radio",
          otherLanguages: "multi",
        }}
        suggestions={{
          englishProficiency: [
            { Basic: "Basic" },
            { Intermediate: "Intermediate" },
            { Advanced: "Advanced" },
          ],
          otherLanguages: [
            "Assamese",
            "Bengali",
            "Bodo",
            "Dogri",
            "Gujarati",
            "Hindi",
            "Kannada",
            "Kashmiri",
            "Konkani",
            "Maithili",
            "Malayalam",
            "Manipuri",
            "Marathi",
            "Nepali",
            "Odia",
            "Punjabi",
            "Sanskrit",
            "Santali",
            "Sindhi",
            "Tamil",
            "Telugu",
            "Urdu",
          ],
        }}
        metaData={{
          title: "language Known",
          api: createEmpProfile,
          type: "patch",
          params: null,
          id: null,
        }}
      />

      <DynamicModal
        open={updateModal === "preferredJobCity"}
        onClose={() => setUpdateModal(null)}
        fields={{
          preferredJobCity: Array.isArray(employee?.preferredJobCity)
            ? employee?.preferredJobCity
            : (employee?.preferredJobCity &&
              JSON.parse(employee?.preferredJobCity)) ||
            [],
        }}
        label={{
          preferredJobCity: "Add Your Prefered Job City",
        }}
        type={{
          preferredJobCity: "autocomplete",
        }}
        suggestions={{ preferredJobCity: getCitiesApi }}
        metaData={{
          title: "Preferred job city",
          api: createEmpProfile,
          type: "patch",
          params: null,
          id: null,
        }}
      />

      <DynamicModal
        open={updateModal === "skills"}
        onClose={() => setUpdateModal(null)}
        fields={{
          skills: Array.isArray(employee?.skills)
            ? employee?.skills
            : (employee?.skills && JSON.parse(employee?.skills)) || [],
        }}
        label={{ skills: "Add Skills" }}
        type={{
          skills: "multi",
        }}
        metaData={{
          title: "  Edit skills",
          api: createEmpProfile,
          type: "patch",
          params: null,
          id: null,
        }}
      />

      <EditExperienceModal
        Open={updateModal === "editExperience"}
        close={() => setUpdateModal(null)}
        data={employee?.EmployeeExperiences[experienceIndex]}
        setInitials={() => setExperienceIndex(null)}
        metaData={{
          title: "Edit Experience",
          api: addExpApi,
          params: [employee?.EmployeeExperiences[experienceIndex]?.id],
          type: "patch",
          inputChange: getSkillsSuggestionsApi,
        }}
      />

      <EditExperienceModal
        Open={updateModal === "addExperience"}
        close={() => setUpdateModal(null)}
        data={null}
        setInitials={() => setExperienceIndex(null)}
        metaData={{
          title: "Add Experience",
          api: addExpApi,
          params: null,
          type: "post",
          inputChange: getSkillsSuggestionsApi,
        }}
      />
    </ScrollView>
  );
}
