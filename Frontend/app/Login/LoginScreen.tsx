import { Colors, FontSize } from '@/constants/theme';
import { getUserData } from '@/src/api/userApi';
import { loginUser } from "@/src/services/authApi";
import { userStore } from '@/src/store/userStore';
import { UserStoreData } from '@/src/types/User';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  useColorScheme,
  View
} from 'react-native';

const LoginScreen = () => {

  const {
    email , 
    setEmail, 
    setFullName, 
    setProfilePicture,
    setCampus,
    setLocation,
    setUniversity,
    setGender,
    setRole,

  } = userStore();

  const scheme = useColorScheme();
  const themeSize = FontSize.size;
  const theme = scheme === "dark" ? Colors.dark : Colors.light;

  //const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState<UserStoreData | null>(null);

  const onSignupPress = () => {
    router.replace("/CreateAccount/CreateAccountScreen");
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email: email.trim(),
        password: password.trim(),
      }).then(() => {

        if(!email) return;
        getUserData(email , (data) => {
            console.log("userData from the Login Section Screen ", data);
            
            if(data)              
            setFullName(data.full_name);
            setProfilePicture(data.profile_picture);
            setCampus(data.campus);
            setUniversity(data.university);
            setLocation(data.location);

            setGender(data.gender)
            
            if(data.role)
            setRole(data.role)
            //setUserData(data);
        }).then(() => {

      router.replace(
        {
          pathname:"/BottomTab/BotttomTabNav",
          //params: {userData: userData}
        }); 

        });
      });

      

  
      // change this to your home route
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={style.cbg} behavior={Platform.OS==="ios"? "padding" : "height"}>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={[
          style.form_heading,
          {

          }
        ]}
      >
        <Image
          source={require("../../assets/images/favicon.png")}
          style={{ width: 100, height: 80 }}
        />

        <Text
          style={[
            style.header,
            { color: theme.text, fontSize: themeSize.xlg_md, marginTop: -15 }
          ]}
        >
          Welcome to Hive<Text style={{ color: theme.subText }}>Market</Text>
        </Text>

        <Text style={{ color: theme.text, marginTop: 5 }}>
          Sign in to your account to continue
        </Text>

        <View style={style.form}>
          <Text
            style={{
              color: theme.text,
              fontSize: themeSize.md,
              fontWeight: "700",
              letterSpacing: 1,
              marginTop: 10
            }}
          >
            Email
          </Text>

          <View
            style={[
              style.input,
              {
                backgroundColor: "rgba(200,200,200, 0.2)",
                borderColor:
                  scheme === "dark"
                    ? "rgba(200,200,200, 0.2)"
                    : "rgba(100,100,100, 0.2)"
              }
            ]}
          >
            <Image
              source={require("../../assets/images/CreateAccount/email.png")}
              style={{ tintColor: scheme === "dark" ? "#888686ca" : undefined }}
            />
            <TextInput
              placeholder="example@gmail.com"
              placeholderTextColor={scheme === "dark" ? "#aaa" : "#666"}
              style={{ flex: 1, color: theme.text }}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text
            style={{
              color: theme.text,
              fontSize: themeSize.md,
              fontWeight: "700",
              letterSpacing: 1,
              marginTop: 10
            }}
          >
            Password
          </Text>

          <View
            style={[
              style.input,
              {
                backgroundColor: "rgba(200,200,200, 0.2)",
                borderColor:
                  scheme === "dark"
                    ? "rgba(200,200,200, 0.2)"
                    : "rgba(100,100,100, 0.2)"
              }
            ]}
          >
            <Image
              source={require("../../assets/images/CreateAccount/password.png")}
              style={{ tintColor: scheme === "dark" ? "#888686ca" : undefined }}
            />
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor={scheme === "dark" ? "#aaa" : "#666"}
              style={{ flex: 1, color: theme.text }}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword }
            />
            <Pressable onPress={() => setShowPassword(prev => !prev)}>
              <Image
                source={showPassword ? require("../../assets/images/CreateAccount/eye.png") : require("../../assets/images/CreateAccount/eye-off.png")}
                style={{
                  width: 23,
                  height: 23,
                  tintColor: scheme === "dark" ? "#888686ca" : undefined
                }}
              />
            </Pressable>
          </View>

          <Text
            style={{
              width: "100%",
              textAlign: "right",
              color: theme.subText,
              marginTop: 15,
              marginBottom: -15
            }}
          >
            Forgot password?
          </Text>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={[
              style.button,
              {
                backgroundColor: theme.subText,
                shadowColor: scheme === "dark" ? "#96fea0" : "#1a321c",
                shadowOpacity: scheme === "dark" ? 0.5 : 0.7,
                shadowRadius: scheme === "dark" ? 5 : 3,
                shadowOffset: { width: 0, height: 2 },
                opacity: loading ? 0.7 : 1
              }
            ]}
          >
            <Text
              style={{
                color: theme.text,
                fontSize: themeSize.md,
                fontWeight: "700"
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Text>
          </Pressable>

          <Text
            style={{
              textAlign: "center",
              width: "100%",
              marginTop: 15,
              fontSize: themeSize.sm,
              color: theme.text
            }}
          >
            Don't have an account?
            <Text style={{ color: theme.subText }} onPress={onSignupPress}>
              {" "}Sign up
            </Text>
          </Text>
        </View>
      </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;


const style = StyleSheet.create({ 
  cbg: { flex: 1, padding: 20, justifyContent: "center" }, 
  form_heading: { borderRadius: 20, width: "100%", shadowOffset: {width: 0, height: 0}, elevation: 4, padding: 15, alignItems: "center", height: "80%" }, header: { fontWeight: "800", letterSpacing: 1 }, form: { alignItems: "flex-start", width: "100%", flex: 1, marginTop: 30, gap: 10, justifyContent: "space-between", }, input: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center", padding: 15, width: "100%", gap: 10, borderRadius: 40, borderWidth: 1 }, 
  button: { width: "80%", padding: 15, alignItems: "center", borderRadius: 50, marginTop: 25, justifyContent: "center", alignSelf: "center", } })