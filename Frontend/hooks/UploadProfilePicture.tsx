import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Image, Pressable, Text } from 'react-native';
import { useThemeColor } from './use-theme-color';

type UploadProfilePictureProps = {
   
    setImage: (value: any) => void;
}

const UploadProfilePicture = ({ setImage }: UploadProfilePictureProps) => {

    const { theme, themeSize } = useThemeColor();

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    
   // const setProfilePicture = userStore((state) => state.setProfilePicture);
   // const profilePicture = userStore((state) => state.profilePicture);

    //setProfilePicture(selectedImage || "");

    setImage(selectedImage || "");

    const imageSelector = async () => {

        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
        if (!permissionResult.granted) {
          alert("Permission to access camera roll is required!");
          return;
        }
    
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.7,
        });
    
        if (!result.canceled) {
          const uri = result.assets[0].uri;
          setSelectedImage(uri);
         // console.log("picked:", uri);
        }
      };
      

   //console.log("profile picture in upload component:", profilePicture);

  return (
    <Pressable 
        
        onPress={
          () => {
            imageSelector();
            //setSelectedImage("test");
          }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 15,
          backgroundColor: theme.subText,
          padding: 5,
          borderRadius: 10,
          alignSelf: "center",
          paddingLeft: 10,
          paddingRight: 10
        }}>
          <Image source={require("@/assets/images/CreateAccount/camera.png")} style={{width: 20, height: 20}} />
          <Text style={{ color: "white", fontSize: themeSize.md }}> Upload photo </Text>
    </Pressable> 
  )
}

export default UploadProfilePicture