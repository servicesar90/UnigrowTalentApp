// app/components/modals/UpdateProfileModal.js
import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";
import { useDispatch } from "react-redux";
import { fetchEmployerProfile } from "../../Redux/getData";
import { updateCompany } from "../../api/apiFunction";

const UpdateProfileModal = ({ open, label, name, value, onClose, onUpdate }) => {
  const [fieldValue, setFieldValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  // Update the local state when the prop changes
  useEffect(() => {
    setFieldValue(value);
  }, [value]);

  const handleSubmit = async () => {
    // This is a placeholder for your API call logic
    // You will need to create an API endpoint that handles patching different fields
    // For example, a PATCH to /api/employer with a body like { "fieldName": "newValue" }
    setIsLoading(true);
    try {
      // Replace with your actual API call
       await updateCompany({ [name]: fieldValue });
     
      
      // Simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      onUpdate(); // Call the callback to trigger a Redux state refresh
      onClose(); // Close the modal
    } catch (error) {
      console.error("Failed to update profile:", error);
      // Handle error, e.g., show an alert
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-6 rounded-lg w-80">
          <Text className="text-xl font-bold mb-4">{label}</Text>
          <TextInput
            className="border border-gray-300 p-2 rounded-md mb-4"
            onChangeText={setFieldValue}
            value={fieldValue}
            placeholder={`Enter ${label}`}
          />
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md ${isLoading ? 'bg-gray-400' : 'bg-[#0784C9]'}`}
          >
            <Text className="text-white text-center font-medium">
              {isLoading ? "Updating..." : "Update"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} className="mt-2">
            <Text className="text-center text-gray-500">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default UpdateProfileModal;