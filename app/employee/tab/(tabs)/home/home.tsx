// app/index.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, FlatList } from "react-native";
import { MapPin, Clock, Briefcase, Building2, Search, Filter, Building, ChevronRight, IndianRupee, Users, SortAsc, FilterX } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobs } from "@/app/Redux/getData";
import Toast from "react-native-toast-message";
import { Controller, useForm } from "react-hook-form";
import { jobAllFilterApi, searchJobApi } from "@/app/api/api";
import { apiFunction } from "@/app/api/apiFunction";
import { Modal } from "react-native-paper";
import { RadioGroup } from "react-native-radio-buttons-group";
import Slider from '@react-native-community/slider';


const filterOptions = [
  { label: "Experience", icon: Briefcase, options: [] },
  {
    label: "datePosted", icon: MapPin, options: [
      { label: "All", value: "all", id: 1, color: "#0784c9", type: "datePosted" },
      { label: "Last 24 hours", value: "last24", id: 2, color: "#0784c9", type: "datePosted" },
      { label: "Last 3 days", value: "last3", id: 3, color: "#0784c9", type: "datePosted" },
      { label: "Last 7 days", value: "last7", id: 4, color: "#0784c9", type: "datePosted" },
    ]
  },
  {
    label: "workMode", icon: Building, options: [
      { label: "Work From Home", value: "Remote", id: 1, color: "#0784c9", type: "workMode" },
      { label: "Work From Office", value: "Onsite", id: 2, color: "#0784c9", type: "workMode" },
      { label: "Work From Field", value: "field-work", id: 3, color: "#0784c9", type: "workMode" },
      { label: "Hybrid", value: "Hybrid", id: 4, color: "#0784c9", type: "workMode" },
    ]
  },
  {
    label: "workType", icon: Building2, options: [
      { label: "Full Time", value: "Full-Time", id: 1, color: "#0784c9", type: "workType" },
      { label: "Part Time", value: "Part-Time", id: 2, color: "#0784c9", type: "workType" },
      { label: "Internship", value: "Internship", id: 3, color: "#0784c9", type: "workType" },
      { label: "Contract", value: "Contract", id: 4, color: "#0784c9", type: "workType" },
    ]
  },
  {
    label: "workShift", icon: Clock, options: [
      { label: "Day Shift", value: "Day Shift", id: 1, color: "#0784c9", type: "workShift" },
      { label: "Night Shift", value: "Night Shift", id: 2, color: "#0784c9", type: "workShift" },
    ]
  },
  {
    label: "sortBy", icon: SortAsc, options: [
      { label: "Salary - High to low", value: "Salary - High to low", id: 1, color: "#0784c9", type: "sortBy" },
      { label: "Date Posted - New to Old", value: "Date posted - New to Old", id: 2, color: "#0784c9", type: "sortBy" },
    ]
  }
];

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [jobss, setJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [showsearch, setShowSearch] = useState(false);
  const [showFilter, setshowFilter] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState([]);
  const [hotJobs, setHotJobs] = useState([]);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [salaryValue, setSalaryValue] = useState(5000)
  const [selectedId, setSelectedId] = useState([{ label: "datePosted", id: 0 }, { label: "workMode", id: 0 }, { label: "workType", id: 0 }, { label: "workShift", id: 0 }, { label: "sortBy", id: 0 }]);
  const { handleSubmit, control } = useForm({
    defaultValues: {
      q: "",
      l: ""
    }
  })

  const { jobs } = useSelector((state) => state.getDataReducer);



  useEffect(() => {
    dispatch(fetchJobs())
  }, [dispatch])

  useEffect(() => {
    if (jobs) {
      setJobs(jobs)
      setAllJobs(jobs);
      const hot = jobs?.filter((job) => job.jobPlan === "Hot");
      setHotJobs(hot)
    }
  }, [jobs])

  const searchJob = async (data) => {

    const url = `${searchJobApi}?q=${data.q}&l=${data.l}`

    const response = await apiFunction(url, null, null, "get", true)
    if (response) {
      setJobs(response.data);
    } else {
      Toast.show({
        type: "error",
        text1: "Search",
        text2: "Couold not find the jobs"
      })
    }
  };

  useEffect(() => {
    if (!hotJobs || hotJobs.length === 0) return;

    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= hotJobs.length) {
        nextIndex = 0;
      }
      setCurrentIndex(nextIndex);

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [currentIndex, hotJobs]);

  const handleFilter = async (id) => {
    try {

      const updatedSelectedId = selectedId.map((fil) => {
        if (fil.label === showFilterModal[0]?.type) {
          return { ...fil, id };
        }
        return fil;
      });

      setSelectedId(updatedSelectedId);

      // Build URL
      const filterVal = filterOptions
        .find((val) => val.label === showFilterModal[0]?.type)
        ?.options.find((opt) => opt.id === id)?.value;

      if (filterVal) {
        const url = new URL(jobAllFilterApi);
        url.searchParams.append(showFilterModal[0]?.type, filterVal)

        console.log("url", url)
        const response = await apiFunction(url.toString(), null, null, "get", true);
        if (response) {
          console.log("res", response)
          setJobs(response.data);
        }
      }
    } catch (error) {
      console.error("Error in handleFilter:", error);
    }
  };

  const salaryfilter = async (value) => {
    setSalaryValue(value)
    const url = new URL(jobAllFilterApi);
    url.searchParams.append("salaryMax", value)


    const response = await apiFunction(url.toString(), null, null, "get", true);
    if (response) {

      setJobs(response.data);
    }

  }



  return (
    <View className="w-full h-full ">

      <ScrollView className="flex-1 p-4">
        {/* Search Bar */}

        <View className="w-full flex flex-row justify-end items-center gap-4 pr-4 mb-2">

          <TouchableOpacity onPress={() => setShowSearch(!showsearch)}>
            <Search size={23} color="#0784c9" />
          </TouchableOpacity>


          {!filterApplied ?
            <TouchableOpacity onPress={() => setshowFilter(!showFilter)}>

              <Filter size={20} color="#0784c9" className="ml-1" />
            </TouchableOpacity>
            :
            <TouchableOpacity onPress={() => {
              setJobs(allJobs)
              setFilterApplied(false)
              setshowFilter(false)
              setSelectedId([{ label: "datePosted", id: 0 }, { label: "workMode", id: 0 }, { label: "workType", id: 0 }, { label: "workShift", id: 0 }, { label: "sortBy", id: 0 }])
            }}>
              <FilterX size={16} color="#0784c9" className="ml-1" />
            </TouchableOpacity>
          }
        </View>


        {/* Search start */}
        {
          showsearch && <View>

            <View className="flex-row items-center bg-white rounded-lg border border-gray-300 px-3 py-2 mb-6">
              <Search size={20} color="#6B7280" />
              <Controller
                name="q"
                control={control}
                render={({ field }) => (

                  <TextInput
                    onChange={({ nativeEvent: { text } }) => field.onChange(text)}
                    value={field.value}
                    placeholder="Search for any keywords..."
                    className="flex-1 ml-2 text-base"
                  />
                )}

              />


            </View>

            <View className="flex-row items-center bg-white rounded-lg border border-gray-300 px-3 py-2 mb-6">
              <Search size={20} color="#6B7280" />
              <Controller
                name="l"
                control={control}
                render={({ field }) => (

                  <TextInput
                    onChange={({ nativeEvent: { text } }) => field.onChange(text)}
                    value={field.value}
                    placeholder="Search for location..."
                    className="flex-1 ml-2 text-base"
                  />
                )}

              />
              <TouchableOpacity onPress={handleSubmit(searchJob)} className="bg-[#0784c9] px-4 py-2 rounded-lg">
                <Text className="text-white font-medium">Search</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        {/* Search end */}


        {/* Filter Buttons  */}
        {showFilter &&
          <View className="flex-row flex-wrap justify-center gap-3 mb-6">
            {filterOptions.map((filter) => (


              <TouchableOpacity
                key={filter.label}
                className="flex-row items-center border border-gray-300 px-3 py-2 rounded-full"
                onPress={() => setShowFilterModal(filter.options)}
              >
                <filter.icon size={16} color="#374151" />
                <Text className="ml-2 text-gray-700">{filter.label}</Text>

                <Filter size={14} color="#6B7280" className="ml-1" />


              </TouchableOpacity>

            ))}

            <View className="flex justify-center items-center ">

              <Text className="font-bold text-sm ">Salary Range</Text>

              <Slider
                style={{ width: 200, height: 40, marginTop: -10 }}
                minimumValue={5000}
                maximumValue={100000}
                minimumTrackTintColor="#0784c9"
                maximumTrackTintColor="#5babd6ff"
                value={salaryValue}
                onValueChange={(value) => salaryfilter(value)}
              />

              <Text className="-mt-3">{salaryValue}</Text>

            </View>

          </View>
        }

        <FlatList
          ref={flatListRef}
          data={hotJobs}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled
          contentContainerStyle={{ gap: 10 }}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-white rounded-xl w-[90vw] border border-gray-200 overflow-hidden shadow-md active:scale-[0.99] "
              onPress={() => router.push(`/employee/tab/(tabs)/home/${item?.id}`)}

            >
              {/* Status Header */}
              <View
                className="flex-row justify-between items-center border-b border-gray-100 px-4 py-2"
                style={{
                  backgroundColor: "rgba(221, 115, 44, 0.5)",
                }}
              >
                {item?.jobPlan && ["Premium", "Hot"].includes(item.jobPlan) && (
                  <View className="flex-row items-center space-x-1">
                    {/* Replace with RN Icon */}
                    <Text className="text-xs font-medium" style={{ color: "#003B70" }}>
                      Urgently hiring
                    </Text>
                  </View>
                )}

                {item?.status && (
                  <View className="flex-row items-center gap-2">
                    <View
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: "red"
                      }}
                    />
                    <Text className="text-xs font-medium" style={{ color: "#003B70" }}>
                      HOT
                    </Text>
                  </View>
                )}
              </View>

              {/* Card Body */}
              <View className="p-4">
                {/* Logo + Info */}
                <View className="flex-row items-start mb-3 space-x-3">
                  <View>
                    {item?.Employer?.company?.logoUrl ? (
                      <Image
                        source={{ uri: item.Employer.company.logoUrl }}
                        className="w-12 h-12 rounded-lg border border-gray-200"
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        className="w-12 h-12 rounded-lg items-center justify-center border border-gray-200"
                        style={{ backgroundColor: "#dff3f9" }}
                      >
                        <Building size={20} color="#0784C9" />
                      </View>
                    )}
                  </View>

                  <View className="flex-1 ml-3">
                    <Text className="text-lg font-bold text-gray-900 mb-1" numberOfLines={1}>
                      {item?.jobTitle || "N/A"}
                    </Text>

                    <View className="flex-row items-center gap-1 mb-1">
                      <Building size={14} color="#0784C9" />
                      <Text className="text-sm font-medium text-gray-600" numberOfLines={1}>
                        {item?.Employer?.company?.companyName || "N/A"}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-1">
                      <MapPin size={14} color="#0784C9" />
                      <Text className="text-sm text-gray-600">{item?.location || "N/A"}</Text>
                    </View>
                  </View>

                  <ChevronRight size={16} color="#0784C9" />
                </View>

                {/* Salary Box */}
                <View
                  className="rounded-lg p-3 mb-3 border border-gray-100"
                  style={{ backgroundColor: "#dff3f9" }}
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center space-x-1">
                      <IndianRupee size={14} color="#003B70" />
                      <Text className="text-sm font-medium" style={{ color: "#003B70" }}>
                        Monthly Salary
                      </Text>
                    </View>
                    <Text className="text-sm font-bold" style={{ color: "#003B70" }}>
                      {item?.minimumSalary
                        ? `₹${item.minimumSalary} - ₹${item.maximumSalary}`
                        : "N/A"}
                    </Text>
                  </View>
                </View>

                {/* Tags */}
                <View className="flex-row flex-wrap flex justify-start items-center mb-3 gap-2">
                  {item?.workLocationType && (
                    <Text
                      className="py-2 px-3 rounded-full text-xs font-medium border bg-[#dff3f9] text-[#003B70] border-[#0784C9]"

                    >
                      {item?.workLocationType}
                    </Text>
                  )}
                  {item?.jobType && (
                    <Text
                      className="py-2 px-3 rounded-full text-xs font-medium border bg-[#dff3f9] text-[#003B70] border-[#0784C9]"

                    >
                      {item.jobType}
                    </Text>
                  )}
                  {item?.payType && (
                    <Text
                      className="py-2 px-3 rounded-full text-xs font-medium border bg-[#dff3f9] text-[#003B70] border-[#0784C9]"

                    >
                      {item.payType}
                    </Text>
                  )}
                </View>

                {/* Footer */}
                <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
                  <View className="flex-row items-center space-x-1">
                    <Users size={14} color="#0784C9" />
                    <Text className="text-xs text-gray-500">
                      {item?.JobApplications?.length || 0} applicants
                    </Text>
                  </View>

                  <View
                    className="px-4 py-2 rounded-lg"
                    style={{ backgroundColor: "#0784C9" }}
                  >
                    <Text className="text-xs font-semibold text-white">View Details</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />




        {/* Results Header */}
        <View className="mb-4 mt-4">
          <Text className="text-2xl font-bold text-gray-900">Available Opportunities</Text>
          <Text className="text-gray-600">Showing {jobss?.length} jobs matching your criteria</Text>
        </View>

        {/* Job Cards */}
        <View className="gap-4 mb-20">
          {jobss?.map((job, index) => (
            <TouchableOpacity
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md active:scale-[0.99]"
              onPress={() => router.push(`/employee/tab/(tabs)/home/${job?.id}`)}
              key={index}
            >
              {/* Status Header */}
              <View
                className="flex-row justify-between items-center border-b border-gray-100 px-4 py-2"
                style={{
                  backgroundColor:
                    job?.status === "E" ? "rgba(243, 181, 181, 0.5)" : "#dff3f9",
                }}
              >
                {job?.jobPlan && ["Premium", "Hot"].includes(job.jobPlan) && (
                  <View className="flex-row items-center space-x-1">
                    {/* Replace with RN Icon */}
                    <Text className="text-xs font-medium" style={{ color: "#003B70" }}>
                      Urgently hiring
                    </Text>
                  </View>
                )}

                {job?.status && (
                  <View className="flex-row items-center gap-2">
                    <View
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          job?.status === "E" ? "rgb(250, 55, 6)" : "rgb(83, 250, 6)",
                      }}
                    />
                    <Text className="text-xs font-medium" style={{ color: "#003B70" }}>
                      {job.status === "E" ? "Expired" : "Active"}
                    </Text>
                  </View>
                )}
              </View>

              {/* Card Body */}
              <View className="p-4">
                {/* Logo + Info */}
                <View className="flex-row items-start mb-3 space-x-3">
                  <View>
                    {job?.Employer?.company?.logoUrl ? (
                      <Image
                        source={{ uri: job.Employer.company.logoUrl }}
                        className="w-12 h-12 rounded-lg border border-gray-200"
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        className="w-12 h-12 rounded-lg items-center justify-center border border-gray-200"
                        style={{ backgroundColor: "#dff3f9" }}
                      >
                        <Building size={20} color="#0784C9" />
                      </View>
                    )}
                  </View>

                  <View className="flex-1 ml-3">
                    <Text className="text-lg font-bold text-gray-900 mb-1" numberOfLines={1}>
                      {job?.jobTitle || "N/A"}
                    </Text>

                    <View className="flex-row items-center gap-1 mb-1">
                      <Building size={14} color="#0784C9" />
                      <Text className="text-sm font-medium text-gray-600" numberOfLines={1}>
                        {job?.Employer?.company?.companyName || "N/A"}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-1">
                      <MapPin size={14} color="#0784C9" />
                      <Text className="text-sm text-gray-600">{job?.location || "N/A"}</Text>
                    </View>
                  </View>

                  <ChevronRight size={16} color="#0784C9" />
                </View>

                {/* Salary Box */}
                <View
                  className="rounded-lg p-3 mb-3 border border-gray-100"
                  style={{ backgroundColor: "#dff3f9" }}
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center space-x-1">
                      <IndianRupee size={14} color="#003B70" />
                      <Text className="text-sm font-medium" style={{ color: "#003B70" }}>
                        Monthly Salary
                      </Text>
                    </View>
                    <Text className="text-sm font-bold" style={{ color: "#003B70" }}>
                      {job?.minimumSalary
                        ? `₹${job.minimumSalary} - ₹${job.maximumSalary}`
                        : "N/A"}
                    </Text>
                  </View>
                </View>

                {/* Tags */}
                <View className="flex-row flex-wrap flex justify-start items-center mb-3 gap-2">
                  {job?.workLocationType && (
                    <Text
                      className="py-2 px-3 rounded-full text-xs font-medium border bg-[#dff3f9] text-[#003B70] border-[#0784C9]"

                    >
                      {job.workLocationType}
                    </Text>
                  )}
                  {job?.jobType && (
                    <Text
                      className="py-2 px-3 rounded-full text-xs font-medium border bg-[#dff3f9] text-[#003B70] border-[#0784C9]"

                    >
                      {job.jobType}
                    </Text>
                  )}
                  {job?.payType && (
                    <Text
                      className="py-2 px-3 rounded-full text-xs font-medium border bg-[#dff3f9] text-[#003B70] border-[#0784C9]"

                    >
                      {job.payType}
                    </Text>
                  )}
                </View>

                {/* Footer */}
                <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
                  <View className="flex-row items-center space-x-1">
                    <Users size={14} color="#0784C9" />
                    <Text className="text-xs text-gray-500">
                      {job?.JobApplications?.length || 0} applicants
                    </Text>
                  </View>

                  <View
                    className="px-4 py-2 rounded-lg"
                    style={{ backgroundColor: "#0784C9" }}
                  >
                    <Text className="text-xs font-semibold text-white">View Details</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Load More */}
        {/* <View className="items-center mt-6 mb-12">
          <TouchableOpacity className="border border-blue-600 px-6 py-3 rounded-lg">
            <Text className="text-blue-600 font-medium">Load More Jobs</Text>
          </TouchableOpacity>
        </View> */}
      </ScrollView>

      {/* filters modal start */}
      <Modal
        visible={showFilterModal.length > 0}
        onDismiss={() => setShowFilterModal([])}
        contentContainerStyle={{ justifyContent: "center", alignItems: "center" }}
      >
        <View className="bg-[#fff] w-[90vw] h-auto flex justify-center flex-col gap-6 p-4 rounded-lg z-10  ">



          <RadioGroup
            radioButtons={showFilterModal}
            containerStyle={{ display: "flex", alignItems: "flex-start", flexDirection: "column", paddingVertical: 4 }}
            onPress={(id) => {
              handleFilter(id)
              setFilterApplied(true)

            }}
            selectedId={
              selectedId.find((fil) => fil.label === showFilterModal[0]?.type)?.id
            }
          />


        </View>

      </Modal>
      {/* filters modal end */}


    </View>
  );
}
