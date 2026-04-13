import { Colors, FontSize } from "@/constants/theme";
import { Pressable, Text, useColorScheme, View } from "react-native";


type ButtonsProps = {
    onNext?: () => void;
    onSkip?: () => void;    
}

export const  Next_Skip = ({ onNext, onSkip }: ButtonsProps) => {
    
    const scheme = useColorScheme();
    const themeSize = FontSize.size;
    const theme = scheme === "dark" ? Colors.dark : Colors.light;

    
    
    return (
        <View style={{width: "100%", bottom: 0,  alignItems: "center", justifyContent: "center",alignSelf: "center", marginBottom: 20}}>
        
            <Pressable onPress={onNext} style={{backgroundColor: theme.subText, padding: 15, borderRadius: 20, width: "90%", alignSelf: "center", marginTop: 20, alignItems: "center"}}>
                <Text style={{alignItems: "center",alignSelf: "center", color: "white", fontSize: themeSize.lg, marginTop: 10, textAlign: "center", fontWeight: "700"}}>Next</Text>
            </Pressable>
            <Pressable onPress={onSkip}>
                <Text style={{color: theme.text, fontSize: themeSize.lg, marginTop: 15, textAlign: "center", fontWeight: "700"}}>Skip</Text>
            </Pressable>

        </View>
    )
}

