
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
} from "react-native";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Building,
  Eye,
  CheckCircle,
  XCircle,
  Briefcase,
} from "lucide-react-native";

import { useDispatch, useSelector } from "react-redux";
import { fetchAppliedJobs } from "@/app/Redux/getData";
import { useRouter } from "expo-router";

export default function AppliedJobs() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();

  const { appliedJobs } = useSelector((state) => state.getDataReducer)



  useEffect(() => {
    dispatch(fetchAppliedJobs())
  }, [dispatch])

  const getStatusCount = (status) => appliedJobs?.filter((job) => job?.Job?.JobApplications?.status === status)?.length;

  const filteredJobs = appliedJobs?.filter((job) => {
    const matchesStatus = selectedStatus === "all" || job?.Job?.status === selectedStatus;
    const matchesSearch =
      searchTerm === "" ||
      job.Job?.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.Job?.Employer?.company?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

         



  const statusOptions = [
    { label: "All", value: "all", count: appliedJobs?.length, icon: <Briefcase color="#2563eb" /> },
    { label: "Shortlisted", value: "shortlisted", count: getStatusCount("Selected"), icon: <CheckCircle color="green" /> },
    { label: "Pending", value: "pending", count: getStatusCount("Applied"), icon: <Clock color="orange" /> },
    { label: "Rejected", value: "rejected", count: getStatusCount("Rejected"), icon: <XCircle color="red" /> },
  ];

  return (
    <View className="flex-1 bg-slate-50 p-4">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-900">Applied Jobs</Text>
        <Text className="text-gray-600">Track and manage your job applications</Text>
      </View>

      {/* Status Filters */}
      <View className="flex-row flex-wrap gap-2 mb-4">
        {statusOptions.map((status) => (
          <TouchableOpacity
            key={status.value}
            className={`items-center p-3 rounded-lg w-[23%] ${selectedStatus === status.value ? "bg-blue-100" : "bg-white"
              }`}
            onPress={() => setSelectedStatus(status.value)}
          >
            {status.icon}
            <Text className="font-bold">{status.count}</Text>
            <Text className="text-xs text-gray-700">{status.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View className="flex-row items-center bg-white p-2 rounded-lg mb-4">
        <Search size={18} color="#666" className="mr-2" />
        <TextInput
          placeholder="Search jobs..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          className="flex-1 text-sm"
        />
      </View>

      {/* Job List */}
      {filteredJobs?.length === 0 ? (
        <Text className="text-center text-gray-500 p-6">No jobs found</Text>
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item: job }) => (
            <TouchableOpacity onPress={()=>router.push(`/employee/tab/(tabs)/home/${job?.Job?.id}`)} className="bg-white rounded-xl shadow-lg p-4 mb-4 flex-row gap-3">
              <View className="flex justify-center items-center bg-[#DEF3F9] h-[50] w-[50] rounded-lg">
                <Text className="font-bold text-2xl text-black">{job?.Job?.Employer?.company?.companyName?.split("")[0].toUpperCase()}</Text>
              </View>
              <View className="flex-1"> 
                <Text className="text-lg font-semibold text-gray-900">{job?.Job?.jobTitle}</Text>
                <Text className="text-[#0784c9] flex-row items-center">
                  <Building size={14} color={"#0784c9"} /> {job?.Job?.Employer?.company?.companyName}
                </Text>
                <View className="flex-row flex-wrap gap-2 my-1">
                  <View className="flex-row items-center gap-1">
                    <MapPin size={14} color={"#0784c9"} />
                    <Text className="text-gray-600 text-sm">{job?.Job?.location}</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <DollarSign size={14} color={"#0784c9"} />
                    <Text className="text-gray-600 text-sm">{job?.Job?.minimumSalary}-{job?.Job?.maximumSalary}</Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-1 mt-2">
                  {Array.isArray(job?.Job?.skills) && job?.Job?.skills.length > 0 && (
                    job?.Job?.skills.map((skill, idx) => (
                      <Text
                        key={idx}
                        className="bg-[#DEF3F9] text-[#0784c9] px-2 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </Text>
                    ))
                  )}
                </View>
                <Text className="text-gray-500 text-xs mt-2">
                  Applied  days ago | Deadline:
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
