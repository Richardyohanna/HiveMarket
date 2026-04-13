import { Colors, FontSize } from '@/constants/theme';
import { serverGender } from '@/src/api/userApi';
import { userStore } from '@/src/store/userStore';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, Text, useColorScheme, View } from 'react-native';

const GENDER_OPTIONS = [
  { gender: "Male" },
  { gender: "Female" },
  { gender: "Non-binary" },
  { gender: "Prefer not to say" }
];

const GenderScreen = () => {

//const {setGender} = userStore();
const { email , gender, setGender} = userStore();

const scheme = useColorScheme();
const themeSize = FontSize.size;
const theme = scheme === "dark" ? Colors.dark : Colors.light;

const [loading, setLoading] = useState<boolean>(false);

const userEmail = Array.isArray(email) ? email[0] : email;

console.log("this is the userEmail from genderSCreen", userEmail);


  const onBack = () => {
    router.back();
  };

  const onNext = () => {

    setLoading(true)

    if (!gender) return;
    
    serverGender(gender, userEmail, (response) => {
      console.log("This is the server Response of Gender", response);
    }).then(() => {
      setLoading(false)
      router.push("/CreateAccount/ProfileInfo");
    });
  };


  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        padding: 10,
        marginBottom: 15,
      }}
    >
      {/*<Back_Title_Header title="Step 2 of 3" onBack={onBack} /> */}
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
            Step 2 of 3
            </Text>
        </View>

      <Text
        style={{
          alignItems: "center",
          color: theme.text,
          fontSize: themeSize.xlg,
          fontWeight: "700",
          marginTop: 20,
          textAlign: "center",
        }}
      >
        Select Your Gender
      </Text>

      <View
        style={{
          marginTop: 20,
          flexDirection: "row",
          justifyContent: "center",
          alignSelf: "center",
          flexWrap: "wrap",
          flex: 1,
        }}
      >
        {GENDER_OPTIONS.map((item) => (
          <Pressable
            key={item.gender}
            onPress={() => setGender(item.gender)}
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
              borderColor:
                gender === item.gender ? theme.subText : "transparent",
              backgroundColor: theme.sectionBackground,
              borderRadius: 15,
              borderWidth: 1,
              margin: 10,
              padding: 10,
              paddingRight: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                borderRadius: 15,
                alignSelf: "flex-start",
              }}
            >
              <Pressable
                style={{
                  backgroundColor:
                   gender === item.gender
                      ? theme.subText
                      : "transparent",
                  borderWidth: 1,
                  borderColor: theme.subText,
                  padding: 10,
                  margin: 10,
                  borderRadius: 50,
                  width: 20,
                  height: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => setGender(item.gender)}
              >
                {gender === item.gender && (
                  <Image
                    source={require("../../assets/images/RoleScreen/check.png")}
                    style={{
                      width: 15,
                      height: 15,
                      tintColor: "white",
                      borderRadius: 20,
                    }}
                  />
                )}
              </Pressable>

              <Text
                style={{
                  color: theme.text,
                  fontSize: themeSize.md,
                  textAlign: "left",
                }}
              >
                {item.gender}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/*<Next_Skip onNext={onNext} /> */}
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
            <Pressable onPress={()=>console.log("void")}>
                <Text style={{color: theme.text, fontSize: themeSize.lg, marginTop: 15, textAlign: "center", fontWeight: "700"}}>Skip</Text>
            </Pressable>

        </View>
    </View>
  );
};

export default GenderScreen;