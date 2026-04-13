import { userStore } from '@/src/store/userStore';
import React from 'react';
import { Text, TextInput, View } from 'react-native';

const UserProfileInfo = () => {

    const {location, setLocation} = userStore();

  return (
    <View>
      <Text style={{color: "white"}}>UserProfileInfo</Text>
      <TextInput 
      style={{color: "white"}}
      value={location}
      onChangeText={setLocation}
      />
    </View>
  )
}

export default UserProfileInfo