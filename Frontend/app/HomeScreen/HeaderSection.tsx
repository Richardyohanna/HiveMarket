import { Colors, FontSize } from '@/constants/theme';
import { userStore } from '@/src/store/userStore';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, useColorScheme, View } from 'react-native';


type HomeHeaderProp = {

    onNotificationClicked: () => void;
}


const HeaderSection = ({ onNotificationClicked}: HomeHeaderProp) => {

    const scheme = useColorScheme();
    const themeSize = FontSize.size;
    const theme = scheme === "dark" ? Colors.dark : Colors.light;

    const {email, full_name, profile_picture, gender} = userStore();



    //const {userData} = useLocalSearchParams()

    //const [userData, setUserData] = useState<any | null>(null);

    //useEffect(()=>{



   // },[email])

   console.log(profile_picture, "This is the Header Profile picture");

    const onProfileImage = () => {
        router.navigate("/ProfileScreen/ProfileScreen");
    }

    const onSignInClicked = () => {
        router.navigate("/Login/LoginScreen");
    }   

    const onSignUpClicked = () => {
        router.navigate("/CreateAccount/CreateAccountScreen");
    }   

    console.log(full_name, email, "Email and FullName ");
  return (
    <View style={{ width: "100%", alignItems: "center", justifyContent: "flex-start", flexDirection: "row"}}>
        <View style={{flexDirection: "row", flex: 1, gap: 15, alignItems: "center"}}>
            <Pressable onPress={onProfileImage}>
                <Image 
                    source={
                        profile_picture != ""
                        ? { uri: profile_picture } :
                        gender === "Female" ?
                        require('@/assets/images/CreateAccount/femaleUser.png')
                        : require('@/assets/images/CreateAccount/user.png')
                  } 
                        
                    style={{
                        width: 40, 
                        height: 40, 
                        borderRadius: 50, 
                        borderWidth: 1, 
                        borderColor: "rgba(200,200,200,0.5)" 
                        }} />
            </Pressable>
            
            {email  ? (
            <View style={{gap: 3}}>
                <Text style={{color: theme.text, fontSize: themeSize.sm, fontWeight: "200", letterSpacing: 1.5}}>WELCOME BACK</Text>
                <Text style={{color: theme.text, fontSize: themeSize.md, fontWeight: "700", letterSpacing: 1}}>Hi, {full_name} 👋 </Text>
            </View>
            ) : (
            <View style={{flexDirection: "row"}}>
                <Text onPress={onSignInClicked} style={{color: theme.subText, textDecorationLine: "underline", fontSize: themeSize.md}}>Sign In</Text>
                <Text style={{color: theme.subText, fontSize: themeSize.md}}> \</Text>
                <Text onPress={onSignUpClicked} style={{color: theme.subText, textDecorationLine: "underline", fontSize: themeSize.md}}> Sign Up</Text>
            </View>
            )}
            
        </View>

        <Pressable 
    
         onPress={onNotificationClicked}
         style={{
            width: 40, 
            height: 40, 
            borderRadius: 50, 
            backgroundColor: scheme === "dark" ? "#1E293B" : "white" , 
            justifyContent: "center", 
            alignItems: "center",
            shadowColor: scheme === "dark" ? "#rgb(0, 0, 0)" : "#0f0f10",
            shadowRadius: 1,
            shadowOpacity: 0.3,
            shadowOffset: {width: 0, height: 0}

            }}>
            <Image source={require("../../assets/images/HomeScreen/notification.png")} />
        </Pressable>
    </View>
  )
}

export default HeaderSection