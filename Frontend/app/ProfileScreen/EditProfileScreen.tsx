import { Colors } from '@/constants/theme';
import { updateUserDetail } from '@/src/api/userApi';
import { userStore } from '@/src/store/userStore';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
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
  View
} from 'react-native';

const PRIMARY      = "#008100";
const PRIMARY_SOFT = "#e8f5e9";
const PRIMARY_DARK = "#1a3a1a";

const EditProfileScreen = () => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;

  const user = userStore.getState();
  const {setFullName, setCampus, setLocation, setUniversity, setProfilePicture} = userStore();

  // Local component states initialized from userStore
  const [fullName, setFullNameUpdate] = useState(user.full_name || '');
  const [location, setLocationUpdate] = useState(user.location || ''); // Added Username field
  const [university, setUniversityUpdate] = useState(user.university || '');
  const [campus, setCampusUpdate] = useState(user.campus || ''); // Using campus mapping to Location
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profile_picture, setProfilePictures] = useState("");
  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);


  const ringAnim = useRef(new Animated.Value(1)).current;
    const pulseRing = () => {
        Animated.sequence([
        Animated.timing(ringAnim, { toValue: 1.08, duration: 180, useNativeDriver: true }),
        Animated.timing(ringAnim, { toValue: 1,    duration: 180, useNativeDriver: true }),
        ]).start();
    };


    useEffect(() => {
        setProfilePictures(user.profile_picture);

        getCurrentLocation();
    },[])




   const avatarSource = profile_picture
    ? { uri: profile_picture }
    : user.gender === "Female"
      ? require("@/assets/images/CreateAccount/femaleUser.png")
      : require("@/assets/images/CreateAccount/user.png");
 

  const handlePickImage = async () => {
      
        try {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            Alert.alert("Permission required", "Please allow gallery access.");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.7,
            allowsEditing: true,
            aspect: [1, 1],
          });
          if (!result.canceled && result.assets?.length > 0) {
            setProfilePictures(result.assets[0].uri);
            pulseRing();
          }
        } catch {
          Alert.alert("Error", "Unable to pick image.");
        }
     
  };

  const getCurrentLocation = async () => {
  
      const { status } =
          await Location.requestForegroundPermissionsAsync();
  
      if (status !== 'granted') {
          Alert.alert("Location permission denied");
          return;
      }
  
      const current =
          await Location.getCurrentPositionAsync({});
  
      setLatitude(current.coords.latitude);
      setLongitude(current.coords.longitude);
  
      
      console.log(current.coords.latitude);
      console.log(current.coords.longitude);
  };
  

  const handleSaveChanges = () => {
    if (password && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    const data = {
        id: user.id,
        email: user.email,
        profile_picture: profile_picture,
        full_name: fullName,
        university: university,
        campus: campus,
        location: location
    }

    updateUserDetail(data).then((data) => {
        console.log("This is the profile info from the server after update ", data);
    });

        setCampus(data.campus);
        setFullName(data.full_name);
        setLocation(data.location);
        setUniversity(data.university);
        setProfilePicture(data.profile_picture);

    console.log("This is the updated profile info data ", data);

    // Update your global state or database API layer here
    // Example: userStore.setState({ full_name: fullName, username, university, campus: location });
    
    Alert.alert("Success", "Profile updated successfully!", [
      { text: "OK", onPress: () => router.back() }
    ]);
  };

  return (

    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.screen, { backgroundColor: theme.screenBackground, paddingTop: 25 }]}>
        
        {/* Navbar */}
        <View style={[styles.navbar, { borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={{ fontSize: 30, color: theme.text, fontWeight: "700" }}>←</Text>
            </Pressable>
            <Text style={[styles.navTitle, { color: theme.text }]}>Edit Profile</Text>
            <Pressable onPress={handleSaveChanges} hitSlop={12}>
            <Text style={{ fontSize: 16, color: PRIMARY, fontWeight: "700" }}>Save</Text>
            </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
            
            {/* Avatar Selection */}
            <View style={styles.avatarSection}>
            <View style={styles.avatarRing}>
                <Image source={avatarSource} style={styles.avatar} />
            </View>
            <Pressable style={[styles.changePhotoBtn, { backgroundColor: PRIMARY_SOFT }]} onPress={handlePickImage}>
                <Text style={{ color: PRIMARY, fontWeight: "600", fontSize: 13 }}>Change Profile Photo</Text>
            </Pressable>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
            <Text style={[styles.inputLabel, { color: theme.readColor }]}>FULL NAME</Text>
            <TextInput
                style={[styles.input, { backgroundColor: theme.sectionBackground, color: theme.text, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}
                value={fullName}
                onChangeText={setFullNameUpdate}
                placeholder="Enter full name"
                placeholderTextColor={theme.readColor}
            />


            <Text style={[styles.inputLabel, { color: theme.readColor }]}>UNIVERSITY NAME</Text>
            <TextInput
                style={[styles.input, { backgroundColor: theme.sectionBackground, color: theme.text, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}
                value={university}
                onChangeText={setUniversityUpdate}
                placeholder="Enter your school name"
                placeholderTextColor={theme.readColor}
            />

            <Text style={[styles.inputLabel, { color: theme.readColor }]}>CAMPUS</Text>
            <TextInput
                style={[styles.input, { backgroundColor: theme.sectionBackground, color: theme.text, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}
                value={campus}
                onChangeText={setCampusUpdate}
                placeholder="Enter your primary location"
                placeholderTextColor={theme.readColor}
            />

            
            <Text style={[styles.inputLabel, { color: theme.readColor }]}>LOCATION</Text>
            <TextInput
                style={[styles.input, { backgroundColor: theme.sectionBackground, color: theme.text, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}
                value={location.address}
                onChangeText={(data) => setLocationUpdate({
                  address: data,
                  latitude: latitude,
                  longitude: longitude
                })}
                placeholder="Enter username"
                placeholderTextColor={theme.readColor}
                autoCapitalize="none"
            />

        {/*
            <View style={[styles.divider, { backgroundColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Security Settings</Text>

            <Text style={[styles.inputLabel, { color: theme.readColor }]}>NEW PASSWORD</Text>
            <TextInput
                style={[styles.input, { backgroundColor: theme.sectionBackground, color: theme.text, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Leave empty to keep current"
                placeholderTextColor={theme.readColor}
                secureTextEntry
            />

            <Text style={[styles.inputLabel, { color: theme.readColor }]}>CONFIRM PASSWORD</Text>
            <TextInput
                style={[styles.input, { backgroundColor: theme.sectionBackground, color: theme.text, borderColor: isDark ? PRIMARY_DARK : "#e4f0e4" }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat new password"
                placeholderTextColor={theme.readColor}
                secureTextEntry
            />
        */}

            </View>

    

            {/* Action Button */}
            <Pressable style={[styles.submitButton, { backgroundColor: PRIMARY }]} onPress={handleSaveChanges}>
            <Text style={styles.submitButtonText}>Save Changes</Text>
            </Pressable>

        </ScrollView>
        </View>
        </ TouchableWithoutFeedback >
    </KeyboardAvoidingView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  screen: { flex: 1 },
  navbar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1,
  },
  navTitle: { fontSize: 17, fontWeight: "900", letterSpacing: -0.4 },
  scrollContainer: { paddingHorizontal: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginTop: 20, marginBottom: 15 },
  avatarRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: PRIMARY, overflow: "hidden", marginBottom: 12
  },
  avatar: { width: "100%", height: "100%" },
  changePhotoBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  form: { marginTop: 10 },
  inputLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.2, marginTop: 14, marginBottom: 6, paddingLeft: 2 },
  input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 14 },
  divider: { height: 1, marginVertical: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  submitButton: { height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  submitButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' }
});