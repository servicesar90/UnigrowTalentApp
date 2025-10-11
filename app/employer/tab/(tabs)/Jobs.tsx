import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { jobPostApi } from '../../../api/api';
import { Link, useRouter } from "expo-router";
import { apiFunction } from "../../../api/apiFunction";
import JobCard from '../../Cards/JobCard'

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const res = await apiFunction(jobPostApi, null, null, "get", true);


        if (res && res.data) {
          setJobs(res.data);

        } else {
          console.log('error fetching jobs');
        }
      } catch (error) {
        console.error('An error occurred:', error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);


  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#def3f9]">
        <Text className="text-gray-600 text-base">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#def3f9] p-4 ">
            {jobs.length > 0 ? (
                <>
                    {/* This button will now only be visible when there are jobs */}
                    <TouchableOpacity
                        className="flex p-2 mb-4 rounded-lg justify-center items-center bg-[#0784c9]"
                        onPress={() => router.push({
                            pathname: "/employer/Screens/jobPost/[action]/[id]",
                            params: { action: "new", id: "null" }
                        })}
                    >
                        <Text className="text-white font-bold text-lg">Post a New Job</Text>
                    </TouchableOpacity>

                    <FlatList
                        data={jobs}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <JobCard job={item} />
                        )}
                    />
                </>
            ) : (
                <View className="flex-1 justify-center items-center">
                    <View className="w-full p-6 bg-blue-100 rounded-2xl shadow">
                        <Text className="text-xl font-bold text-blue-800 mb-2">
                            No Jobs Found
                        </Text>
                        <Text className="text-gray-700 mb-4">
                            You haven't posted any jobs yet. Start by posting a new one.
                        </Text>

                        {/* This button remains in the "no jobs found" state */}
                        <TouchableOpacity
                            onPress={() => router.push({
                                pathname: "/employer/Screens/jobPost/[action]/[id]",
                                params: { action: "new", id: "null" }
                            })}
                            className="flex p-2 mb-4 rounded-lg justify-center items-center bg-[#0784c9]"
                        >
                            <Text className="text-white font-bold text-lg">
                                Post a New Job
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
  );
}
