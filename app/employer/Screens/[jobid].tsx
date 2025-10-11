import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Users,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  FunnelX,
  X
} from "lucide-react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import SimplePaper from "../Cards/AppCard"; 
import { apiFunction } from "@/app/api/apiFunction";
import { matchesDatabasesApi } from "@/app/api/api";
import { fetchJobsById } from "@/app/Redux/getData";

const CandidateManagementPage = () => {
  const [data, setData] = useState(null);
  const [filterIndex, setFilterIndex] = useState(0);
  const [allCandidates, setAllCandidates] = useState({});
  const dispatch = useDispatch();
  const [showFilters, setShowFilters] = useState(false);
  const [showbutton, setShowButtons] = useState(false);
  const [originalCandidates, setOriginalCandidates] = useState(null);
  const [candidatess, setCandidate] = useState(null);
  const [isFilter, setIsFilter] = useState(false);
  const [matchedDatabases, setMatchedDatabase] = useState(null);
  const [showData, setShowData] = useState("matched");
  const [activeFilters, setActiveFilters] = useState({
    time: null,
    education: null,
    gender: null,
  });
  const { jobid } = useLocalSearchParams();

  const [filterSet, setFilterSet] = useState(new Set());

  const { jobsById, loading } = useSelector((state) => state.getDataReducer);

  useEffect(() => {

    console.log("jobbb", jobid)
    if(jobid){

      dispatch(fetchJobsById(jobid));
    }
  }, [dispatch, jobid]);


  useEffect(() => {

    if (jobsById) {

      setData(jobsById[0]);
      const jobApps = jobsById[0]?.JobApplications || [];
      const pendingCandidate = jobApps.filter(
        (app: any) => app.status === "Applied"
      );
      const selectedCandidate = jobApps.filter(
        (app: any) => app.status === "Selected"
      );
      const rejectedCandidate = jobApps.filter(
        (app: any) => app.status === "Rejected"
      );

      setAllCandidates({
        0: jobApps,
        1: pendingCandidate,
        3: selectedCandidate,
        4: rejectedCandidate,
      });

      const getMatchedDatabases = async () => {
        const response = await apiFunction(matchesDatabasesApi, [jobid, 'matchedprofiles'], null, "get", true);

        if (response) {

          setMatchedDatabase(response?.EmployeeProfile);
        }
      };

      getMatchedDatabases();
    } else {
      console.log("Couldn't fetch the data");
    }
  }, [jobsById]);

  useEffect(() => {
    let currentCandidates;
    if (showData === "databases") {      
      currentCandidates = matchedDatabases;
    } else {
      currentCandidates = allCandidates?.[filterIndex];
    }

    if (!currentCandidates || !jobsById) return;

    const newCandidate = (currentCandidates).map((candidate:any) => {
      
      if (!candidate) return candidate;

      let matchedCount = 0;
      const newMatchedFields = [];
      const profile = candidate?.EmployeeProfile
        ? candidate?.EmployeeProfile
        : candidate;

      // Gender match
      if (jobsById[0]?.gender) {
        if (
          jobsById[0]?.gender.toUpperCase() === profile?.gender?.toUpperCase()
        ) {
          matchedCount++;
          newMatchedFields.push("Gender");
        }
      } else {
        matchedCount++;
      }

      // Education match
      const educations = profile?.EmployeeEducations;
      const highestEducation =
        Array.isArray(educations) && educations.length > 0
          ? educations.reduce((latest, current) => {
            const latestDate = new Date(latest.startDate);
            const currentDate = new Date(current.startDate);
            return currentDate > latestDate ? current : latest;
          })
          : null;

      if (jobsById[0]?.education === highestEducation?.qualification) {
        matchedCount++;
        newMatchedFields.push("Education");
      }

      // Language match (partial)
      if (jobsById[0]?.languages) {
        const totalLanguages = Array.isArray(jobsById[0]?.languages)
          ? jobsById[0]?.languages
          : JSON.parse(jobsById[0]?.languages) || "[]";
        const candidateLanguages = Array.isArray(profile?.otherLanguages)
          ? profile?.otherLanguages
          : JSON.parse(profile?.otherLanguages) || "[]";

        const matchLanguageCount = totalLanguages.filter((item) =>
          candidateLanguages.includes(item)
        )?.length;
        const increaseCount = totalLanguages?.length
          ? matchLanguageCount / totalLanguages?.length
          : 0;

        matchedCount += increaseCount;
        newMatchedFields.push(`Languages(${matchLanguageCount})`);
      } else {
        matchedCount++;
      }

      // English level
      if (jobsById[0]?.english === profile?.englishProficiency) {
        matchedCount++;
        newMatchedFields.push("English Level");
      }

      // Location
      const preferredCities =
        (Array.isArray(profile?.preferredJobCity)
          ? profile?.preferredJobCity
          : JSON.parse(profile?.preferredJobCity)) || [];
      if (preferredCities.includes(jobsById[0]?.city)) {
        matchedCount++;
        newMatchedFields.push("Location");
      }

      // Experience match
      const minExperienceLevel =
        Number(jobsById[0]?.experienceLevel?.split("-")[0]) || 0;
      const candidateExpYears = profile?.TotalExperience?.years || 0;

      if (minExperienceLevel === 0 || candidateExpYears >= minExperienceLevel) {
        matchedCount++;
        newMatchedFields.push("Experience");
      }

      // Job Role match
      let candidateJobRoles = [];
      profile?.EmployeeExperiences?.forEach((exp) => {
        const roles =
          (Array.isArray(exp?.jobRole)
            ? exp?.jobRole
            : JSON.parse(exp?.jobRole)) || [];
        candidateJobRoles.push(...roles);
      });

      if (candidateJobRoles.includes(jobsById[0]?.jobRoles)) {
        matchedCount++;
        newMatchedFields.push("Job Role");
      }

      // Job Type
      const preferredTypes = JSON.parse(
        profile?.prefferedEmploymentTypes || "[]"
      );
      if (
        jobsById[0]?.jobType &&
        preferredTypes.includes(jobsById[0]?.jobType.replace(/-/g, " "))
      ) {
        matchedCount++;
        newMatchedFields.push("Job Type");
      }

      // Job Location Type
      const preferredLocationTypes =
        (Array.isArray(profile?.preferredLocationTypes)
          ? profile?.preferredLocationTypes
          : JSON.parse(profile?.preferredLocationTypes)) || [];
      if (preferredLocationTypes.includes(jobsById[0]?.workLocationType)) {
        matchedCount++;
        newMatchedFields.push("Job Location Type");
      }

      // Skills (partial match)
      if (jobsById[0].skills) {
        const totalSkills = Array.isArray(jobsById[0]?.skills)
          ? jobsById[0]?.skills
          : JSON.parse(jobsById[0]?.skills) || "[]";
        const candidateSkills =
          (Array.isArray(profile?.skills)
            ? profile?.skills
            : JSON.parse(profile?.skills)) || [];

        const matchSkillsCount = totalSkills.filter((skill) =>
          candidateSkills.includes(skill)
        )?.length;
        const increaseCount = totalSkills?.length
          ? matchSkillsCount / totalSkills?.length
          : 0;

        matchedCount += increaseCount;
        newMatchedFields.push(`Skills(${matchSkillsCount})`);
      } else {
        matchedCount++;
      }

      // Final matching percentage out of 10 total slots
      const matchPercentage = Math.round((matchedCount / 10) * 100);

      console.log(matchPercentage, newMatchedFields);

      return {
        ...candidate,
        matchedField: newMatchedFields,
        matchingPrecent: matchPercentage,
      };
    });
    console.log("check",newCandidate?.length);

    if (showData == "databases") {
      setMatchedDatabase(newCandidate); 
    } else {
      setOriginalCandidates(newCandidate);
    }

    setCandidate(newCandidate);
  }, [allCandidates, filterIndex, jobsById, showData]);

  const filters = [
    { label: "Matched to job requirements" },
    { label: "Have Resume Attached" },
  ];

  const filterFunctions = {
    "Matched to job requirements": (list) =>
      [...list].sort((a, b) => b.matchingPrecent - a.matchingPrecent),
    "Have Resume Attached": (list) =>
      list.filter((item) => item.EmployeeProfile.resumeURL !== null),
  };

  const applyFilters = (filtersSet) => {
    let updatedList = [...originalCandidates];

    filtersSet.forEach((label) => {
      const filterFunc = filterFunctions[label];
      if (filterFunc) {
        updatedList = filterFunc(updatedList);
      }
    });

    setCandidate(updatedList);
  };

  const handlefilter = (type, value) => {
    console.log("handle filetr",value,originalCandidates?.length,candidatess?.length);
    
    const updatedFilters = {
      ...activeFilters,
      [type]: value,
    };
    setActiveFilters(updatedFilters);
    setIsFilter(true);

    let filtered = [...originalCandidates];

    // Apply gender filter
    if (updatedFilters.gender) {
      filtered = filtered.filter((candidate) => {
        return candidate?.EmployeeProfile?.gender === updatedFilters.gender;
      });
    }

    // Apply education filter
    if (updatedFilters.education) {
      filtered = filtered.filter((candidate) => {
        const educations = candidate?.EmployeeProfile?.EmployeeEducations;

        const highestEducation =
          Array.isArray(educations) && educations?.length > 0
            ? educations.reduce((latest, current) => {
              const latestDate = new Date(latest.startDate);
              const currentDate = new Date(current.startDate);
              return currentDate > latestDate ? current : latest;
            })
            : null;

        const qualification = highestEducation?.qualification;

        console.log(qualification);

        switch (updatedFilters.education) {
          case "10th pass":
            return true;
          case "12th pass":
            return qualification !== "10th_or_Below_10th";
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

    // Apply time filter
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
        const appliedAt = item?.appliedAt ? new Date(item.appliedAt) : null;
        return appliedAt && appliedAt >= compareDate;
      });
    }

    setCandidate(filtered);
  };

  // console.log("chgfdsh", candidatess.length );
  

  if (loading)
    return (
      <View
        className="flex-1 justify-center items-center w-full min-h-screen"
        style={{ backgroundColor: "#DFF3F9" }}
      >
        {/* <Image
          source={require("../../../assets/images/unigrowLogo.png")} // Use require for local assets
          className="w-40 h-16 animate-pulse" // Use a pulse animation instead of heartbeat
          resizeMode="contain"
        /> */}
      </View>
    );

  return (
    <View className="flex-1 bg-[#DFF3F9] min-h-screen mt-8">
      <View
        className="flex-row items-center justify-between pl-2 pr-6 py-3 border-b border-t"
        style={{
          backgroundColor: "#003B70",
          borderColor: "#0784C9",
        }}
      >
        {/* Left Side */}
        <View className="flex-row items-center space-x-1">
          <ChevronLeft
            className="cursor-pointer w-5 h-5"
            style={{ color: "#DFF3F9" }}
            onPress={() => router.push("/employer/tab/Jobs")}
          />
          <View className="flex-row gap-2 items-center">
            <View className="flex flex-col md:flex-row">
              <Text
                className="text-base font-semibold"
                style={{ color: "#DFF3F9" }}
              >
                {data?.jobTitle}
              </Text>
              <View
                className="ml-2 px-2 py-0.5 text-xs rounded font-medium"
                style={{
                  backgroundColor: "#0784C9",
                  color: "#DFF3F9",
                }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: "#DFF3F9" }}
                >
                  {data?.status === "P"
                    ? "Pending"
                    : data?.status === "A"
                      ? "Active"
                      : "Expired"}
                </Text>
              </View>
            </View>

            <Text
              className="text-base font-semibold px-3 border-l border-r"
              style={{
                color: "#DFF3F9",
                borderColor: "#0784C9",
              }}
            >
              {data?.location}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Text
              className="ml-2 text-base font-semibold"
              style={{ color: "#DFF3F9" }}
            >
              Current: {data?.JobApplications?.length}
            </Text>

            <TouchableOpacity
              className="ml-2 text-sm font-medium border rounded px-2 py-1"
              style={{
                color: "#DFF3F9",
                backgroundColor: "#0784C9",
                borderColor: "#DFF3F9",
              }}
              onPress={() => router.push({
                      pathname: "/employer/Screens/jobPost/[action]/[id]",
                      params: { action: "Edit", id: data?.id }  
                    })}
            >
              <Text className="text-sm font-medium" style={{ color: "#DFF3F9" }}>Edit Job</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Top Summary Box */}
      {showData === "matched" && <View
        className="shadow-sm rounded-lg p-4 mx-4 mt-4 border"
        style={{
          backgroundColor: "white",
          borderColor: "#0784C9",
        }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <Users className="w-5 h-5" style={{ color: "#0784C9" }} />
            <Text className="text-base font-semibold" style={{ color: "#003B70" }}>
              Applied to job ({data?.JobApplications?.length})
            </Text>
            {showbutton ? (
              <ChevronUp
                className="w-5 h-5"
                style={{ color: "#0784C9" }}
                onPress={() => setShowButtons(!showbutton)}
              />
            ) : (
              <ChevronDown
                className="w-5 h-5"
                style={{ color: "#0784C9" }}
                onPress={() => setShowButtons(!showbutton)}
              />
            )}
          </View>
        </View>

        {/* Tabs */}
        {showbutton && (
          <View className="flex-row flex-wrap gap-3">
            {[
              `All candidates (${allCandidates[0]?.length})`,
              `Action Pending (${allCandidates[1]?.length})`,
              `Downloaded/Viewed Number`,
              `Shortlisted (${allCandidates[3]?.length})`,
              `Rejected (${allCandidates[4]?.length})`,
            ].map((tab, idx) => (
              <TouchableOpacity
                key={idx}
                className={`border rounded px-2 py-1 ${idx === filterIndex ? "bg-[#0784C9]" : "bg-white"
                  }`}
                style={{ borderColor: "#0784C9" }}
                onPress={() => setFilterIndex(idx)}
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: idx === filterIndex ? "#DFF3F9" : "#003B70" }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>}

      {/* bottom section */}
      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 50, marginBottom: 20 }}
      >
        <View className="flex-1 flex-col md:flex-row relative mb-50">
          {/* Mobile Filter Button */}
          {/* <View className="md:hidden flex-row justify-center mb-2">
            <TouchableOpacity
              className="border px-4 py-1 rounded"
              style={{
                color: "#DFF3F9",
                backgroundColor: "#0784C9",
                borderColor: "#003B70",
              }}
              onPress={() => setShowFilters(true)}
            >
              <Text className="text-sm font-medium" style={{ color: "#DFF3F9" }}>Show Filters</Text>
            </TouchableOpacity>
          </View> */}

          {/* Left Filters - Drawer on mobile, visible on md+ */}
          {showFilters && (
            <View
              className="absolute top-0 left-0 w-full h-[76vh] z-50 shadow-xl p-4 rounded-2xl overflow-hidden"
              style={{ backgroundColor: "white" }}
            >
              <View className="flex-row justify-between items-center mb-4 md:hidden">
                <Text className="text-base font-semibold" style={{ color: "#003B70" }}>
                  Filters
                </Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <Text className="text-lg font-bold" style={{ color: "#003B70" }}><X color="#0784c9" /></Text>
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1">
                <View className="flex-row items-center gap-2 font-semibold text-sm mb-2" style={{ color: "#003B70" }}>
                  {isFilter ? (
                    <Ionicons
                      name="filter-outline"
                      onPress={() => {
                        setCandidate(originalCandidates);
                        setIsFilter(false);
                        setActiveFilters({
                          time: null,
                          education: null,
                          gender: null,
                        });
                      }}
                      style={{ color: "#0784C9" }}
                      size={20}
                    />
                  ) : (
                    <Ionicons name="filter-outline" size={20} style={{ color: "#0784C9" }} />
                  )}
                  <Text>Filters</Text>
                </View>

                <View
                  className="rounded-lg border shadow-sm mb-5 p-4 space-y-3"
                  style={{
                    backgroundColor: "white",
                    borderColor: "#0784C9",
                  }}
                >
                  {filters.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      className="flex-row items-center gap-2 p-1 rounded"
                      style={{ color: "#003B70" }}
                      onPress={() => {
                        const newFilters = new Set(filterSet);
                        if (!newFilters.has(item.label)) {
                          newFilters.add(item.label);
                        } else {
                          newFilters.delete(item.label);
                        }
                        setFilterSet(newFilters);
                        applyFilters(newFilters);
                      }}
                    >
                      <View
                        className={`h-4 w-4 rounded border ${filterSet.has(item.label) ? "bg-[#0784C9] border-[#0784C9]" : "bg-white border-gray-400"
                          }`}
                      />
                      <Text className="text-sm">{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View
                  className="rounded-lg border shadow-sm p-4 space-y-2 text-sm"
                  style={{
                    backgroundColor: "white",
                    borderColor: "#0784C9",
                    color: "#003B70",
                  }}
                >
                  <Text className="font-medium" style={{ color: "#003B70" }}>
                    Applied in
                  </Text>
                  <View className="ml-4 mt-2 space-y-1">
                    <TouchableOpacity
                      className="flex-row items-center gap-3 p-1 rounded"
                      style={{ backgroundColor: "#DFF3F9" }}
                      onPress={() => handlefilter("time", "24 hours")}
                    >
                      <View
                        className={`h-4 w-4 rounded-full border ${activeFilters.time === "24 hours" ? "bg-[#0784C9] border-[#0784C9]" : "bg-white border-gray-400"
                          }`}
                      />
                      <Text style={{ color: "#003B70" }}>Last 24 Hours</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-row items-center gap-3 p-1 rounded"
                      style={{ backgroundColor: "#DFF3F9" }}
                      onPress={() => handlefilter("time", "10 days")}
                    >
                      <View
                        className={`h-4 w-4 rounded-full border ${activeFilters.time === "10 days" ? "bg-[#0784C9] border-[#0784C9]" : "bg-white border-gray-400"
                          }`}
                      />
                      <Text style={{ color: "#003B70" }}>Last 10 days</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-row items-center gap-3 p-1 rounded"
                      style={{ backgroundColor: "#DFF3F9" }}
                      onPress={() => handlefilter("time", "30 days")}
                    >
                      <View
                        className={`h-4 w-4 rounded-full border ${activeFilters.time === "30 days" ? "bg-[#0784C9] border-[#0784C9]" : "bg-white border-gray-400"
                          }`}
                      />
                      <Text style={{ color: "#003B70" }}>Last 30 days</Text>
                    </TouchableOpacity>
                  </View>

                  <Text className="font-medium" style={{ color: "#003B70" }}>
                    Education
                  </Text>
                  <View className="ml-4 mt-2 space-y-1">
                    <TouchableOpacity
                      className="flex-row items-center gap-3 p-1 rounded"
                      style={{ backgroundColor: "#DFF3F9" }}
                      onPress={() => handlefilter("education", "10th pass")}
                    >
                      <View
                        className={`h-4 w-4 rounded-full border ${activeFilters.education === "10th pass" ? "bg-[#0784C9] border-[#0784C9]" : "bg-white border-gray-400"
                          }`}
                      />
                      <Text style={{ color: "#003B70" }}>10th pass</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-row items-center gap-3 p-1 rounded"
                      style={{ backgroundColor: "#DFF3F9" }}
                      onPress={() => handlefilter("education", "12th pass")}
                    >
                      <View
                        className={`h-4 w-4 rounded-full border ${activeFilters.education === "12th pass" ? "bg-[#0784C9] border-[#0784C9]" : "bg-white border-gray-400"
                          }`}
                      />
                      <Text style={{ color: "#003B70" }}>12th Pass</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-row items-center gap-3 p-1 rounded"
                      style={{ backgroundColor: "#DFF3F9" }}
                      onPress={() => handlefilter("education", "ITI")}
                    >
                      <View
                        className={`h-4 w-4 rounded-full border ${activeFilters.education === "ITI" ? "bg-[#0784C9] border-[#0784C9]" : "bg-white border-gray-400"
                          }`}
                      />
                      <Text style={{ color: "#003B70" }}>ITI</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-row items-center gap-3 p-1 rounded"
                      style={{ backgroundColor: "#DFF3F9" }}
                      onPress={() => handlefilter("education", "Graduate")}
                    >
                      <View
                        className={`h-4 w-4 rounded-full border ${activeFilters.education === "Graduate" ? "bg-[#0784C9] border-[#0784C9]" : "bg-white border-gray-400"
                          }`}
                      />
                      <Text style={{ color: "#003B70" }}>Graduation</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-row items-center gap-3 p-1 rounded"
                      style={{ backgroundColor: "#DFF3F9" }}
                      onPress={() => handlefilter("education", "post Graduate")}
                    >
                      <View
                        className={`h-4 w-4 rounded-full border ${activeFilters.education === "post Graduate" ? "bg-[#0784C9] border-[#0784C9]" : "bg-white border-gray-400"
                          }`}
                      />
                      <Text style={{ color: "#003B70" }}>Post Graduation</Text>
                    </TouchableOpacity>
                  </View>

                  <Text className="font-medium" style={{ color: "#003B70" }}>
                    Gender
                  </Text>
                  <View className="ml-4 mt-2 space-y-1">
                    <TouchableOpacity
                      className="flex-row items-center gap-3 p-1 rounded"
                      style={{ backgroundColor: "#DFF3F9" }}
                      onPress={() => handlefilter("gender", "Male")}
                    >
                      <View
                        className={`h-4 w-4 rounded-full border ${activeFilters.gender === "Male" ? "bg-[#0784C9] border-[#0784C9]" : "bg-white border-gray-400"
                          }`}
                      />
                      <Text style={{ color: "#003B70" }}>Male</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-row items-center gap-3 p-1 rounded"
                      style={{ backgroundColor: "#DFF3F9" }}
                      onPress={() => handlefilter("gender", "female")}
                    >
                      <View
                        className={`h-4 w-4 rounded-full border ${activeFilters.gender === "female" ? "bg-[#0784C9] border-[#0784C9]" : "bg-white border-gray-400"
                          }`}
                      />
                      <Text style={{ color: "#003B70" }}>Female</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-row items-center gap-3 p-1 rounded"
                      style={{ backgroundColor: "#DFF3F9" }}
                      onPress={() => handlefilter("gender", "Other")}
                    >
                      <View
                        className={`h-4 w-4 rounded-full border ${activeFilters.gender === "Other" ? "bg-[#0784C9] border-[#0784C9]" : "bg-white border-gray-400"
                          }`}
                      />
                      <Text style={{ color: "#003B70" }}>Other</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

            </View>
          )}

          {/* Right: Candidate List */}
          <View className="flex-1">
            <View className="flex-row border border-[#0784C9] rounded overflow-hidden mb-4">
              <TouchableOpacity
                className={`flex-1 p-2 justify-center items-center ${showData === "matched" ? "bg-[#0784C9]" : "bg-white"
                  }`}
                onPress={() => setShowData("matched")}
                style={{ borderRightWidth: 3, borderColor: "#0784C9" }}
              >
                <Text
                  className="font-bold"
                  style={{ color: showData === "matched" ? "white" : "#003B70" }}
                >
                  Applied ({originalCandidates?.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 p-2 justify-center items-center ${showData === "databases" ? "bg-[#0784C9]" : "bg-white"
                  }`}
                onPress={() => setShowData("databases")}
              >
                <Text
                  className="font-bold"
                  style={{ color: showData === "databases" ? "white" : "#003B70" }}
                >
                  Databases ({matchedDatabases?.length < 1 ? 0 : matchedDatabases?.length})
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex flex-row justify-between">

              <Text className="text-base font-semibold mb-7" style={{ color: "#003B70" }}>
                Showing{" "}
                {showData === "matched" ? candidatess?.length : matchedDatabases?.length}{" "}
                candidates
              </Text>
              <View>
                {!showFilters ? (
                  <TouchableOpacity
                    className="px-4 py-1"
                    onPress={() => setShowFilters(true)}
                  >

                    <AntDesign name="filter" color="#003B70" size={24} />
                  </TouchableOpacity>
                ) :
                  (
                    <TouchableOpacity
                      className="px-4 py-1"
                      onPress={() => setShowFilters(false)}
                    >
                      <FunnelX color="#003B70" size={22} />
                    </TouchableOpacity>
                  )}


              </View>
            </View>


            {(showData === "matched" ? candidatess : matchedDatabases)?.map(
              (candidate: any, index: number) => (
                <View
                  key={index}
                  style={{
                    // backgroundColor: "white",
                    // borderColor: "#0784C9",
                  }}
                >
                  <SimplePaper jobId={jobid} candidate={candidate} />
                </View>
              )
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default CandidateManagementPage;