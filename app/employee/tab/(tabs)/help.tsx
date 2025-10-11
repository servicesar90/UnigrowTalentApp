import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import {
  HelpCircle,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I apply for a job?",
      answer:
        "You can apply for jobs by searching for a role on the home page and clicking the 'Apply Now' button on the job details screen. Make sure your profile is complete with all the necessary details before applying.",
    },
    {
      question: "How can I update my profile?",
      answer:
        "Navigate to the 'Profile' section from the main menu to edit your personal information, experience, and educational details. Keeping your profile updated increases your chances of getting noticed by employers.",
    },
    {
      question: "How long does it take to hear back?",
      answer:
        "Response times vary by employer. You can track the status of your application (e.g., Applied, Shortlisted, Rejected) in the 'Applied Jobs' section of the app.",
    },
    {
      question: "Is there a fee to use this service?",
      answer:
        "No, our service is completely free for job seekers. You can apply for as many jobs as you like without any charges.",
    },
  ];

  return (
    <View className="flex-1 bg-[#DEF3F9] p-4">
      {/* Header */}
      <View className="mb-5">
        <Text className="text-2xl font-bold text-[#003B70]">
          Help & Support
        </Text>
      </View>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* FAQ Section with Accordion */}
        <View className="bg-white rounded-xl shadow-lg p-5 mb-5">
          <View className="flex-row items-center mb-2 pb-2 border-b border-gray-200">
            <HelpCircle size={20} color="#0784c9" />
            <Text className="text-lg font-bold text-[#003B70] ml-2">
              Frequently Asked Questions
            </Text>
          </View>
          {faqs.map((faq, index) => (
            <View
              key={index}
              className="border-b border-gray-200 last:border-b-0 py-3"
            >
              <TouchableOpacity
                onPress={() => toggleFaq(index)}
                className="flex-row justify-between items-center"
              >
                <Text className="text-base font-semibold text-[#0784c9] flex-1 pr-2">
                  {faq.question}
                </Text>
                {openFaq === index ? (
                  <ChevronUp size={20} color="#0784c9" />
                ) : (
                  <ChevronDown size={20} color="#0784c9" />
                )}
              </TouchableOpacity>
              {openFaq === index && (
                <Text className="mt-2 text-sm text-gray-700 leading-5">
                  {faq.answer}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Contact Support Section */}
        <View className="bg-white rounded-xl shadow-lg p-5">
          <View className="flex-row items-center mb-2 pb-2 border-b border-gray-200">
            <Mail size={20} color="#0784c9" />
            <Text className="text-lg font-bold text-[#003B70] ml-2">
              Contact Us
            </Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center py-2 border-b border-gray-200"
            onPress={() => Linking.openURL("mailto:info@unigrowtalent.com")}
          >
            <Mail size={16} color="#0784c9" />
            <Text className="text-base text-[#0784c9] ml-2 font-medium">
              info@unigrowtalent.com
            </Text>
            <ExternalLink size={16} color="#0784c9" className="ml-auto" />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center py-2"
            onPress={() => Linking.openURL("tel:+911204178702")}
          >
            <Phone size={16} color="#0784c9" />
            <Text className="text-base text-[#0784c9] ml-2 font-medium">
              +91 1204178702
            </Text>
            <ExternalLink size={16} color="#0784c9" className="ml-auto" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Help;
