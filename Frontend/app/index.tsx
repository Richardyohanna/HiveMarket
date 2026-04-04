import React, { useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import RoleScreen from './CreateAccount/RoleScreen';

const Index = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
     // router.replace('/(OnboardingScreen)/OnboardScreen');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  //<SplashScreen />

  return (
    <View style={{ flex: 1 }}>
      <StatusBar hidden translucent />
      <RoleScreen />
    </View>
  );
};

export default Index;