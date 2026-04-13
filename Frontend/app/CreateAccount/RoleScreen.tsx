import { Colors, FontSize } from '@/constants/theme';
import { serverRole } from '@/src/api/userApi';
import { userStore } from '@/src/store/userStore';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ImageSourcePropType, Pressable, ScrollView, Text, useColorScheme, View } from 'react-native';

type Role = {
    role: string;
    roleImage: ImageSourcePropType
}

const roles: Role[] = [
    {
        role: "Student",
        roleImage: require("../../assets/images/RoleScreen/student.png")
    },
    {
        role: "Seller",
        roleImage: require("../../assets/images/RoleScreen/seller.png")
    }

]




const RoleScreen = () => {

    const { email, setRole, role} = userStore();

    const scheme = useColorScheme();
    const themeSize = FontSize.size;
    const theme = scheme === "dark" ? Colors.dark : Colors.light;
    

    const [serverResponse, setServerResponse] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    
  

    const onNext = () => {

       //if(selectedRole == null) return;

        setLoading(true)
        serverRole(role || "Student", email , (response: any) => {
            setServerResponse(response);
            console.log("Server response for role selection:", response);

        }).then(() => {
            
            setLoading(false)
            router.push("/CreateAccount/GenderScreen");

        });
        

    }

    


    
  return (
    <View style={{flex: 1, backgroundColor: theme.background, padding: 10, marginBottom: 15}}>
       
        <View
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 10,
                width: "100%",
                }}
            > 
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
            Step 1 of 3
            </Text>
        </View>

        <Text style={{alignItems: "center",alignSelf: "center", color: theme.text, fontSize: themeSize.xlg, fontWeight: "700", marginTop: 20, textAlign: "center"}}>Select Your Role</Text>
        <Text style={{alignItems: "center",alignSelf: "center", color: theme.text, fontSize: themeSize.lg, marginTop: 10, textAlign: "center"}}>Choose your role to personalize your experience</Text>

        <ScrollView horizontal={false} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} style={{marginTop: 20}}
            contentContainerStyle={{flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", alignSelf: "center" }}
        >  
        {roles.map((keyrole)=> (
            <Pressable key={keyrole.role} 
                 onPress={() => setRole(keyrole.role)}
                style={{flexDirection: "column", alignItems: "flex-start", borderColor: role=== keyrole.role ? theme.subText : "transparent", backgroundColor: theme.sectionBackground,borderRadius: 15, borderWidth: 1, margin: 10, padding: 10}} >
                <Image source={keyrole.roleImage} style={{ width: 120, height: 120 , borderRadius: 15}} />
                <View style={{flexDirection: "row", justifyContent: "center", alignItems: "center",  width: 120, borderRadius: 15,}}> 
                    <Pressable style={{
                        backgroundColor: role=== keyrole.role ?  theme.subText : "transparent",
                        borderWidth: 1,
                        borderColor: theme.subText,
                        padding: 10,
                        margin: 10,
                        borderRadius: 50,
                        width: 20,
                        height: 20,
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    
                    

                    >
                       {role=== keyrole.role && (
                            <Image source={require("../../assets/images/RoleScreen/check.png")} style={{ width: 15, height: 15, tintColor: "white" , borderRadius: 20}} />
                        )}
                    </Pressable>
                    <Text style={{color: theme.text, fontSize: themeSize.lg,textAlign: "center"}}>{keyrole.role}</Text>
                </View>
            </Pressable>
        ))}
        </ScrollView>

        {/*<Next_Skip onNext={onNext}/> */}
        
        <View style={{width: "100%", bottom: 0,  alignItems: "center", justifyContent: "center",alignSelf: "center", marginBottom: 20}}>
        
            <Pressable onPress={onNext} 
            
            disabled={loading}
            style={{
                backgroundColor: theme.subText, 
                padding: 15, 
                borderRadius: 20, 
                width: "90%", 
                alignSelf: "center", 
                marginTop: 20, 
                alignItems: "center",
                opacity: loading ? 0.7 : 1
                }}>
                <Text style={{alignItems: "center",alignSelf: "center", color: "white", fontSize: themeSize.lg, marginTop: 10, textAlign: "center", fontWeight: "700"}}>
                    Next
                </Text>
            </Pressable>
            <Pressable>
                <Text style={{color: theme.text, fontSize: themeSize.lg, marginTop: 15, textAlign: "center", fontWeight: "700"}}>Skip</Text>
            </Pressable>

        </View>
    </View>
  )
}

export default RoleScreen