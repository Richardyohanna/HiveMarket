import React, { useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import CreateAccountScreen from './CreateAccount/CreateAccountScreen';
import SplashScreen from './SplashScreen/SplashScreen';
import { Router, router } from 'expo-router';

const Index = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
     router.replace('/(OnboardingScreen)/OnboardScreen');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  //<SplashScreen />

  return (
    <View style={{ flex: 1 }}>
      <StatusBar hidden translucent />
      <SplashScreen />
    </View>
  );
};

export default Index;