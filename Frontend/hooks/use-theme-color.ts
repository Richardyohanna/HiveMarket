/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, FontSize } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';



export const useThemeColor = () => {
  const scheme = useColorScheme();

  const theme = scheme === "dark" ? Colors.dark : Colors.light;
  const themeSize = FontSize.size;

  return { theme, themeSize };
};

