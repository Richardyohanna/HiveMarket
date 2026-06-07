import { Redirect } from "expo-router";
import React from 'react';


const Index = () => {
  /*useEffect(() => {
    const timer = setTimeout(() => {
     router.replace('/(OnboardingScreen)/OnboardScreen');
    }, 3000);

    return () => clearTimeout(timer);
  }, []); */

  //<SplashScreen />

  /*
  return (
    <View style={{ flex: 1 }}>
      <StatusBar hidden translucent />
      <BottomTabNav />
    </View>
  ); */

  return <Redirect href="/(tabs)/HomeScreen" />;
};

export default Index;