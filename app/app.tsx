import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import SplashScreen from './SplashScreen/SplashScreen';

const App = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(OnboardingScreen)/OnboardScreen');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar hidden translucent />
      <SplashScreen />
    </View>
  );
};

export default App;