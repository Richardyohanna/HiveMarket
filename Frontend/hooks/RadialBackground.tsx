import { Colors, FontSize } from "@/constants/theme";
import React, { ReactNode } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

type RadialBackgroundProps = {
  children?: ReactNode;
};

const RadialBackground: React.FC<RadialBackgroundProps> = ({ children }) => {

  const scheme = useColorScheme();
  const themeSize = FontSize.size
  const theme = scheme === "dark" ? Colors.splashDark: Colors.splashLight

  return (
    <View style={[StyleSheet.absoluteFill, {justifyContent: "center",alignItems: "center"}]}>
      <Svg height="100%" width="100%" style={{position: "absolute"}}>
        <Defs>
          <RadialGradient id="grad" cx="50%" cy="50%" r="60%">
            <Stop offset="0%" stopColor="#22C55E" stopOpacity={0.6} />
            <Stop offset="70%" stopColor= {theme.background} stopOpacity={1} />
          </RadialGradient>
        </Defs>

        <Rect width="100%" height="100%" fill="url(#grad)" />
      </Svg>

      {/* Your content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

export default RadialBackground;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

       
  },
});