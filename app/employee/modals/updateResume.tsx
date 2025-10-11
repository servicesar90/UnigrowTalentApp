import React, { useEffect, useState } from "react";
import { View, Text, Modal, Image, TouchableOpacity } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "@/app/Redux/getData";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UpdateResume = ({ open, label, onClose, metaData }) => {
  const [file, setFile] = useState<any>(null);
  const [preview, setPreview] = useState(metaData.default);
  const [uploadStatus, setUploadStatus] = useState("");
  const dispatch = useDispatch();

  const handleFileChange = async () => {
    try {
      let result;
      if (label === "Upload Resume") {
        result = await DocumentPicker.getDocumentAsync({
          type: ["application/pdf", "application/msword", "text/plain"],
        });
      } else {
        await ImagePicker.requestMediaLibraryPermissionsAsync();

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images", "videos"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      }

      if (!result.canceled) {
        const selected = result.assets[0];
        const file = {
          uri: selected.uri,
          name: selected.fileName,
          type:
            selected.mimeType ||
            (selected.uri.endsWith(".jpg") || selected.uri.endsWith(".jpeg")
              ? "image/jpeg"
              : selected.uri.endsWith(".png")
                ? "image/png"
                : "application/octet-stream"),
        };

        setFile(file);
        setPreview(selected.uri);
      }
    } catch (error) {
      console.log("File picking error:", error);
    }
  };

  const callApi = async (file, field, api) => {
    const data = new FormData();

    data.append(field, {
      uri: file.uri,
      name: file.name || "upload.jpg",
      type: file.type || "application/octet-stream",
    });

    const Token = await AsyncStorage.getItem("Token");

    try {
      const response = await fetch(api, {
        method: "POST",
        body: data,
        headers: {
          "content-type": "multipart/form-data",
          Authorization: `Bearer ${Token}`,
        },
      });

      if (response) {
        setUploadStatus("✅ Successfully Uploaded");
        dispatch(fetchUserProfile());
        onClose();
      } else {
        setUploadStatus("❌ Upload failed, try again");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleSubmit = async () => {
    if (!file) return alert("Please select a file!");
    setUploadStatus("Uploading...");

    await callApi(file, metaData.field, metaData.Api);
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white p-6 rounded-2xl w-80 items-center">
          <Text className="text-lg font-semibold mb-3">{label}</Text>

          {preview && label !== "Upload Resume" ? (
            <Image
              source={{ uri: preview }}
              className="w-32 h-32 rounded-full mb-4"
            />
          ) : label === "Upload Resume" && file ? (
            <Text className="text-red-500">No Preview Available...</Text>
          ) : null}

          <TouchableOpacity
            onPress={handleFileChange}
            className="bg-blue-600 px-4 py-2 rounded-xl w-full my-2"
          >
            <Text className="text-white text-center font-medium">
              Choose File
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-green-600 px-4 py-2 rounded-xl w-full my-2"
          >
            <Text className="text-white text-center font-medium">Submit</Text>
          </TouchableOpacity>

          {uploadStatus ? (
            <Text className="mt-2 text-red-500 text-sm">{uploadStatus}</Text>
          ) : null}

          <TouchableOpacity onPress={onClose} className="mt-3">
            <Text className="text-gray-600">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default UpdateResume;
