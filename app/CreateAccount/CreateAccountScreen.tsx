import { Colors, FontSize } from '@/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, useColorScheme, View } from 'react-native';

const CreateAccountScreen = () => {

  const scheme = useColorScheme();
  const themeSize = FontSize.size;
  const theme = scheme === "dark" ? Colors.dark : Colors.light

  const onLogin = () => {
    router.replace("/Login/LoginScreen")
  }

  return (
    <View style={style.cbg}>
      <View style={[
        style.form_heading, 
        {
          shadowColor: theme.text, 
          shadowOpacity: scheme ==="dark" ? 0.5 : 0.2,
          shadowRadius: scheme ==="dark" ? 10 : 7,  
          backgroundColor: theme.background 
          }]}
          >

        <Image source={require("../../assets/images/favicon.png")} style = {{width: 100, height: 80}}/>
        <Text style={[style.header, {color: theme.text, fontSize: themeSize.xlg_md, marginTop: -15}]}>Create Accunt</Text>
        <Text style={{color: theme.text, marginTop: 5}}>The exclusive marketplace for students</Text>
        
        <View style={style.form} >

          {/** Full Name */}
          <Text style={{color: theme.text, fontSize: themeSize.md, fontWeight: "700", letterSpacing: 1}}>Full Name</Text>
          <View style={
            [
              style.input, 
              {
                backgroundColor: scheme === "dark" ? "rgba(200,200,200, 0.2)" : "rgba(200,200,200, 0.2)",
                borderColor: scheme === "dark" ? "rgba(200,200,200, 0.2)" : "rgba(100,100,100, 0.2)"}
                ]}>
            <Image source={require("../../assets/images/CreateAccount/fullname.png")} style={{tintColor: "#888686ca"}}/>
            <TextInput 
              placeholder='Full Name'
            />           
          </View>

          {/** Email */}
          <Text style={{color: theme.text, fontSize: themeSize.md, fontWeight: "700", letterSpacing: 1, marginTop: 10}}>Email</Text>
          <View style={
            [
              style.input, 
              {
                backgroundColor: scheme === "dark" ? "rgba(200,200,200, 0.2)" : "rgba(200,200,200, 0.2)",
                borderColor: scheme === "dark" ? "rgba(200,200,200, 0.2)" : "rgba(100,100,100, 0.2)"}
                ]}>
            <Image source={require("../../assets/images/CreateAccount/email.png")} style={{tintColor: "#888686ca"}}/>
            <TextInput 
              placeholder='example@gmail.com'
            />           
          </View>
        


          {/** password */}
          <Text style={{color: theme.text, fontSize: themeSize.md, fontWeight: "700", letterSpacing: 1, marginTop: 10}}>Password</Text>
          <View style={
            [
              style.input, 
              {
                backgroundColor: scheme === "dark" ? "rgba(200,200,200, 0.2)" : "rgba(200,200,200, 0.2)",
                borderColor: scheme === "dark" ? "rgba(200,200,200, 0.2)" : "rgba(100,100,100, 0.2)"}
                ]}>
            <Image source={require("../../assets/images/CreateAccount/password.png")} style={{tintColor: "#888686ca"}}/>
            <TextInput 
              placeholder='create your password'
              style={{flex: 1}}
            />  
            <Image source={require("../../assets/images/CreateAccount/eye.png")} style={{width: 23, height: 23, tintColor: "#888686ca"}} />    
          </View>

        {/** confirmPassword */}
          <Text style={{color: theme.text, fontSize: themeSize.md, fontWeight: "700", letterSpacing: 1, marginTop: 10}}>Confirm Password</Text>
          <View style={
            [
              style.input, 
              {
                backgroundColor: scheme === "dark" ? "rgba(200,200,200, 0.2)" : "rgba(200,200,200, 0.2)",
                borderColor: scheme === "dark" ? "rgba(200,200,200, 0.2)" : "rgba(100,100,100, 0.2)"}
                ]}>
            <Image source={require("../../assets/images/CreateAccount/password.png")}  style={{tintColor: "#888686ca"}}/>
            <TextInput 
              placeholder='confirm your password'
              style={{flex: 1}}
            />  
            <Image source={require("../../assets/images/CreateAccount/eye-off.png")} style={{width: 23, height: 23, tintColor: "#888686ca" }}/>    
          </View>

          {/** Create Accoount Button */}

          <Pressable style={[
            style.button,
            {
              backgroundColor: theme.subText,
              shadowColor: scheme === "dark" ? "#96fea0": "#1a321c", 
              shadowOpacity: scheme === "dark" ?  0.5: 0.7,
              shadowRadius: scheme === "dark" ? 5: 3,
              shadowOffset: {width: 0, height: 2}
          }]}>
            <Text style={{color: theme.text, fontSize: themeSize.md, fontWeight: "700"}}>Create Account</Text>
          </Pressable>

          <Text style={{textAlign: "center", width: "100%", marginTop: 15, fontSize: themeSize.sm, color: theme.text}}> Already have an account? <Text style={{color: theme.subText}} onPress={onLogin}> Login </Text></Text>
          <Text style={{fontSize: themeSize.xsm, textAlign: "center", color: theme.text, marginTop: 6}}>By creating an account, you agree to Hive<Text >Market's </Text><Text style={{color: theme.subText, }}>Terms of Service</Text> and <Text style={{color: theme.subText, }}>Privacy Policy</Text></Text>
        </View>
        
      </View>   
      
    </View>
  )
}

export default CreateAccountScreen;

const style = StyleSheet.create({
  cbg: {
    flex: 1,
    padding: 20,
   
  },

  form_heading: {
    borderRadius: 20,
    width: "100%",
    
    shadowOffset: {width: 0, height:  0},    
    elevation: 4,
    padding: 15,
    alignItems: "center",
    flex: 1,
    
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