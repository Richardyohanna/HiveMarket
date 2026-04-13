import React from 'react';
import { Pressable, Text, useColorScheme, View } from 'react-native';
import { Colors, FontSize } from '../../constants/theme';

const Done = () => {
    const scheme = useColorScheme();
    const themeSize = FontSize.size;
    const theme = scheme === "dark" ? Colors.dark : Colors.light;


    const onDone = () => {


            
        
            
                // Handle the "Done" button press, e.g., navigate to the main app screen
        
                const data = {
                    email: "test@example.com",
                    fullName: "John Doe",
                    role: "Student",   
  
                    location
                }
                console.log("User Info:", data);

    }
    
    return (
        <View style={{width: "100%", bottom: 0,  alignItems: "center", justifyContent: "center",alignSelf: "center", marginBottom: 20}}>
        
            <Pressable onPress={onDone} style={{backgroundColor: theme.subText, padding: 15, borderRadius: 20, width: "90%", alignSelf: "center", marginTop: 20, alignItems: "center"}}>
                <Text style={{alignItems: "center",alignSelf: "center", color: "white", fontSize: themeSize.lg, marginTop: 10, textAlign: "center", fontWeight: "700"}}>Done</Text>
            </Pressable>

    </View>
  )
}

export default Done