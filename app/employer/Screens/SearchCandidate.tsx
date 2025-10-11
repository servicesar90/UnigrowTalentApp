import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";


import {

  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Filter,
  FunnelX,
 
} from "lucide-react-native";
import { apiFunction } from "@/app/api/apiFunction";
import { searchCandidateApi } from "@/app/api/api";
import Toast from "react-native-toast-message";
import CandidateCard from "../Cards/candidateCard";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
// import CandidateCard from "../Cards/candidateCard";

// Custom RadioButton for Native
const RadioButton = ({ label, value, selected, onSelect }) => (
  <Pressable
    onPress={() => onSelect(value)}
    className="flex-row items-center p-1 rounded transition-opacity active:opacity-80"
    style={{ backgroundColor: selected ? "#DFF3F9" : "transparent" }}
  >
    <View
      className={`h-4 w-4 rounded-full border-2 ${selected ? "border-[#0784C9]" : "border-[#003B70]"} mr-2`}
    >
      {selected && (
        <View className="h-2 w-2 rounded-full bg-[#0784C9] self-center my-auto" />
      )}
    </View>
    <Text className="text-xs text-[#003B70]">{label}</Text>
  </Pressable>
);

export default function  SearchCandidates() {
  const { handleSubmit, reset, control ,formState: { errors }} = useForm({
    defaultValues: {
      experience: "Any",
      jobTitle: null,
      location: null,
      minExperience: null,
      maxExperience: null,
      minimumSalary: null,
      maximumSalary: null,
      education: null,
    },
  });
  const [showSearched, setShowSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [candidatess, setCandidate] = useState(null);
  const [isFilter, setIsFilter] = useState(false);
  const [allCandidates, setAllCandidates] = useState(null);
  const [jobTittle, setJobTitle] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [pageContent, setPageContent] = useState(20);
  const [appliedInOpen, setAppliedInOpen] = useState("");
  const [searchData, setSearchData] = useState(null)
  const [activeFilters, setActiveFilters] = useState({
    time: null,
    education: null,
    gender: null,
  });
  

  const onSubmit = async (data) => {
    const response = await apiFunction(`${searchCandidateApi}?page=1&pageSize=20`,null,data,"post",true);
    console.log(response);
    
    if(response){
      
    setJobTitle(data?.jobTitle);
    setCandidate(response?.employees);
    setAllCandidates(response?.employees);
     setShowSearched(true);
     setSearchData(data);
     
     setTotalPages(response?.totalPages)
    }else{
      Toast.show({
        type: "error",
        text1: "Search",
        text2: "Could not Find Any Candidate"
      })
    }
  };

    const getData = async () => {
      const response = await apiFunction(`${searchCandidateApi}?page=${page}&pageSize=${pageContent}`, null, searchData, "post", true);
      if (response) {
        setCandidate(response?.employees);
        setAllCandidates(response?.employees);
        setTotalPages(response?.totalPages)
      } else {
        Toast.show({
          type: "error",
          text1: "Search",
          text2: "Could not Find Any Candidate"
        })
      }
    }
  
    useEffect(() => {
      getData()
    }, [pageContent, page])
  


  const handlefilter = (type, value) => {
    const updatedFilters = {
      ...activeFilters,
      [type]: value,
    };
    setActiveFilters(updatedFilters);
    setIsFilter(true);


    let filtered = [...allCandidates];

    if (updatedFilters.gender) {
      filtered = filtered.filter((candidate) => {
        return candidate?.EmployeeProfile?.gender === updatedFilters.gender;
      });
    }

    if (updatedFilters.education) {
      filtered = filtered.filter((candidate) => {
        const educations = candidate?.EmployeeProfile?.EmployeeEducations;
        const highestEducation =
          Array.isArray(educations) && educations.length > 0
            ? educations.reduce((latest, current) => {
              const latestDate = new Date(latest.startDate);
              const currentDate = new Date(current.startDate);
              return currentDate > latestDate ? current : latest;
            })
            : null;

        const qualification = highestEducation?.qualification;

        switch (updatedFilters.education) {
          case "10th pass":
            return qualification === "10th_or_Below_10th";
          case "12th pass":
            return qualification === "12th_pass";
          case "ITI":
            return qualification === "ITI";
          case "Graduate":
            return (
              qualification === "Graduate" || qualification === "Postgraduate"
            );
          case "post Graduate":
            return qualification === "Postgraduate";
          default:
            return true;
        }
      });
    }

    if (updatedFilters.time) {
      const now = new Date();
      let compareDate = null;

      if (updatedFilters.time === "24 hours") {
        compareDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (updatedFilters.time === "10 days") {
        compareDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      } else if (updatedFilters.time === "30 days") {
        compareDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      filtered = filtered.filter((item) => {
        const appliedAt = item?.unlockedAt ? new Date(item.unlockedAt) : null;

      
        return appliedAt && appliedAt >= compareDate;
      });
    }

    setCandidate(filtered);
  };

  const handleClearFilters = () => {
    setCandidate(allCandidates);
    setIsFilter(false);
    setActiveFilters({
      time: null,
      education: null,
      gender: null,
    });
  };

  if (showSearched) {
    return (
      <View
        className="min-h-screen w-full"
        style={{ backgroundColor: "#DFF3F9" }}
      >
        {/* Mobile Filter Button */}
        <View className=" flex-row justify-center mb-2 p-4">
          <TouchableOpacity
            className="flex-1 items-center px-4 py-3 rounded-lg hover:opacity-90 transition-opacity"
            style={{
              color: "#DFF3F9",
              backgroundColor: "#0784C9",
              borderColor: "#003B70",
            }}
            onPress={() => setShowFilters(true)}
          >
            <Text className="text-white text-base font-semibold">
              Show Filters
            </Text>
          </TouchableOpacity>
        </View>

        {showFilters && 
        <View
          className="absolute  left-0 w-full h-[80vh] z-50 shadow-xl p-4 rounded-t-2xl animate-slideUp overflow-y-auto md:static md:flex md:w-1/4 md:space-y-4 md:bg-transparent md:shadow-none md:p-4"
          style={{
            backgroundColor: "white",
          }}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text
              className="text-base font-semibold"
              style={{ color: "#003B70" }}
            >
              Filters
            </Text>
            <Pressable
              onPress={() => setShowFilters(false)}
              className="p-2"
            >
              <Text className="text-2xl font-bold" style={{ color: "#003B70" }}>
                ×
              </Text>
            </Pressable>
          </View>

          <View
            className="flex-row items-center gap-2 font-semibold text-sm mb-2"
            style={{ color: "#003B70" }}
          >
            {isFilter ? (
              <Pressable onPress={handleClearFilters}>
                <Ionicons name="filter-circle-outline" size={20} color="#0784C9" />
              </Pressable>
            ) : (
              <Ionicons name="filter-outline" size={20} color="#0784C9" />
            )}
            <Text style={{ color: "#003B70" }}>Filters</Text>
          </View>

          <ScrollView
            className="rounded-lg  flex border border-[#0784c9] shadow-sm p-4 bg-white text-sm"
           
          >
            <View className="flex flex-col h-auto gap-2">

            <Pressable className="flex flex-row gap-4 items-center" onPress={() => setAppliedInOpen("applied")}>
              <Text style={{ color: "#003B70", fontWeight: "bold", fontSize: 18 }}>Unlocked At</Text>
              {appliedInOpen === "applied" ? <ChevronUp size={20} color={"#003B70"} onPress={()=> setAppliedInOpen("")} />: <ChevronDown size={20} color={"#003B70"} />}
            </Pressable>
            {(appliedInOpen === "applied") && (
              <View className="ml-4 mt-2 space-y-2">
                <Pressable
                  className="flex-row items-center gap-3 p-2 rounded transition-opacity"
                  style={{
                    backgroundColor: "#DFF3F9",
                    opacity: activeFilters.time === "24 hours" ? 1 : 0.8,
                  }}
                  onPress={() => {
                    handlefilter("time", "24 hours")
                    setShowFilters(false)
                  }}
                >
                  <View className={`w-4 h-4 rounded-full border border-[#0784C9] justify-center items-center ${activeFilters.time === "24 hours" ? 'bg-[#0784C9]' : 'bg-transparent'}`} />
                  <Text style={{ color: "#003B70" }}>Last 24 Hours</Text>
                </Pressable>
                <Pressable
                  className="flex-row items-center gap-3 p-2 rounded transition-opacity"
                  style={{
                    backgroundColor: "#DFF3F9",
                    opacity: activeFilters.time === "10 days" ? 1 : 0.8,
                  }}
                  onPress={() => {
                    handlefilter("time", "10 days")
                    setShowFilters(false)
                  }}
                >
                  <View className={`w-4 h-4 rounded-full border border-[#0784C9] justify-center items-center ${activeFilters.time === "10 days" ? 'bg-[#0784C9]' : 'bg-transparent'}`} />
                  <Text style={{ color: "#003B70" }}>Last 10 days</Text>
                </Pressable>
                <Pressable
                  className="flex-row items-center gap-3 p-2 rounded transition-opacity"
                  style={{
                    backgroundColor: "#DFF3F9",
                    opacity: activeFilters.time === "30 days" ? 1 : 0.8,
                  }}
                  onPress={() => {
                    handlefilter("time", "30 days")
                       setShowFilters(false)
                  }}
                >
                  <View className={`w-4 h-4 rounded-full border border-[#0784C9] justify-center items-center ${activeFilters.time === "30 days" ? 'bg-[#0784C9]' : 'bg-transparent'}`} />
                  <Text style={{ color: "#003B70" }}>Last 30 days</Text>
                </Pressable>
              </View>
            )}

            <Pressable className="flex flex-row gap-4 items-center" onPress={() => setAppliedInOpen("education")}>
              <Text style={{ color: "#003B70", fontWeight: "bold", fontSize: 18 }}>Education</Text>
              {appliedInOpen === "education" ? <ChevronUp size={20} color={"#003B70"} onPress={()=> setAppliedInOpen("")} />: <ChevronDown size={20} color={"#003B70"} />}
            </Pressable>
            {(appliedInOpen === "education") && (
              <View className="ml-4 mt-2 space-y-2">
                <Pressable
                  className="flex-row items-center gap-3 p-2 rounded transition-opacity"
                  style={{
                    backgroundColor: "#DFF3F9",
                    opacity: activeFilters.education === "10th pass" ? 1 : 0.8,
                  }}
                  onPress={() => {
                    handlefilter("education", "10th pass")
                    setShowFilters(false)
                  }}
                >
                  <View className={`w-4 h-4 rounded-full border border-[#0784C9] justify-center items-center ${activeFilters.education === "10th pass" ? 'bg-[#0784C9]' : 'bg-transparent'}`} />
                  <Text style={{ color: "#003B70" }}>10th pass</Text>
                </Pressable>
                <Pressable
                  className="flex-row items-center gap-3 p-2 rounded transition-opacity"
                  style={{
                    backgroundColor: "#DFF3F9",
                    opacity: activeFilters.education === "12th pass" ? 1 : 0.8,
                  }}
                  onPress={() => {
                    handlefilter("education", "12th pass")
                    setShowFilters(false)
                  }}
                >
                  <View className={`w-4 h-4 rounded-full border border-[#0784C9] justify-center items-center ${activeFilters.education === "12th pass" ? 'bg-[#0784C9]' : 'bg-transparent'}`} />
                  <Text style={{ color: "#003B70" }}>12th Pass</Text>
                </Pressable>
                <Pressable
                  className="flex-row items-center gap-3 p-2 rounded transition-opacity"
                  style={{
                    backgroundColor: "#DFF3F9",
                    opacity: activeFilters.education === "ITI" ? 1 : 0.8,
                  }}
                  onPress={() => {
                    handlefilter("education", "ITI")
                    setShowFilters(false)
                  }}
                >
                  <View className={`w-4 h-4 rounded-full border border-[#0784C9] justify-center items-center ${activeFilters.education === "ITI" ? 'bg-[#0784C9]' : 'bg-transparent'}`} />
                  <Text style={{ color: "#003B70" }}>ITI</Text>
                </Pressable>
                <Pressable
                  className="flex-row items-center gap-3 p-2 rounded transition-opacity"
                  style={{
                    backgroundColor: "#DFF3F9",
                    opacity: activeFilters.education === "Graduate" ? 1 : 0.8,
                  }}
                  onPress={() => {
                    handlefilter("education", "Graduate")
                    setShowFilters(false)
                  }}
                >
                  <View className={`w-4 h-4 rounded-full border border-[#0784C9] justify-center items-center ${activeFilters.education === "Graduate" ? 'bg-[#0784C9]' : 'bg-transparent'}`} />
                  <Text style={{ color: "#003B70" }}>Graduation</Text>
                </Pressable>
                <Pressable
                  className="flex-row items-center gap-3 p-2 rounded transition-opacity"
                  style={{
                    backgroundColor: "#DFF3F9",
                    opacity: activeFilters.education === "post Graduate" ? 1 : 0.8,
                  }}
                  onPress={() => {
                    handlefilter("education", "post Graduate")
                    setShowFilters(false)
                  }}
                >
                  <View className={`w-4 h-4 rounded-full border border-[#0784C9] justify-center items-center ${activeFilters.education === "post Graduate" ? 'bg-[#0784C9]' : 'bg-transparent'}`} />
                  <Text style={{ color: "#003B70" }}>Post Graduation</Text>
                </Pressable>
              </View>
            )}

            <Pressable className="flex flex-row gap-4 items-center" onPress={() => setAppliedInOpen("gender")}>
              <Text style={{ color: "#003B70", fontWeight: "bold", fontSize: 18 }}>Gender</Text>
              {appliedInOpen === "gender" ? <ChevronUp size={20} color={"#003B70"} onPress={()=> setAppliedInOpen("")} />: <ChevronDown size={20} color={"#003B70"} />}
            </Pressable>
            {(appliedInOpen === "gender") && (
              <View className="ml-4 mt-2 space-y-2">
                <Pressable
                  className="flex-row items-center gap-3 p-2 rounded transition-opacity"
                  style={{
                    backgroundColor: "#DFF3F9",
                    opacity: activeFilters.gender === "Male" ? 1 : 0.8,
                  }}
                  onPress={() => {
                    handlefilter("gender", "Male")
                    setShowFilters(false)
                  }}
                >
                  <View className={`w-4 h-4 rounded-full border border-[#0784C9] justify-center items-center ${activeFilters.gender === "Male" ? 'bg-[#0784C9]' : 'bg-transparent'}`} />
                  <Text style={{ color: "#003B70" }}>Male</Text>
                </Pressable>
                <Pressable
                  className="flex-row items-center gap-3 p-2 rounded transition-opacity"
                  style={{
                    backgroundColor: "#DFF3F9",
                    opacity: activeFilters.gender === "Female" ? 1 : 0.8,
                  }}
                  onPress={() => {
                    handlefilter("gender", "Female")
                    setShowFilters(false)
                  }}
                >
                  <View className={`w-4 h-4 rounded-full border border-[#0784C9] justify-center items-center ${activeFilters.gender === "Female" ? 'bg-[#0784C9]' : 'bg-transparent'}`} />
                  <Text style={{ color: "#003B70" }}>Female</Text>
                </Pressable>
                <Pressable
                  className="flex-row items-center gap-3 p-2 rounded transition-opacity"
                  style={{
                    backgroundColor: "#DFF3F9",
                    opacity: activeFilters.gender === "Other" ? 1 : 0.8,
                  }}
                  onPress={() => {
                    handlefilter("gender", "Other")
                    setShowFilters(false)
                  }}
                >
                  <View className={`w-4 h-4 rounded-full border border-[#0784C9] justify-center items-center ${activeFilters.gender === "Other" ? 'bg-[#0784C9]' : 'bg-transparent'}`} />
                  <Text style={{ color: "#003B70" }}>Other</Text>
                </Pressable>
              </View>
            )}
            </View>
          </ScrollView>
        </View>}

        {!showFilters && 
        <>
        
        <View className="flex flex-row gap-1 bg-white  items-center pl-2">

          <View className="flex justify-start items-center bg-white border rounded-lg w-[24vw]  shadow-lg">
            <Picker
              selectedValue={pageContent}
              itemStyle={{ backgroundColor: "black", borderRadius: 20 }}
              style={{ borderRadius: 20, width: 90, height: 50}}
              onValueChange={(itemValue, itemIndex) =>
                setPageContent(itemValue)
              }>
              <Picker.Item label="20" value={20} />
              <Picker.Item label="40" value={40} />
              <Picker.Item label="60" value={60} />
              <Picker.Item label="80" value={80} />
            </Picker>

          </View>

          <View className="bg-white w-full h-[50] flex flex-row">

            {Array.from({ length: totalPages || 0 }, (_, index) => {
              if(page === index +1){

                return (
                  <View key={index} className="flex flex-row gap-1">
                  {index > 0 &&
                  <>
                  
                   <TouchableOpacity
                    
                    onPress={() => setPage((prev)=> prev-1)}
                    className="flex justify-center items-center m-1 rounded-lg  "
  
                  >
                    <ChevronLeft size={14} color={"#0784c9"}/>
                  </TouchableOpacity>
                   <TouchableOpacity
                    
                    onPress={() => setPage(index)}
                    className="flex justify-center items-center m-1 rounded-lg px-4 border border-[#0784c9]"
  
                  >
                    <Text className="text-[#0784c9]">{index }</Text>
                  </TouchableOpacity>
                  </>
                  }
  
                   <TouchableOpacity
                    key={index}
                    onPress={() => setPage(index + 1)}
                    className={`flex justify-center items-center m-1 rounded-lg px-4 ${page === index + 1 ? "bg-[#0784c9]" : "border border-[#0784c9]"}`}
  
                  >
                    <Text className={`${page === index + 1 ? "text-white" : "text-[#0784c9]"}`}>{index + 1}</Text>
                  </TouchableOpacity>
  
                  {index+2 <= totalPages && <TouchableOpacity
                    
                    onPress={() => setPage(index + 2)}
                    className="flex justify-center items-center m-1 rounded-lg px-4 border border-[#0784c9]"
  
                  >
                    <Text className="text-[#0784c9]">{index +2 }</Text>
                  </TouchableOpacity>}

                 
                  {index+2 < totalPages && 
                  <>
                   <Text className="self-end flex text-[#0784c9]">...</Text>
                  <TouchableOpacity
                    
                    onPress={() => setPage(totalPages)}
                    className="flex justify-center items-center m-1 rounded-lg px-4 border border-[#0784c9]"
  
                  >
                    <Text className="text-[#0784c9]">{totalPages }</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    
                    onPress={() => setPage((prev)=> prev+1)}
                    className="flex justify-center items-center m-1 rounded-lg "
  
                  >
                    <ChevronRight size={14} color= {"#0784c9"} />
                  </TouchableOpacity>
                  </>
                  }
                  </View>
                )
              }

            })}
          </View>
        </View>


        <ScrollView className="flex-1 md:w-3/4 p-4">
          <Text
            className="text-lg font-semibold mb-4"
            style={{ color: "#003B70" }}
          >
            Showing {candidatess?.length || 0} candidates
          </Text>

          {candidatess && candidatess?.length > 0 ? (
            candidatess?.map((candidate, index) => (


              <CandidateCard key={index} candidate={candidate} />

            ))
          ) : (
            <View
              className="p-10 text-center rounded-lg shadow-lg border"
              style={{
                backgroundColor: "white",
                borderColor: "#0784C9",
              }}
            >
              <View
                className="mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "#DEF3F9",
                  width: 80,
                  height: 80,
                }}
              >
                <Ionicons name="person-circle-outline" size={40} color="#0784C9" />
              </View>
              <Text
                className="text-lg font-semibold mb-2"
                style={{ color: "#003B70" }}
              >
                No Candidates Found
              </Text>
              <Text className="text-sm mb-4" style={{ color: "#0784C9" }}>
                No candidates match your current filter criteria. Try adjusting
                your filters or check back later for new applications.
              </Text>
              <Pressable
                onPress={handleClearFilters}
                className="px-6 py-2 rounded-full font-medium transition-all"
                style={{
                  backgroundColor: "#0784C9",
                  color: "white",
                  borderColor: "transparent",
                }}
              >
                <Text className="text-white text-base">Clear All Filters</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
        </>
        }
      </View>
    );
  } else {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "position"}
        className="flex-1 px-4   "
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : -150}
        style={{ backgroundColor: "#DEF3F9" }}
      >
        <ScrollView className="max-w-l mb-[80] mx-auto flex-1">
        

          {/* Main Form Container */}
          <View className="bg-white rounded-lg shadow p-5 flex-1">
            <Controller
              control={control}
              name="experience"
             
              rules={{ required: "Choose one option." }}
              render={({ field: { onChange, value } }) => (
                <View style={{ marginBottom: 10 }}>
                  <Text
                    className="text-sm font-semibold mb-3"
                    style={{ color: "#003B70" }}
                  >
                    Searching for
                  </Text>
                  <View className="flex-row items-center">
                    <RadioButton
                      label="Freshers only"
                      value="fresher"
                      selected={value === "fresher"}
                      onSelect={onChange}
                    />
                    <RadioButton
                      label="Experienced only"
                      value="Experienced"
                      selected={value === "Experienced"}
                      onSelect={onChange}
                    />
                    <RadioButton
                      label="Any"
                      value="Any"
                      selected={value === "Any"}
                      onSelect={onChange}
                    />
                  </View>
                </View>
              )}
            />

            <View style={{ marginBottom: 20 }}>
              <Text
                className="text-sm font-semibold mb-3"
                style={{ color: "#003B70" }}
              >
                Keywords
              </Text>
              <Controller
                control={control}
                name="jobTitle"
               
                // rules={{ required: "Job Title/Job Role is required." }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    placeholder="Enter JobTitle/JobRole"
                    className="bg-white rounded-lg p-3 border border-[#0784C9]"
                    style={{ fontSize: 12 }}
                    value={value || ""}
                    onChangeText={onChange}
                  />
                )}
              />
              {/* {errors.jobTitle && (
    <Text style={{ color: "red", fontSize: 12 }}>
      {errors.jobTitle.message}
    </Text>
  )} */}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text
                className="text-sm font-semibold mb-3"
                style={{ color: "#003B70" }}
              >
                Current City/Region
              </Text>
              <Controller
                control={control}
                name="location"
          
                // rules={{ required: "Location is required." }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    placeholder="Enter city or region"
                    className="bg-white rounded-lg p-3 border border-[#0784C9]"
                    style={{ fontSize: 12 }}
                    value={value || ""}
                    onChangeText={onChange}
                  />
                )}
              />
              {/* {errors.location && (
    <Text style={{ color: "red", fontSize: 12 }}>
      {errors.location.message}
    </Text>
  )} */}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text
                className="text-sm font-semibold mb-3"
                style={{ color: "#003B70" }}
              >
                Experience Range (Years)
              </Text>
              <View className="flex-row gap-3">
                <Controller
                  control={control}
                  name="minExperience"
            
                  // rules={{ required: "Minimum Experience  is required." }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="Min"
                      className="bg-white rounded-lg p-3 border border-[#0784C9]"
                      style={{ fontSize: 12 }}
                      value={value || ""}
                      onChangeText={onChange}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="maxExperience"
  
                  // rules={{ required: "Maximum  Experience is required." }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="max"
                      className="bg-white rounded-lg p-3 border border-[#0784C9]"
                      style={{ fontSize: 12 }}
                      value={value || ""}
                      onChangeText={onChange}
                    />
                  )}
                />
              </View>
              {/* {errors.minExperience && (
    <Text style={{ color: "red", fontSize: 12 }}>
      {errors.minExperience.message}
    </Text>
    
  )}
  {errors.maxExperience && (
    <Text style={{ color: "red", fontSize: 12 }}>
      {errors.maxExperience.message}
    </Text>
  )} */}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text
                className="text-sm font-semibold mb-3"
                style={{ color: "#003B70" }}
              >
                Monthly Salary Range
              </Text>
              <View className="flex-row gap-3">
                <Controller
                  control={control}
                  name="minimumSalary"
       
                  // rules={{ required: "Minimum Salary is required." }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="Minimum"
                      className="bg-white rounded-lg p-3 border border-[#0784C9]"
                      style={{ fontSize: 12 }}
                      value={value || ""}
                      onChangeText={onChange}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="maximumSalary"
         
                  // rules={{ required: "Maximum Salary is required." }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="Maximum"
                      className="bg-white rounded-lg p-3 border border-[#0784C9]"
                      style={{ fontSize: 12 }}
                      value={value || ""}
                      onChangeText={onChange}
                    />
                  )}
                />
              </View>
               {/* {errors.minimumSalary && (
    <Text style={{ color: "red", fontSize: 12 }}>
      {errors.minimumSalary.message}
    </Text>
    
  )} */}
  {/* {errors.maximumSalary && (
    <Text style={{ color: "red", fontSize: 12 }}>
      {errors.maximumSalary.message}
    </Text>
  )} */}
            </View>

            <Controller
              control={control}
              name="education"
         
              // rules={{ required: "Education is required." }}
              render={({ field: { onChange, value } }) => (
                <View style={{ marginBottom: 20 }}>
                  <Text
                    className="text-sm font-semibold mb-3"
                    style={{ color: "#003B70" }}
                  >
                    Minimum Education
                  </Text>
                  <View className="flex-wrap flex-row justify-between">
                    {[
                      "10th pass",
                      "12th pass",
                      "ITI",
                      "Diploma",
                      "Graduate",
                      "Post Graduate",
                    ].map((edu) => (
                      <RadioButton
                        key={edu}
                        label={edu}
                        value={edu || ""}
                        selected={value === edu}
                        onSelect={onChange}
                      />
                    ))}
                  </View>
                </View>
              )}
            />

            {/* Action Buttons */}
            <View className="flex-row gap-4 justify-center pt-5 border-t border-[#0784C9] mt-auto">
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                className="bg-[#0784C9] px-6 py-3 rounded-md min-w-[150px] items-center"
              >
                <Text className="text-white font-semibold text-sm">
                  Search Candidates
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  reset(); // Clears form fields
                  setShowSearched(false); // Hides the results screen
                }}
                className="bg-white px-6 py-3 rounded-md border border-[#0784C9] min-w-[150px] items-center"
              >
                <Text className="text-[#0784C9] font-semibold text-sm">
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}
