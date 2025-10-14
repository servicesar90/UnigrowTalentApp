import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getBill, getInvoiceFunc } from "../../../api/apiFunction";
import { router } from "expo-router";
import { toWords } from "number-to-words";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Toast from "react-native-toast-message";

const BillingPage = () => {
  const [filter, setFilter] = useState("All");
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await getBill();
        if (response?.data?.data) {
          setData(response.data.data);
          setAllData(response.data.data);
        } else {
          // You might want to handle this case, but for now we'll set to an empty array
          setData([]);
          setAllData([]);
        }
      } catch (error) {
        console.error("Error fetching bills:", error); // Use console.error for better debugging
        setData([]);
        setAllData([]);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  // The `applyFilter` function has been corrected to handle potential null or undefined states.
  const applyFilter = (filters) => {
    setFilter(filters);
    const safeAllData = allData || []; // Ensure allData is an array
    if (filters === "All") {
      setData(safeAllData);
    } else {
      const filteredData = safeAllData.filter((el) => el.status?.toLowerCase() === filters.toLowerCase());
      setData(filteredData);
    }
  };

  const generateInvoiceHtml = (invoiceData) => {
    // This function remains unchanged as per your instructions
    const subtotal = invoiceData?.Plan.price;
    const cgst = +(subtotal * 0.09).toFixed(2);
    const sgst = +(subtotal * 0.09).toFixed(2);
    const total = +(subtotal + cgst + sgst).toFixed(2);
    const totalInWords = toWords(Math.floor(total)) + " rupees only";
    const invoiceNumber = `INV/${new Date(invoiceData.created_at).getFullYear()}-${String(invoiceData.id).padStart(5, "0")}`;
    
    return `
      <div style="max-width: 800px; margin: auto; background-color: white; color: black; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #ccc;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #ccc; padding-bottom: 16px;">
          <div>
            <img src="https://unigrowtalent.com/assets/unigrowLogo.svg" alt="Company Logo" style="height: 48px; margin-bottom: 8px;">
            <div style="font-size: 12px; color: #666;">www.unigrowtalent.com</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: bold; color: #333;">INVOICE</div>
            <div style="font-size: 12px;">Invoice No: <strong>${invoiceNumber}</strong></div>
            <div style="font-size: 12px;">Date: <strong>${new Date(invoiceData.created_at).toLocaleDateString()}</strong></div>
          </div>
        </div>
        
        <table style="width: 100%; margin-bottom: 24px; border: 1px solid black; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid black; padding: 8px; text-align: left;">Billed To</th>
              <th style="border: 1px solid black; padding: 8px; text-align: left;">Pay To</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid black; padding: 8px; vertical-align: top;">
                <p>${invoiceData?.Employer?.GstDetail?.tradeNam || "TradeName Not Provided."}</p>
                <p>${invoiceData?.Employer?.GstDetail?.bno || ""}, ${invoiceData?.Employer?.GstDetail?.bnm || ""}, ${invoiceData?.Employer?.GstDetail?.dst || "Details Not Provided."}</p>
                <p>GSTIN: ${invoiceData?.Employer?.GstDetail?.gstin || "Not Provided"}</p>
              </td>
              <td style="border: 1px black; padding: 8px; vertical-align: top;">
                <p>TalentNest People Services PVT. Ltd.</p>
                <p>4F-435A, Crossing Republik, Gautambuddha Nagar</p>
                <p>GSTIN: 09AALCT8284F1ZQ</p>
                <p>Email: info@talennestpeopleservices.com</p>
              </td>
            </tr>
          </tbody>
        </table>
        
        <table style="width: 100%; text-align: left; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid black; padding: 8px; font-size: 12px;">Service</th>
              <th style="border: 1px solid black; padding: 8px; font-size: 12px;">Description</th>
              <th style="border: 1px solid black; padding: 8px; font-size: 12px;">Rate</th>
              <th style="border: 1px solid black; padding: 8px; font-size: 12px;">Qty</th>
              <th style="border: 1px solid black; padding: 8px; font-size: 12px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid black; padding: 8px;">Hot</td>
              <td style="border: 1px solid black; padding: 8px;">${invoiceData?.Plan?.description}</td>
              <td style="border: 1px solid black; padding: 8px;">₹${subtotal.toFixed(2)}</td>
              <td style="border: 1px solid black; padding: 8px;">1</td>
              <td style="border: 1px solid black; padding: 8px;">₹${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="4" style="padding: 8px; text-align: right; font-weight: bold; border: 1px solid black;">Subtotal:</td>
              <td style="border: 1px solid black; padding: 8px;">₹${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="4" style="padding: 8px; text-align: right; font-weight: bold; border: 1px solid black;">CGST @ 9%:</td>
              <td style="border: 1px solid black; padding: 8px;">₹${cgst.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="4" style="padding: 8px; text-align: right; font-weight: bold; border: 1px solid black;">SGST @ 9%:</td>
              <td style="border: 1px solid black; padding: 8px;">₹${sgst.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="4" style="padding: 8px; text-align: right; font-weight: bold; border: 1px solid black;">Total:</td>
              <td style="border: 1px solid black; padding: 8px; font-weight: bold;">₹${total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <p style="margin-bottom: 8px;"><strong>Total (in words):</strong> ${totalInWords}</p>
        
        <div style="margin-top: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 8px;">Terms & Conditions</h3>
          <ul style="font-size: 10px; padding-left: 16px; margin: 0;">
            <li>Please make payments to the account details mentioned below.</li>
            <li>For any queries, contact us at info@talennestpeopleservices.com.</li>
          </ul>
        </div>
        
        <div style="margin-top: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 8px;">Bank Details</h3>
          <p style="font-size: 10px;">
            <strong>Account Name:</strong> TalentNest People Services PVT. Ltd. <br/>
            <strong>Account Number:</strong> XXXXXXXX1234 <br/>
            <strong>IFSC:</strong> ABCD0123456 <br/>
            <strong>Bank:</strong> Axis Bank, Crossing Republik, Ghaziabad
          </p>
        </div>
        
        <div style="border-top: 1px solid #ccc; padding-top: 16px; font-size: 10px; color: #666; margin-top: 32px;">
          <p>NOTE: This is a computer-generated invoice and does not require a physical signature.</p>
          <p style="text-align: center; margin-top: 8px; font-weight: bold;">Thank you for your business! We look forward to serving you again.</p>
        </div>
      </div>
    `;
  };

  const handleDownloadInvoice = async (id) => {
    try {
      const response = await getInvoiceFunc(id);
      if (!response?.data?.data?.[0]) {
        // We'll use a simple alert since we don't have showErrorToast
       Toast.show({
        type: "error",
        text1: "Invoice",
        text2: "could not upload invoice"
      })
        return;
      }
      const data = response.data.data[0];
      const htmlContent = generateInvoiceHtml(data);
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Pdf",
        text2: "Failed to generate Pdf"
      })
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-[#DEF3F9]">
        <ActivityIndicator size="large" color="#0784C9" />
        <Text className="mt-2 text-[#003B70]">Loading bills...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#DEF3F9]">
      <ScrollView contentContainerClassName="flex-grow p-4 mx-auto w-full max-w-2xl">
        <View className="bg-white p-4 rounded-lg shadow-md mb-4">
          <Text className="text-xl font-semibold text-[#003B70] mb-4">
            Billing History
          </Text>

          {/* Filter Tabs */}
          <View className="flex-row flex-wrap gap-2 mb-4">
            {["All", "Success", "Pending", "Failed"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => applyFilter(tab)}
                className={`py-1.5 px-4 rounded-full border ${
                  filter === tab ? "bg-[#0784C9] border-transparent" : "bg-white border-[#0784C9]"
                }`}
              >
                <Text className={`text-xs font-medium ${filter === tab ? "text-white" : "text-[#0784C9]"}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Table (ScrollView for horizontal scrolling) */}
          <ScrollView horizontal>
            <View className="min-w-full">
              {/* Table Header */}
              <View className="flex-row bg-[#DEF3F9] border-t border-b border-[#0784C9]">
                <Text className="text-[#003B70] font-semibold p-3 w-24 text-xs">Date</Text>
                <Text className="text-[#003B70] font-semibold p-3 w-40 text-xs">Plan details</Text>
                <Text className="text-[#003B70] font-semibold p-3 w-24 text-xs">Expires on</Text>
                <Text className="text-[#003B70] font-semibold p-3 w-20 text-xs">Price</Text>
                <Text className="text-[#003B70] font-semibold p-3 w-24 text-xs">Status</Text>
                <Text className="text-[#003B70] font-semibold p-3 w-24 text-xs">Action</Text>
              </View>

              {/* Table Body */}
              {data?.length > 0 ? (
                data.map((entry, index) => (
                  <View
                    key={index}
                    className="flex-row border-b border-[#DEF3F9]"
                  >
                    <Text className="text-[#003B70] p-3 w-24 text-sm">
                      {entry.created_at.split("T")[0]}
                    </Text>
                    <View className="p-3 w-40">
                      <Text className="text-[#0784C9] underline text-sm">
                        {entry.Plan?.job_credits} Jobs
                      </Text>
                      <Text className="text-[#0784C9] underline text-sm">
                        {entry.Plan?.Database_credits} Databases
                      </Text>
                    </View>
                    <Text className="text-[#003B70] p-3 w-24 text-sm">
                      {entry.expired_at.split("T")[0]}
                    </Text>
                    <Text className="text-[#003B70] p-3 w-20 text-sm">
                      {entry.amount_paid}
                    </Text>
                    <View className="p-3 w-24">
                      <Text
                        className={`text-xs font-semibold px-2 py-1 rounded-full text-center ${
                          entry.status === "success" ? "bg-[#DEF3F9] text-[#0784C9]" : "bg-[#DEF3F9] text-[#003B70]"
                        }`}
                      >
                        {entry.status}
                      </Text>
                    </View>
                    <View className="p-3 w-24 items-start">
                      <TouchableOpacity
                        onPress={() => handleDownloadInvoice(entry.id)}
                        className="flex-row items-center mb-1"
                      >
                        <Ionicons name="cloud-download-outline" size={14} color="#0784C9" />
                        <Text className="ml-1 text-[#0784C9] underline text-xs">
                          Invoice
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="flex-row items-center">
                        <Ionicons name="mail-outline" size={14} color="#003B70" />
                        <Text className="ml-1 text-[#003B70] underline text-xs">
                          Contact us
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View className="w-full">
                  <Text className="text-center text-[#0784C9] italic py-6">
                    No records found.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BillingPage;