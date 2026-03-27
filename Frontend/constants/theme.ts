/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

type ThemeType = {
  background: string;
  text: string;
  subText: string;
  primary: string;
  sectionBackground: string;
  screenBackground: string;
  iconBackground: string;
  borderColor: string;
  readColor: string
}

type ThemeFontSize = {
  xsm: number;
  sm: number;
  md: number;
  lg: number;
  xlg: number;
  xxlg: number;
  xxxlg: number;
  
}

export const FontSize = {
  size: {
    xsm: 10,
    sm: 12,
    md: 16,
    lg: 18,
    xlg_md: 23,
    xlg: 30,    
    xxlg: 45,
    xxxlg: 55,
  }
}
export const Colors: {
  light: ThemeType;
  dark: ThemeType;
  splashLight: ThemeType;
  splashDark: ThemeType
} = {
  light: {
    background: "#ffffff",
    text: "#000000",
    subText: "#008100",
    primary: "#fff",
    sectionBackground: "#f2f2f26e",
    screenBackground: "white",
    iconBackground: "#2ecc702f",
    borderColor: "#9a9a9a",
    readColor: "#00000078"
  },
  dark: {
    background: "#000",
    text: "#ffffffc5",
    subText: "#008100",
    primary: "#171616",
    sectionBackground: "#1E293B" ,
    screenBackground: "#0B120E",
    iconBackground: "#2ecc702f",
    borderColor: "#9a9a9a",
    readColor: "#ffffff78"
  },
  splashDark: {
    background: "#000",
    text: "#ffffffc5",
    subText: "#008100",
    primary: "#171616",
    sectionBackground: "#f2f2f26e",
    screenBackground: "#0B120E",
    iconBackground: "#2ecc702f",
    borderColor: "#9a9a9a",
    readColor: "#00000078"
  } ,
  splashLight: {
    background: "#ffffff",
    text: "#000000",
    subText: "#008100",
    primary: "#fff",
    sectionBackground: "#1E293B" ,
    screenBackground:"white",
    iconBackground: "#2ecc702f",
    borderColor: "#9a9a9a",
    readColor: "#ffffff78"
  }
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
