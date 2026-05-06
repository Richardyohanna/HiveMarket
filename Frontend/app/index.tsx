import React from 'react';
import { StatusBar, View } from 'react-native';
import BottomTabNav from './BottomTab/BotttomTabNav';

const Index = () => {
  /*useEffect(() => {
    const timer = setTimeout(() => {
     router.replace('/(OnboardingScreen)/OnboardScreen');
    }, 3000);

    return () => clearTimeout(timer);
  }, []); */

  //<SplashScreen />

  return (
    <View style={{ flex: 1 }}>
      <StatusBar hidden translucent />
      <BottomTabNav />
    </View>
  );
};

export default Index;