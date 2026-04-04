import React from 'react'
import { Image, Text, View } from 'react-native'
import { Back_Title_Header, Next_Skip } from './RoleScreen'

const ProfileInfo = () => {
  return (
    <View>
      <Back_Title_Header title='Step 2 of 3' onBack={() => {}} />
        <Text>Complete Your Profile</Text>
        <Text>Add a profile and your university to continue.</Text>
        
        <Image source={require("../../assets/images/RoleScreen/profile.png")} style={{width: 200, height: 200, alignSelf: "center", marginTop: 20}}> </Image>  

      <Next_Skip />
    </View>
  )
}

export default ProfileInfo