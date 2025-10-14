
import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useRouter } from 'expo-router';


const { width } = Dimensions.get('window');

const slides = [
  {
    key: 'one',
    title: 'Welcome to UniGrow!',
    text: 'Connecting talent with opportunities effortlessly.',
    image: require('../assets/images/support.png'),
  },
  {
    key: 'two',
    title: 'Smart Matching',
    text: 'Get matched with the best jobs based on your profile.',
    image: require('../assets/images/empathy.png'),
  },
  {
    key: 'three',
    title: 'Real-Time Notifications',
    text: 'Stay updated with job alerts and interview calls.',
    image: require('../assets/images/onBoarding.png'),
  },
];



export default function IntroScreen() {

  const router = useRouter();

  const hasSeen = async()=>{

    const hasSeenIntro = await AsyncStorage.getItem('hasSeenIntro');
    const loggedIn = await AsyncStorage.getItem("User");
    if(hasSeenIntro && loggedIn){
      const user= JSON.parse(loggedIn);
      if(user.role === "employer"){
        if(user.profile){

          router.replace("/employer/tab/(tabs)/Jobs")
        }else{
          router.replace("/employer/createProfile")
        }
      }else{
        if(user.profile){

          router.replace("/employee/tab/(tabs)/home/home")
        }else{
          router.replace("/employer/createProfile")
        }
      }
    }else if(hasSeenIntro && !loggedIn){
      router.replace("/landingpage")
    }
  }


  const onDone = async () => {
    await AsyncStorage.setItem('hasSeenIntro', 'true');
    router.replace('/landingpage');
  };

  const onSkip = async () => {
    await AsyncStorage.setItem('hasSeenIntro', 'true');
    router.replace('/landingpage');
  };

  useEffect(()=>{
    hasSeen()
  }, [])

 

  const renderItem = ({ item }:{item:typeof slides[0]}) => (
    <View className='flex-1 items-center justify-center p-2 bg-white'>
      <Image source={item.image} resizeMode='contain' className='w-[70%] h-[70%] mb-3 ' />
      <Text className='font-lg text-[700] text-[#003b70] mb-1'>{item.title}</Text>
      <Text  className='font-md text-[#0784c9] items-center'>{item.text}</Text>
    </View>
  );

  return (
    <>
      <AppIntroSlider
        data={slides}
        renderItem={renderItem}
        onDone={onDone}
        showSkipButton
        onSkip={onSkip}
        showNextButton
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        renderNextButton={() => <Text style={styles.navButton}>›</Text>}
        renderPrevButton={() => <Text style={styles.navButton}>‹</Text>}
        renderDoneButton={() => <Text style={styles.navButton}>✓</Text>}
        renderSkipButton={() => <Text style={styles.skipButton}>Skip</Text>}
      />
  
    </>
  );
}

const styles = StyleSheet.create({
  
  dot: {
    backgroundColor: '#ccc',
  },
  activeDot: {
    backgroundColor: '#0a84ff',
    width: 24,
  },
  navButton: {
    fontSize: 22,
    color: '#0a84ff',
    paddingHorizontal: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    fontSize: 16,
    color: '#999',
    paddingHorizontal: 16,
  },
});
