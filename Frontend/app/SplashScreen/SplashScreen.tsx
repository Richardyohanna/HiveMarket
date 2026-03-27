import { Colors, FontSize } from '@/constants/theme';
import RadialBackground from '@/hooks/RadialBackground';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  useColorScheme
} from 'react-native';

const SplashScreen = () => {
  const scheme = useColorScheme();
  const themeSize = FontSize.size;
  const theme = scheme === "dark" ? Colors.splashDark : Colors.splashLight;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <RadialBackground>
      <Animated.View
        style={[
          style.bg,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("../../assets/images/SplashScreen/icon.png")}
          style={{ width: 300, height: 300 }}
        />

        <Text
          style={{
            fontSize: themeSize.xxxlg,
            marginTop: -60,
            fontWeight: "700",
            color: theme.text,
          }}
        >
          Hive<Text style={{ color: "#008100" }}>Market</Text>
        </Text>

        <Text
          style={{
            fontSize: themeSize.md,
            marginTop: 10,
            color: theme.text,
            textAlign: "center",
            fontWeight: "200",
          }}
        >
          Your Campus. Your Marketplace
        </Text>
      </Animated.View>
    </RadialBackground>
  );
};

export default SplashScreen;

const style = StyleSheet.create({
  bg: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});