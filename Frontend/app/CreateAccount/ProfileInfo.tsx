import { Colors, FontSize } from '@/constants/theme';
import { uploadProfilePicture } from '@/src/api/userApi';
import { userStore } from '@/src/store/userStore';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from 'react-native';

const ProfileInfo = () => {

  const {email, gender} = userStore();

  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? Colors.dark : Colors.light;
  const themeSize = FontSize.size;

  const [profilePicture, setProfilePicture] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [university, setUniversity] = useState<string>('');
  const [campus, setCampus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false)

  const onBack = () => {
    router.back();
  };

  //console.log(email)
  const imageSelector = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Please allow gallery access.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const uri = result.assets[0].uri;
        setProfilePicture(uri);
      }
    } catch (error) {
      console.log('Image picker error:', error);
      Alert.alert('Error', 'Unable to pick image.');
    }
  };

  const onDoneClick = () => {
    if (!location.trim()) {
      Alert.alert('Validation Error', 'Please enter your location.');
      return;
    }

    if (!university.trim()) {
      Alert.alert('Validation Error', 'Please enter your university.');
      return;
    }

    if (!campus.trim()) {
      Alert.alert('Validation Error', 'Please enter your campus.');
      return;
    }

    const data = {
      profilePicture,
      location,
      university,
      campus,
    }
    console.log({
      data
    });

    setLoading(true)
    uploadProfilePicture(  
      email,
      profilePicture,
      location,
      university,
      campus, 

    ).then(()=> {
       setLoading(false)
      router.replace("/HomeScreen/HomeScreen");
    });

   

    //Alert.alert('Success', 'Profile info captured successfully.');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.flex}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.headerRow}>
                <Pressable onPress={onBack} style={styles.backButton}>
                  <Image
                    source={require('../../assets/images/ProductDetail/back.png')}
                    style={{ tintColor: theme.text }}
                  />
                </Pressable>

                <Text
                  style={[
                    styles.stepText,
                    {
                      color: theme.text,
                      fontSize: themeSize.md,
                    },
                  ]}
                >
                  Step 3 of 3
                </Text>

                <View style={styles.headerSpacer} />
              </View>

              <Text
                style={[
                  styles.title,
                  {
                    color: theme.text,
                    fontSize: themeSize.xlg,
                  },
                ]}
              >
                Complete Your Profile
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color: theme.text,
                    fontSize: themeSize.lg,
                  },
                ]}
              >
                Add a profile and your university to continue.
              </Text>

              <View
                style={[
                  styles.avatarWrapper,
                  {
                    borderColor: theme.borderColor,
                  },
                ]}
              >
                <Image
                  source={
                    profilePicture
                      ? { uri: profilePicture } :
                      gender === "Female" ?
                      require('@/assets/images/CreateAccount/femaleUser.png')
                      : require('@/assets/images/CreateAccount/user.png')
                  }
                  style={styles.avatar}
                  resizeMode="cover"
                />
              </View>

              <Pressable
                onPress={imageSelector}

                style={[
                  styles.uploadButton,
                  { backgroundColor: theme.subText },
                ]}
              >
                <Image
                  source={require('@/assets/images/CreateAccount/camera.png')}
                  style={styles.cameraIcon}
                />
                <Text
                  style={{
                    color: 'white',
                    fontSize: themeSize.md,
                  }}
                >
                  Upload photo
                </Text>
              </Pressable>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: theme.borderColor,
                    backgroundColor: 'rgba(200,200,200,0.2)',
                    marginTop: 20,
                  },
                ]}
              >
                <Image
                  source={require('../../assets/images/CreateAccount/location.png')}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Select your Location"
                  placeholderTextColor="#888686ca"
                  style={[styles.input, { color: theme.text }]}
                  value={location}
                  onChangeText={setLocation}
                  autoCorrect={false}
                />
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: theme.borderColor,
                    backgroundColor: 'rgba(200,200,200,0.2)',
                    marginTop: 10,
                  },
                ]}
              >
                <Image
                  source={require('../../assets/images/CreateAccount/university.png')}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter your University Name"
                  placeholderTextColor="#888686ca"
                  style={[styles.input, { color: theme.text }]}
                  value={university}
                  onChangeText={setUniversity}
                  autoCorrect={false}
                />
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  {
                    borderColor: theme.borderColor,
                    backgroundColor: 'rgba(200,200,200,0.2)',
                    marginTop: 10,
                    marginBottom: 20,
                  },
                ]}
              >
                <Image
                  source={require('../../assets/images/CreateAccount/campus.png')}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter your Campus Name"
                  placeholderTextColor="#888686ca"
                  style={[styles.input, { color: theme.text }]}
                  value={campus}
                  onChangeText={setCampus}
                  autoCorrect={false}
                />
              </View>
            </ScrollView>

           
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
       <View style={styles.footer}>
          <Pressable
            onPress={onDoneClick}
            disabled={loading}
            style={[
              styles.doneButton,
              { backgroundColor: theme.subText,
                opacity: loading ? 0.5 : 1
              },
            ]}
          >
            <Text
              style={{
                color: 'white',
                fontSize: themeSize.lg,
                fontWeight: '700',
              }}
            >
             {loading ? "uploading..." : "Done"}
            </Text>
          </Pressable>
        </View>
    </View>
  );
};

export default ProfileInfo;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  backButton: {
    width: 24,
  },
  headerSpacer: {
    width: 24,
  },
  stepText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 20,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 10,
  },
  avatarWrapper: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    overflow: 'hidden',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  cameraIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 40,
    borderWidth: 1,
    gap: 10,
  },
  inputIcon: {
    tintColor: '#888686ca',
    width: 20,
    height: 20,
  },
  input: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  doneButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 20,
  },
});