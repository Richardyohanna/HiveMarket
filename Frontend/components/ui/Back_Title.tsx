import { useColorScheme, View, Pressable, Image, Text } from "react-native";
import { FontSize, Colors } from "@/constants/theme";


export const Back_Title_Header = ({ title, onBack }: { title: string; onBack: () => void }) => {
    
    const scheme = useColorScheme();
    const themeSize = FontSize.size;
    const theme = scheme === "dark" ? Colors.dark : Colors.light;   

    return (

         <View
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 10,
                width: "100%",
                }}
            >
      
            <Pressable onPress={onBack} style={{ width: 20 }}>
                <Image
                    source={require("../../assets/images/ProductDetail/back.png")}
                    style={{ tintColor: theme.text }}
                />
            </Pressable>


            <Text
            style={{
                textAlign: "center",
                alignSelf: "center",
                flex: 1,
                color: theme.text,
                fontSize: themeSize.md,
                fontWeight: "700",
            }}
            >
            {title}
            </Text>
        </View>

    )
}
