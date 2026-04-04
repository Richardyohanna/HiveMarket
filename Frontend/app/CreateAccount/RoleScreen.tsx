import { Colors, FontSize } from '@/constants/theme';
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

type ButtonsProps = {
    onNext?: () => void;
    onSkip?: () => void;
    
}

export const  Next_Skip = ({ onNext, onSkip }: ButtonsProps) => {
    
    const scheme = useColorScheme();
    const themeSize = FontSize.size;
    const theme = scheme === "dark" ? Colors.dark : Colors.light;
    
    return (
        <>
        
            <Pressable onPress={onNext} style={{backgroundColor: theme.subText, padding: 15, borderRadius: 20, width: "90%", alignSelf: "center", marginTop: 20, alignItems: "center"}}>
                <Text style={{alignItems: "center",alignSelf: "center", color: "white", fontSize: themeSize.lg, marginTop: 10, textAlign: "center"}}>Next</Text>
            </Pressable>
            <Pressable onPress={onSkip}>
                <Text style={{color: theme.text, fontSize: themeSize.lg, marginTop: 15, textAlign: "center"}}>Skip</Text>
            </Pressable>

        </>
    )
}


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

const RoleScreen = () => {
    const scheme = useColorScheme();
    const themeSize = FontSize.size;
    const theme = scheme === "dark" ? Colors.dark : Colors.light;
    
    const [selectedRole, setSelectedRole] = useState<string | null>("Student");

    const onBack = () => {
        router.back();
    }


    
  return (
    <View style={{flex: 1, backgroundColor: theme.background, padding: 10, marginBottom: 15}}>
       
        <Back_Title_Header title="Step 1 of 3" onBack={onBack} />


        <Text style={{alignItems: "center",alignSelf: "center", color: theme.text, fontSize: themeSize.xlg, fontWeight: "700", marginTop: 20, textAlign: "center"}}>Select Your Role</Text>
        <Text style={{alignItems: "center",alignSelf: "center", color: theme.text, fontSize: themeSize.lg, marginTop: 10, textAlign: "center"}}>Choose your role to personalize your experience</Text>

        <ScrollView horizontal={false} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} style={{marginTop: 20}}
            contentContainerStyle={{flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", alignSelf: "center" }}
        >  
        {roles.map((role)=> (
            <Pressable key={role.role} 
                 onPress={()=> setSelectedRole(role.role)}
                style={{flexDirection: "column", alignItems: "flex-start", borderColor: selectedRole=== role.role ? theme.subText : "transparent", borderRadius: 15, borderWidth: 1, margin: 10, padding: 10}} >
                <Image source={role.roleImage} style={{ width: 120, height: 120 }} />
                <View style={{flexDirection: "row", justifyContent: "center", alignItems: "center"}}> 
                    <Pressable style={{
                        backgroundColor: selectedRole=== role.role ?  theme.subText : "transparent",
                        borderWidth: 1,
                        borderColor: theme.subText,
                        padding: 10,
                        margin: 10,
                        borderRadius: 50,
                        width: 25,
                        height: 25,
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    
                    onPress={()=> setSelectedRole(role.role)}

                    >
                       {selectedRole=== role.role && (
                            <Image source={require("../../assets/images/RoleScreen/check.png")} style={{ width: 15, height: 15, tintColor: "white" , borderRadius: 20}} />
                        )}
                    </Pressable>
                    <Text style={{color: theme.text, fontSize: themeSize.lg, marginTop: 10, textAlign: "center"}}>{role.role}</Text>
                </View>
            </Pressable>
        ))}
        </ScrollView>
        <Next_Skip />
    </View>
  )
}

export default RoleScreen