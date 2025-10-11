import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { apiFunction } from "@/app/api/apiFunction";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Chip, RadioButton } from "react-native-paper";
import { getSkillsSuggestionsApi, JobRoleSuggestionsApi } from "@/app/api/api";
import Autocomplete from 'react-native-autocomplete-input';

const industries = [
  "IT Services & Consulting",
  "IT",
  "Education",
  "Healthcare",
  "Finance",
  "Manufacturing",
];
const types = ["Full-time", "Part-time", "Intern", "Contract"];
const noticePeriods = [
  "No notice period",
  "Less than 15 days",
  "1 month",
  "2 months",
  "3 or more months",
];

const EditExperienceModal = ({ data, Open, close, metaData, setInitials }) => {
  const [buttonDisable, setButtonDisable] = useState(true);
  const [showDate, setShowDate] = useState(null);
  const [isCurrent, setIsCurrent] = useState(false);
  const [skillSuggestion, setSkillSuggestion] = useState([]);
  const [RoleSuggestion, setRoleSuggestion] = useState([]);

  const {

    setValue,
    control,
    watch,
    reset,

    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      jobTitle: data?.jobTitle || null,
      jobRole: data?.jobRole
        ? Array.isArray(data?.jobRole)
          ? data?.jobRole
          : JSON.parse(data?.jobRole)
        : [],
      isCurrent: data?.isCurrent || false,
      companyName: data?.companyName || null,
      description: data?.description || null,
      skillsUsed: data?.skillsUsed
        ? Array.isArray(data?.skillsUsed)
          ? data?.skillsUsed
          : JSON.parse(data?.skillsUsed)
        : [],
      employmentType: data?.employmentType || null,
      startDate: data?.startDate || null,
      endDate: data?.endDate || Date.now(),
      industry: data?.industry || null,
      noticePeriod: data?.noticePeriod || null,
    },
  });


  useEffect(() => {
    if (data) {
      reset({
        jobTitle: data?.jobTitle || null,
        jobRole: data?.jobRole
          ? Array.isArray(data?.jobRole)
            ? data?.jobRole
            : JSON.parse(data?.jobRole)
          : [],
        isCurrent: data?.isCurrent || false,
        companyName: data?.companyName || null,
        description: data?.description || null,
        skillsUsed: data?.skillsUsed
          ? Array.isArray(data?.skillsUsed)
            ? data?.skillsUsed
            : JSON.parse(data?.skillsUsed)
          : [],
        employmentType: data?.employmentType || null,
        startDate: data?.startDate || null,
        endDate: data?.endDate || Date.now(),
        industry: data?.industry || null,
        noticePeriod: data?.noticePeriod || null,
      })
    }
  }, [data])

  const noticePeriod = watch("noticePeriod");

  const getSkillsSuggestions = async (val) => {
    const response = await apiFunction(getSkillsSuggestionsApi, [val], null, "get", true);
    if (response) {
      console.log("response", response);
      setSkillSuggestion(response.data)
    }
  }

  const getRoleSuggestions = async (val) => {
    const response = await apiFunction(JobRoleSuggestionsApi, [val], null, "get", true);
    if (response) {
      setRoleSuggestion(response.data)
    }
  }

  const onSubmit = async (formData) => {
    setButtonDisable(true);
    const response = await apiFunction(metaData.api, metaData.params, formData, metaData.type, true);
    if (response) {
      setInitials();
      close();
    } else {
      setButtonDisable(false);
    }
  };

  return (
    <Modal visible={Open} animationType="slide" transparent>
      <View className="flex-1 bg-black/30 justify-center items-center">
        <View className="bg-white p-6 rounded-xl w-[90%] max-h-[90%]">
          <ScrollView>
            <Text className="text-lg font-semibold mb-4">{metaData?.title}</Text>

            {/* Job Title */}
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Job Title
            </Text>
            <Controller
              control={control}
              name="jobTitle"
              render={({ field }) => (
                <TextInput
                  value={field.value}
                  onChangeText={(txt) => {
                    field.onChange(txt);
                    setButtonDisable(false);
                  }}
                  placeholder="Job Title"
                  className="border border-gray-300 rounded-md p-2 mb-3"
                />
              )}
            />

            {/* jobrole */}

            <View className="mb-3">
              <Text className="mb-1 font-semibold">Job Roles</Text>

              <Controller
                name="jobRole"
                control={control}
                render={({ field }) => (
                  <View>
                    <View className="flex-row flex-wrap gap-2 mb-2">
                      {field?.value?.map((val, idx) => (
                        <Chip
                          key={idx}
                          onClose={() => {
                            const remain = field.value.filter((item) => item !== val);
                            field.onChange(remain)
                          }}
                          style={{ margin: 2 }}
                        >
                          {val}
                        </Chip>
                      ))}
                    </View>
                    <Autocomplete
                      data={RoleSuggestion?.filter(
                        (item) => !field?.value?.includes(item)
                      )}
                      defaultValue=""
                      onChangeText={(text) => getRoleSuggestions(text)}
                      flatListProps={{
                        keyExtractor: (_, i) => i.toString(),
                        renderItem: ({ item }) => (
                          <TouchableOpacity
                            onPress={() => {
                              field.onChange([...field.value, item])
                              setButtonDisable(false)
                              setRoleSuggestion([]);

                            }}
                            className="p-2 border-b border-gray-200"
                          >
                            <Text>{item}</Text>
                          </TouchableOpacity>
                        ),
                      }}
                      inputContainerStyle={{
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 8,
                        paddingHorizontal: 8,
                      }}
                      listContainerStyle={{
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 8,
                        marginTop: 2,
                      }}
                    />
                  </View>
                )}

              />

            </View>

            {/* isCurrent */}

            <View>

              <Text>Is This Your Current Company</Text>

              <Controller
                name="isCurrent"
                control={control}
                defaultValue="false" // default should be string
                render={({ field }) => (
                  <RadioButton.Group
                    onValueChange={(val) => {
                      const boolVal = val === "true"; // convert string to boolean
                      field.onChange(boolVal);
                      setButtonDisable(false);
                      setIsCurrent(boolVal);
                    }}
                    value={field.value?.toString()} // ensure string for RadioButton.Group
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}>
                        <RadioButton value="true" />
                        <Text>Yes</Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <RadioButton value="false" />
                        <Text>No</Text>
                      </View>
                    </View>
                  </RadioButton.Group>
                )}
              />

            </View>


            {/* Description */}
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Description
            </Text>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <TextInput
                  value={field.value}
                  onChangeText={(txt) => {
                    field.onChange(txt);
                    setButtonDisable(false);
                  }}
                  placeholder="Describe your work..."
                  multiline
                  numberOfLines={4}
                  className="border border-gray-300 rounded-md p-2 mb-3"
                />
              )}
            />

            {/* Company Name */}
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Company Name
            </Text>
            <Controller
              control={control}
              name="companyName"
              render={({ field }) => (
                <TextInput
                  value={field.value}
                  onChangeText={(txt) => {
                    field.onChange(txt);
                    setButtonDisable(false);
                  }}
                  placeholder="Company Name"
                  className="border border-gray-300 rounded-md p-2 mb-3"
                />
              )}
            />

            {/* Industry */}
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Industry
            </Text>

            <Controller
              name="industry"
              control={control}
              render={({ field }) => (

                <FlatList
                  data={industries}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        field.onChange(item)
                        setButtonDisable(false);
                      }}
                      className={`px-3 py-1 m-1 rounded-md border ${watch("industry") === item
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-300"
                        }`}
                    >
                      <Text
                        className={`text-sm ${watch("industry") === item ? "text-white" : "text-gray-700"
                          }`}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            />

            {/* employement Type */}
            <View>
              <Text>Employement Type</Text>

              <Controller
                name="employmentType"
                control={control}
                render={({ field }) => (
                  <FlatList
                    data={types}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => {
                          field.onChange(item)
                          setButtonDisable(false);
                        }}
                        className={`px-3 py-1 m-1 rounded-md border ${watch("employmentType") === item
                          ? "bg-blue-500 border-blue-500"
                          : "bg-white border-gray-300"
                          }`}
                      >
                        <Text>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />

                )}
              />
            </View>

            {/* skills */}
            <View className="mb-3">
              <Text className="mb-1 font-semibold">Skills</Text>

              <Controller
                name="skillsUsed"
                control={control}
                render={({ field }) => (
                  <View>
                    <View className="flex-row flex-wrap gap-2 mb-2">
                      {field?.value?.map((val, idx) => (
                        <Chip
                          key={idx}
                          onClose={() => {
                            const remain = field.value.filter((item) => item !== val);
                            field.onChange(remain)
                          }}
                          style={{ margin: 2 }}
                        >
                          {val}
                        </Chip>
                      ))}
                    </View>
                    <Autocomplete
                      data={skillSuggestion?.filter(
                        (item) => !field.value.includes(item)
                      )}
                      defaultValue=""
                      onChangeText={(text) => getSkillsSuggestions(text)}
                      flatListProps={{
                        keyExtractor: (_, i) => i.toString(),
                        renderItem: ({ item }) => (
                          <TouchableOpacity
                            onPress={() => {
                              field.onChange([...field.value, item])
                              setButtonDisable(false)
                              setSkillSuggestion([])
                            }}
                            className="p-2 border-b border-gray-200"
                          >
                            <Text>{item}</Text>
                          </TouchableOpacity>
                        ),
                      }}
                      inputContainerStyle={{
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 8,
                        paddingHorizontal: 8,
                      }}
                      listContainerStyle={{
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 8,
                        marginTop: 2,
                      }}
                    />
                  </View>
                )}

              />

            </View>

            {/* Notice Period */}
            <Text className="text-sm font-medium text-gray-700 mt-3 mb-1">
              Notice Period
            </Text>
            <Controller
            name="noticePeriod"
            control={control}
            render={({field})=>(

              <FlatList
                data={noticePeriods}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      field.onChange(item)
                      setButtonDisable(false);
                    }}
                    className={`px-3 py-1 m-1 rounded-md border ${watch("noticePeriod") === item
                      ? "bg-blue-500 border-blue-500"
                      : "bg-white border-gray-300"
                      }`}
                  >
                    <Text
                      className={`text-sm ${watch("noticePeriod") === item ? "text-white" : "text-gray-700"
                        }`}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
            />

            {/* startDate */}
            <Controller

              name="startDate"
              control={control}

              render={({ field }) => (
                <View>

                  <TouchableOpacity


                    onPress={() => {
                      setShowDate("startDate");
                      setButtonDisable(false)
                    }}
                    className="rounded-lg px-2 my-4 py-3 border border-gray-400"
                  ><Text className={`px-2 ${field.value ? "text-black-500" : "text-gray-400"}`}>{field.value ? field.value : "Enter Start Date"}</Text></TouchableOpacity>

                  {showDate === "startDate" && <DateTimePicker
                    value={field.value ? new Date(field.value) : new Date()}
                    mode="date"
                    display="spinner"
                    textColor="#0784c9"
                    style={{ backgroundColor: "white" }}
                    onChange={(event, selectedDate) => {

                      if (event.type === "set") {
                        field.onChange(selectedDate?.toISOString().split("T")[0])

                      }

                      setShowDate(false);

                    }}
                  />}
                </View>
              )}
            />

            {/* End Date */}
            {!isCurrent && <Controller

              name="endDate"
              control={control}

              render={({ field }) => (
                <View>

                  <TouchableOpacity


                    onPress={() => {
                      setShowDate("endDate");
                      setButtonDisable(false)
                    }}
                    className="rounded-lg px-2 my-4 py-3 border border-gray-400"
                  ><Text className={`px-2 ${field.value ? "text-black-500" : "text-gray-400"}`}>{field.value ? field.value : "Enter End Date"}</Text></TouchableOpacity>

                  {showDate === "endDate" && <DateTimePicker
                    value={field.value ? new Date(field.value) : new Date()}
                    mode="date"
                    display="spinner"
                    textColor="#0784c9"
                    style={{ backgroundColor: "white" }}
                    onChange={(event, selectedDate) => {

                      if (event.type === "set") {
                        field.onChange(selectedDate?.toISOString().split("T")[0])

                      }

                      setShowDate(false);

                    }}
                  />}
                </View>
              )}
            />}


            {/* Action Buttons */}
            <View className="flex-row justify-end gap-2 mt-4">
              <TouchableOpacity
                onPress={close}
                className="px-4 py-2 border border-blue-500 rounded-md"
              >
                <Text className="text-blue-500">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={buttonDisable}
                onPress={handleSubmit(onSubmit)}
                className={`px-4 py-2 rounded-md ${buttonDisable ? "bg-gray-400" : "bg-blue-500"
                  }`}
              >
                <Text className="text-white">Save</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default EditExperienceModal;
