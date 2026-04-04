import { Colors, FontSize } from '@/constants/theme';
import { registerUser } from '@/src/services/authApi';
import { saveToken } from '@/src/services/authStorage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
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

const CreateAccountScreen = () => {
  const scheme = useColorScheme();
  const themeSize = FontSize.size;
  const theme = scheme === "dark" ? Colors.dark : Colors.light;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = () => {
    router.replace("/Login/LoginScreen");
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Validation Error", "Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      await saveToken(response.token);

      Alert.alert("Success", "Account created successfully");

      router.replace("/");
      // change to your app home route
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={style.cbg} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TouchableWithoutFeedback  >
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[ style.form_heading,{ flexGrow: 1 }]} keyboardShouldPersistTaps="handled"
        style={[
         
          {
            //shadowColor: theme.text,
           // shadowOpacity: scheme === "dark" ? 0.5 : 0.2,
            //shadowRadius: scheme === "dark" ? 10 : 7,
            backgroundColor: theme.background
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
          Create Account
        </Text>

        <Text style={{ color: theme.text, marginTop: 5 }}>
          The exclusive marketplace for students
        </Text>

        <View style={style.form}>
          <Text style={{ color: theme.text, fontSize: themeSize.md, fontWeight: "700" }}>
            Full Name
          </Text>
          <View style={[style.input, inputStyle(scheme)]}>
            <Image
              source={require("../../assets/images/CreateAccount/fullname.png")}
              style={{ tintColor: "#888686ca" }}
            />
            <TextInput
              placeholder="Full Name"
              placeholderTextColor={scheme === "dark" ? "#aaa" : "#666"}
              style={{ flex: 1, color: theme.text }}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <Text style={{ color: theme.text, fontSize: themeSize.md, fontWeight: "700", marginTop: 10 }}>
            Email
          </Text>
          <View style={[style.input, inputStyle(scheme)]}>
            <Image
              source={require("../../assets/images/CreateAccount/email.png")}
              style={{ tintColor: "#888686ca" }}
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

          <Text style={{ color: theme.text, fontSize: themeSize.md, fontWeight: "700", marginTop: 10 }}>
            Password
          </Text>
          <View style={[style.input, inputStyle(scheme)]}>
            <Image
              source={require("../../assets/images/CreateAccount/password.png")}
              style={{ tintColor: "#888686ca" }}
            />
            <TextInput
              placeholder="Create your password"
              placeholderTextColor={scheme === "dark" ? "#aaa" : "#666"}
              style={{ flex: 1, color: theme.text }}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Text style={{ color: theme.text, fontSize: themeSize.md, fontWeight: "700", marginTop: 10 }}>
            Confirm Password
          </Text>
          <View style={[style.input, inputStyle(scheme)]}>
            <Image
              source={require("../../assets/images/CreateAccount/password.png")}
              style={{ tintColor: "#888686ca" }}
            />
            <TextInput
              placeholder="Confirm your password"
              placeholderTextColor={scheme === "dark" ? "#aaa" : "#666"}
              style={{ flex: 1, color: theme.text }}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <Pressable
            onPress={handleRegister}
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
            <Text style={{ color: theme.text, fontSize: themeSize.md, fontWeight: "700" }}>
              {loading ? "Creating..." : "Create Account"}
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
            Already have an account?
            <Text style={{ color: theme.subText }} onPress={onLogin}>
              {" "}Login
            </Text>
          </Text>
        </View>
      </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const inputStyle = (scheme: string | null | undefined) => ({
  backgroundColor: "rgba(200,200,200, 0.2)",
  borderColor: scheme === "dark"
    ? "rgba(200,200,200, 0.2)"
    : "rgba(100,100,100, 0.2)"
});

export default CreateAccountScreen;

const style = StyleSheet.create({
  cbg: {
    flex: 1,
    padding: 20,
   
  },

  form_heading: {
    borderRadius: 20,
    width: "100%",
    

    padding: 15,
    alignItems: "center",
   
    
  },
  header: {
    fontWeight: "800",
    letterSpacing: 2
  },
  form: {
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    flex: 1,
    marginTop: 30,
    gap: 10
  },
  input: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 10,
    width: "100%",
    gap: 10,
    borderRadius: 40,
    borderWidth: 1
  },
  button: {
    width: "80%",
    padding: 15,
    alignItems: "center",
    borderRadius: 50,
    marginTop: 25,
    justifyContent: "center",
    alignSelf: "center",
    
  }
  
})