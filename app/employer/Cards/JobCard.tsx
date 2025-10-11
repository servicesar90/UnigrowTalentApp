import {
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { jobPostApi } from "../../api/api";
import { apiFunction } from "@/app/api/apiFunction";
import { useDispatch } from "react-redux";
import { fetchCredits, fetchJobs } from "../../Redux/getData";
import Toast from "react-native-toast-message";


const JobCard = ({ job }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [pendingCount, setPendingCount] = useState(null);
  const dispatch = useDispatch();



  useEffect(() => {
    if (job?.JobApplications?.length) {
      const pendings = job.JobApplications.filter(
        (application) => application.status === "Applied"
      );
      const pendingLength = pendings.length;
      setPendingCount(pendingLength);
    }
  }, [job]);

  const toggleMenu = () => setShowMenu(!showMenu);

  const expiredJob = async (id) => {
    const response = await apiFunction(jobPostApi, [id], { status: "E" }, "patch", true);
    if (response) {
      dispatch(fetchJobs());
      Toast.show({
        type: "success",
        text1: "Expire",
        text2: "Succesfully Expired"
      })

    } else {
      Toast.show({
        type: "error",
        text1: "Expire",
        text2: "Could not Expire"
      })
    }
  };

  const repostJob = async (id) => {
    const response = await apiFunction(jobPostApi, null, { jobId: id }, "post", true);
    if (response) {
      dispatch(fetchJobs());
      dispatch(fetchCredits());
      Toast.show({
        type: "success",
        text1: "Repost",
        text2: "Succesfully Reposted"
      })

    } else {
      Toast.show({
        type: "error",
        text1: "Repost",
        text2: "Could not Reposted"
      })
    }
  };

  const activeJob = async (id) => {
    const response = await apiFunction(jobPostApi, [id], { status: "A" }, "patch", true);
    if (response) {
      dispatch(fetchJobs());
      Toast.show({
        type: "Success",
        text1: "Activate",
        text2: "succesfully Activated"
      })
    } else {
      Toast.show({
        type: "error",
        text1: "Activate",
        text2: "Could not activate"
      })
    }
  };

  const deleteJob = async (id) => {
    const response = await apiFunction(jobPostApi, [id], null, "delete", true);
    if (response) {
      dispatch(fetchJobs());
      Toast.show({
        type: "success",
        text1: "Delete",
        text2: "Successfully Deleted"
      })

    } else {
      Toast.show({
        type: "error",
        text1: "Delete",
        text2: "Ycould not deleted"
      })
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "A":
        return {
          label: "Active",
          bgColor: "bg-[#dcfce7]",
          textColor: "text-[#15803d]",
          borderColor: "border-[#bbf7d0]",
          iconColor: "#16a34a",
          Icon: () => (
            <Ionicons name="checkmark-circle-outline" size={12} color="#16a34a" />
          ),
        };
      case "P":
        return {
          label: "Pending",
          bgColor: "bg-[#fef3c7]",
          textColor: "text-[#a16207]",
          borderColor: "border-[#fde68a]",
          iconColor: "#d97706",
          Icon: () => (
            <Ionicons name="refresh-circle-outline" size={12} color="#d97706" />
          ),
        };
      case "E":
        return {
          label: "Expired",
          bgColor: "bg-[#fee2e2]",
          textColor: "text-[#dc2626]",
          borderColor: "border-[#fecaca]",
          iconColor: "#ef4444",
          Icon: () => (
            <Ionicons name="location-outline" size={12} color="#ef4444" />
          ),
        };
      default:
        return {
          label: "Unknown",
          bgColor: "bg-[#f3f4f6]",
          textColor: "text-[#374151]",
          borderColor: "border-[#d1d5db]",
          iconColor: "#6b7280",
          Icon: () => (
            <MaterialIcons name="info-outline" size={12} color="#6b7280" />
          ),
        };
    }
  };

  const statusConfig = getStatusConfig(job.status);

  return (
    <TouchableOpacity
      className="bg-white rounded-xl shadow-md overflow-hidden border border-[#0784c9] mb-4"
      onPress={() => {
        if (!showMenu) {
          router.push({
            pathname: "/employer/Screens/[jobid]",
            params: {jobid: job?.id}
          });
        }
      }}
    >
      {/* Header with gradient background */}
      <View className="bg-[#DFF3F9] p-6 border-b border-gray-200">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <View className="flex-row items-center flex-wrap gap-x-3 mb-2">
              <Text className="text-lg font-semibold text-[#003B70]">
                {job?.jobTitle}
              </Text>
              <View
                className={`flex-row items-center px-2 py-1 rounded-md text-xs font-medium border ${statusConfig.bgColor} ${statusConfig.borderColor}`}
              >
                {statusConfig.Icon()}
                <Text className={`ml-1 text-xs font-medium ${statusConfig.textColor}`}>
                  {statusConfig.label}
                </Text>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-4 text-sm text-gray-500">
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={16} color="#0784C9" />
                <Text className="text-sm text-gray-500">{job?.location}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="calendar-outline" size={16} color="#0784C9" />
                <Text className="text-sm text-gray-500">{job?.createdAt?.split("T")[0]}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="person-outline" size={16} color="#0784C9" />
                <Text className="text-sm text-gray-500">{job?.otherRecruiterName || "N/A"}</Text>
              </View>
            </View>
          </View>

          {/* More Options Menu */}
          <TouchableOpacity
            className="p-1 rounded-sm"
            onPress={(e) => {
              e.stopPropagation();
              toggleMenu();
            }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#6b7280" />
          </TouchableOpacity>
          {showMenu && (
            <View className="absolute top-8 right-2 z-10 bg-white rounded-lg border border-gray-200 shadow-lg min-w-[150px]">
              {job?.status !== "E" && (
                <TouchableOpacity
                  className="px-4 py-2"
                  onPress={() => {
                    toggleMenu();
                    router.push({
                      pathname: "/employer/Screens/jobPost/[action]/[id]",
                      params: { action: "Edit", id: job?.id }
                    });
                  }}
                >
                  <Text className="text-sm text-gray-700">Edit Job</Text>
                </TouchableOpacity>
              )}
              {job?.status !== "A" && (
                <TouchableOpacity
                  className="px-4 py-2"
                  onPress={() => {
                    toggleMenu();
                    activeJob(job?.id);
                  }}
                >
                  <Text className="text-sm text-gray-700">Active Job</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className="px-4 py-2"
                onPress={() => {
                  toggleMenu();
                  if (job?.status === "E") {
                    deleteJob(job?.id)
                  } else {
                    expiredJob(job?.id);
                  }

                }}
              >
                <Text className="text-sm text-gray-700">
                  {job?.status === "E" ? "Delete" : "Expire"} Job
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View className="p-6">
        {/* Alerts */}
        {job?.status === "E" && (
          <View className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <TouchableOpacity onPress={() => repostJob(job?.id)} className="flex-row items-start gap-3">
              <Ionicons name="refresh-circle-outline" size={20} color="#ea580c" />
              <Text className="text-sm text-orange-700">
                Repost now to receive new candidates.
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Applications Summary */}
        <View className="flex-row items-center justify-between pt-4 border-t-2 border-gray-100">
          <View className="flex-row items-center flex-wrap gap-4">
            <View className="flex-row items-center">
              <Text className="font-semibold text-[#003B70]">
                {job?.JobApplications?.length || 0}
              </Text>
              <Text className="text-gray-500 ml-1">Applicants</Text>
            </View>
            {pendingCount !== null && pendingCount > 0 && (
              <View className="flex-row items-center px-2 py-1 rounded-full text-xs font-medium bg-[#fef3c7] border border-[#fde68a]">
                <Text className="text-xs font-medium text-[#a16207]">
                  {pendingCount} pending
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          {job?.status === "A" ? (
            <TouchableOpacity
              className="flex-row items-center gap-2 px-4 py-2 rounded-md border border-[#0784C9] bg-white"
              onPress={(e) => {
                e.stopPropagation();
                router.push({
                  pathname: "/employer/Screens/jobPost/[action]/[id]",
                  params: { action: "duplicate", id: job?.id }
                });
              }}
            >
              <Ionicons name="copy-outline" size={16} color="#0784C9" />
              <Text className="text-[#0784C9] text-sm font-medium">Duplicate</Text>
            </TouchableOpacity>
          ) : job?.status === "P" ? (
            <TouchableOpacity
              className="flex-row items-center gap-2 px-4 py-2 rounded-md bg-[#0784C9]"
              onPress={(e) => {
                e.stopPropagation();
                router.push({
                  pathname: "/employer/Screens/jobPost/[action]/[id]",
                  params: { action: "Edit", id: job?.id }
                });
              }}
            >
              <Ionicons name="refresh-circle-outline" size={16} color="#ffffff" />
              <Text className="text-white text-sm font-medium">Finish Posting</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="flex-row items-center gap-2 px-4 py-2 rounded-md bg-[#0784C9]"
              onPress={(e) => {
                e.stopPropagation();
                repostJob(job?.id);
              }}
            >
              <Ionicons name="refresh-circle-outline" size={16} color="#ffffff" />
              <Text className="text-white text-sm font-medium">Repost now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default JobCard;