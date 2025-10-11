import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { RadioButton, Chip } from "react-native-paper";
import * as Location from "expo-location";
import { useDispatch } from "react-redux";
import { fetchUserProfile } from "@/app/Redux/getData";
import { apiFunction } from "@/app/api/apiFunction";
import Autocomplete from "react-native-autocomplete-input";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import axios from "axios";

const DynamicModal = ({
  open,
  onClose,
  fields,
  label,
  type,
  setInitials,
  suggestions,
  metaData,
}) => {
  const [buttonDisable, setButtonDisable] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const dispatch = useDispatch();
  const [showDate, setShowDate] = useState(null);
  const [showSuggestions, setShowSuggestion] = useState(null);
  const [suggestionss, setSuggestions] = useState([]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: fields,
  });

  const getAddressFromCoords = async (lat, lon) => {

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=28.630858&lon=77.435361`,
        {
          headers: {
            "User-Agent": "unigrowTalentExpo/1.0 (servicesar90@gmail.com)",
          },
        }
      );

      return response.data?.display_name;
    } catch (err) {
      console.log(err)
      return "Unable to fetch address";
    }
  };

  const handleLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Location",
          text2: "Permission denied for Location"
        })
        return null;
      }
      let loc = await Location.getCurrentPositionAsync({});
      if (loc) {
        const response = await getAddressFromCoords(loc.coords.latitude, loc.coords.longitude);
        if (response) {
          return response
        }
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Location",
        text2: "error While Fetching Location"
      })
      return null;
    }
  };

  const onSubmit = async (data) => {
    setButtonDisable(true);

    console.log(metaData.api, metaData.params, data, metaData.type);

    const response = await apiFunction(
      metaData.api,
      metaData.params,
      data,
      metaData.type,
      true
    );

    if (response) {
      console.log(response);
      Toast.show({
        type: "success",
        text1: "Profile",
        text2: "Submitted succesfully"
      })

      dispatch(fetchUserProfile());
      setInitials && setInitials();
      onClose();
    } else {
      Toast.show({
        type: "error",
        text1: "Profile",
        text2: "Could not update"
      })
    }
    setButtonDisable(false);
  };

  // Helpers for chips (multi-select)
  const handleAddChip = (fieldName, value) => {
    const currentValues = watch(fieldName) || [];
    if (!currentValues.includes(value)) {
      setValue(fieldName, [...currentValues, value]);
      setButtonDisable(false);
    }
  };

  const handleRemoveChip = (fieldName, value) => {
    const currentValues = watch(fieldName) || [];
    setValue(
      fieldName,
      currentValues.filter((item) => item !== value)
    );
    setButtonDisable(false);
  };

  const handleAutoCompleteChange = (fieldName, value) => {
    const currentValues = watch(fieldName) || [];
    if (!currentValues.includes(value)) {
      setValue(fieldName, [...currentValues, value]);
      setButtonDisable(false);
    }
  };

  const getSuggestions = async (value, key) => {
    const response = await apiFunction(
      suggestions[key],
      [value],
      null,
      "get",
      true
    );
    if (response) {
      console.log("response", response);
      setSuggestions(response?.data ? response.data : response);
    }
  };

  return (
    <Modal visible={open} animationType="slide" transparent>
      <View className="flex-1 bg-black/30 justify-center items-center">
        <View className="bg-white p-6 rounded-xl w-[90%] max-h-[90%]">
          <Text style={{ color: " #0784c9", fontSize: 30, fontWeight: 400 }}>
            {metaData?.title || "Modal"}
          </Text>

          <ScrollView className="max-h-[400px] p-3">
            {Object.entries(fields).map(([key, value]) => {
              const fieldType = type?.[key] || "text";
              const fieldSuggestions = suggestions?.[key];

              // Radio group
              if (fieldType === "radio" && Array.isArray(fieldSuggestions)) {
                if (key === "qualification") {
                  const qualification = watch(key);
                  if (qualification && metaData?.dynamicChange) {
                    metaData.dynamicChange(qualification);
                  }
                }
                return (
                  <View key={key} className="mb-3 w-[70vw]">
                    <Text className="mb-1 font-semibold text-lg text-[#0784c9]">
                      {label[key]}
                    </Text>
                    <Controller
                      control={control}
                      name={key}
                      defaultValue={value}
                      render={({ field }) => (
                        <RadioButton.Group
                          onValueChange={(val) => {
                            field.onChange(val);
                            setButtonDisable(false);
                          }}
                          value={field.value}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              flexWrap: "wrap",
                              alignItems: "center",
                            }}
                          >
                            {fieldSuggestions.map((option, idx) => {
                              const entry =
                                typeof option === "object"
                                  ? Object.entries(option)[0]
                                  : [option, option];

                              return (
                                <View
                                  key={idx}
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginRight: 16,
                                  }}
                                >
                                  <RadioButton
                                    value={entry[1]}
                                    color="#0784c9"
                                  />
                                  <Text>{entry[0]}</Text>
                                </View>
                              );
                            })}
                          </View>
                        </RadioButton.Group>
                      )}
                    />
                  </View>
                );
              }

              // single select
              if (fieldType === "single" && Array.isArray(fieldSuggestions)) {
                return (
                  <View key={key} className="mb-3">
                    <Text className="mb-1 font-semibold">{label[key]}</Text>

                    <Controller
                      key={key}
                      name={key}
                      control={control}
                      defaultValue={value ?? ""}
                      render={({ field }) => (
                        <View className="bg-white flex flex-col">
                          <TextInput
                            placeholder={`Add ${label[key]}`}
                            value={field.value}
                            onFocus={() => {
                              setShowSuggestion(label[key]);
                            }}
                            className="border border-gray-300 rounded-lg px-4"
                          />

                          {showSuggestions === label[key] && (
                            <ScrollView>
                              {fieldSuggestions?.map((suggest, index) => (
                                <TouchableOpacity
                                  className="flex justify-start w-full items-center px-2"
                                  key={index}
                                  onPress={() => {
                                    field.onChange(suggest);
                                    setShowSuggestion(null);
                                    setButtonDisable(false);
                                  }}
                                >
                                  <Text className="flex p-2 justify-start w-full  items-center">
                                    {suggest}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          )}
                        </View>
                      )}
                    />
                  </View>
                );
              }

              // Multi-select with chips
              if (fieldType === "multi" && !Array.isArray(fieldSuggestions)) {
                const selectedValues = watch(key) || [];
                return (
                  <View key={key} className="mb-3">
                    <Text className="mb-1 font-semibold">{label[key]}</Text>
                    <View className="flex-row flex-wrap gap-2 mb-2">
                      {selectedValues.map((val, idx) => (
                        <Chip
                          key={idx}
                          onClose={() => handleRemoveChip(key, val)}
                          style={{ margin: 2 }}
                        >
                          {val}
                        </Chip>
                      ))}
                    </View>

                    <TextInput
                      placeholder={`Add ${label[key]}`}
                      value={inputValue}
                      onFocus={() => {
                        getSuggestions(metaData.educationvalue, key);
                        setShowSuggestion(label[key]);
                      }}
                      className="border border-gray-300 rounded-lg px-4"
                    />

                    {showSuggestions === label[key] && (
                      <View className="flex flex-col bg-black-500 justify-center shadow-lg items-center max-h-40 overflow-scroll">
                        {suggestionss?.map((suggest, index) => (
                          <TouchableOpacity
                            className="flex justify-start w-full  items-center px-2"
                            key={index}
                            onPress={() => {
                              handleAddChip(key, suggest);
                              setShowSuggestion(null);
                              setButtonDisable(false);
                            }}
                          >
                            <Text className="flex p-2 justify-start w-full  items-center">
                              {suggest}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              }

              if (fieldType === "multi" && Array.isArray(fieldSuggestions)) {
                const selectedValues = watch(key) || [];
                return (
                  <View key={key} className="mb-3">
                    <Text className="mb-1 font-semibold">{label[key]}</Text>
                    <View className="flex-row flex-wrap gap-2 mb-2">
                      {selectedValues.map((val, idx) => (
                        <Chip
                          key={idx}
                          onClose={() => handleRemoveChip(key, val)}
                          style={{ margin: 2 }}
                        >
                          {val}
                        </Chip>
                      ))}
                    </View>

                    <TextInput
                      placeholder={`Add ${label[key]}`}
                      onChangeText={(txt) => setInputValue(txt)}
                      onFocus={() => setShowSuggestion(label[key])}
                      className="border border-gray-300 rounded-lg px-4"
                    />
                    {showSuggestions === label[key] && (
                      <View className="flex flex-col bg-black-500 justify-center shadow-lg items-center max-h-40 overflow-scroll">
                        {fieldSuggestions?.map((suggest, index) => (
                          <TouchableOpacity
                            className="flex justify-start w-full  items-center px-2"
                            key={index}
                            onPress={() => {
                              handleAddChip(key, suggest);
                              setShowSuggestion(null);
                              setButtonDisable(false);
                            }}
                          >
                            <Text className="flex p-2 justify-start w-full  items-center">
                              {suggest}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              }

              if (fieldType === "autocomplete") {
                const selectedValues = watch(key) || [];

                return (
                  <View key={key} className="mb-3">
                    <Text className="mb-1 font-semibold">{label[key]}</Text>

                    {/* Selected Chips */}
                    <View className="flex-row flex-wrap gap-2 mb-2">
                      {selectedValues.map((val, idx) => (
                        <Chip
                          key={idx}
                          onClose={() => handleRemoveChip(key, val)}
                          style={{ margin: 2 }}
                        >
                          {val}
                        </Chip>
                      ))}
                    </View>

                    {/* Autocomplete */}
                    <Autocomplete
                      data={suggestionss?.filter(
                        (item) => !selectedValues.includes(item)
                      )}
                      defaultValue=""
                      onChangeText={(text) => getSuggestions(text, key)}
                      flatListProps={{
                        keyExtractor: (_, i) => i.toString(),
                        renderItem: ({ item }) => (
                          <TouchableOpacity
                            onPress={() => {
                              handleAutoCompleteChange(key, item);
                              setButtonDisable(false);
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
                );
              }

              if (fieldType === "date") {
                return (
                  <Controller
                    key={key}
                    name={key}
                    control={control}
                    defaultValue={value}
                    render={({ field }) => (
                      <View>
                        <TouchableOpacity
                          onPress={() => {
                            setShowDate(key);
                            setButtonDisable(false);
                          }}
                          className="rounded-lg px-2 my-4 py-3 border border-gray-400"
                        >
                          <Text
                            className={`px-2 ${field.value ? "text-black-500" : "text-gray-400"}`}
                          >
                            {field.value ? field.value : label[key]}
                          </Text>
                        </TouchableOpacity>

                        {showDate === key && (
                          <DateTimePicker
                            value={
                              field.value ? new Date(field.value) : new Date()
                            }
                            mode="date"
                            display="spinner"
                            textColor="#0784c9"
                            style={{ backgroundColor: "white" }}
                            onChange={(event, selectedDate) => {
                              if (event.type === "set") {
                                field.onChange(
                                  selectedDate?.toISOString().split("T")[0]
                                );
                              }

                              setShowDate(false);
                            }}
                          />
                        )}
                      </View>
                    )}
                  />
                );
              }

              // Location field
              if (fieldType === "location") {
                return (
                  <Controller
                    key={key}
                    name={key}
                    control={control}
                    defaultValue={value ?? ""}
                    render={({ field }) => (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: "#ccc",
                          borderRadius: 8,
                          marginBottom: 12,
                          backgroundColor: "#fff",
                          paddingHorizontal: 10,
                        }}
                      >
                        <TextInput
                          placeholder={label[key]}
                          value={field.value}
                          onChangeText={(txt) => {
                            field.onChange(txt);
                            setButtonDisable(false);
                          }}
                          style={{
                            flex: 1,
                            paddingVertical: 10,
                            color: "black",
                          }}
                        />

                        <TouchableOpacity
                          onPress={async () => {
                            const loc = await handleLocation();
                            if (loc) {
                              field.onChange(loc);
                              setButtonDisable(false);
                            }
                          }}
                        >
                          <MaterialCommunityIcons
                            name="map-marker"
                            size={22}
                            color="#0784c9"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                );
              }

              // Normal text input
              return (
                <Controller
                  key={key}
                  name={key}
                  control={control}
                  defaultValue={value}
                  render={({ field }) => (
                    <TextInput
                      placeholder={label[key]}
                      value={field.value}
                      onChangeText={(txt) => {
                        field.onChange(txt);
                        setButtonDisable(false);
                      }}
                      className="p-0 m-0 text-black px-2 my-4 py-3 border border-gray-400"
                    />
                  )}
                />
              );
            })}
          </ScrollView>

          <View className="flex-row justify-end gap-2 mt-4">
            <TouchableOpacity
              onPress={onClose}
              className="px-4 py-2 border border-blue-500 rounded-md"
            >
              <Text className="text-blue-500">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={buttonDisable}
              onPress={handleSubmit(onSubmit)}
              className={`px-4 py-2 rounded-md ${buttonDisable ? "bg-gray-400" : "bg-[#0784c9]"
                }`}
            >
              <Text className="text-white">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DynamicModal;
