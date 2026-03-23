import { Colors, FontSize } from '@/constants/theme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    useColorScheme,
    View,
} from 'react-native';

const options = ["Electronics", "Books", "Clothes", "Vehicle", "Sports & Fitness"];
const condition = ["NEW", "LIKE NEW", "UK USED", "GOOD", "FAIR", "USED"];

const SellScreen = () => {
  const scheme = useColorScheme();
  const themeSize = FontSize.size;
  const theme = scheme === "dark" ? Colors.dark : Colors.light;

  const [selected, setSelected] = useState("Select category");
  const [conditionSelected, setConditionSelected] = useState("NEW");
  const [visible, setVisible] = useState(false);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");

  const onCancelClicked = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.screenBackground }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, padding: 10 }}>
          {/* Sell Header Section */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderColor: "#aeaeaea1",
              borderBottomWidth: 1,
              padding: 10,
              paddingBottom: 15,
              marginBottom: 10,
            }}
          >
            <Pressable onPress={onCancelClicked} style={{ width: 50 }}>
              <Image
                source={require("../../assets/images/Sell/cancel.png")}
                style={{ tintColor: theme.text }}
              />
            </Pressable>

            <Text
              style={{
                textAlign: "center",
                flex: 1,
                color: theme.text,
                fontSize: themeSize.md,
                fontWeight: "700",
              }}
            >
              Sell Item
            </Text>

            <Pressable>
              <Text
                style={{
                  color: theme.subText,
                  fontSize: themeSize.sm,
                  fontWeight: "500",
                }}
              >
                Drafts
              </Text>
            </Pressable>
          </View>

          <ScrollView
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              width: "100%",
              gap: 10,
              paddingBottom: 40,
            }}
          >
            {/* Upload Image */}
            <View
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                backgroundColor: theme.sectionBackground,
                height: 280,
                borderRadius: 20,
                borderWidth: 2,
                borderStyle: "dotted",
                borderColor: "#9a9a9a",
              }}
            >
              <View
                style={{
                  width: 65,
                  height: 65,
                  backgroundColor: theme.iconBackground,
                  borderRadius: 50,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image source={require("../../assets/images/Sell/capture.png")} />
              </View>

              <Text
                style={{
                  color: theme.text,
                  fontSize: themeSize.md,
                  fontWeight: "600",
                  textAlign: "center",
                  marginTop: 20,
                }}
              >
                Add Photos
              </Text>

              <Text
                style={{
                  color: theme.text,
                  fontSize: themeSize.sm,
                  fontWeight: "200",
                  textAlign: "center",
                  marginTop: 5,
                }}
              >
                Up to 10 photos, First one is the cover.
              </Text>

              <Pressable
                style={{
                  width: "60%",
                  alignSelf: "center",
                  alignItems: "center",
                  marginTop: 20,
                  padding: 15,
                  backgroundColor: theme.subText,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "white", fontSize: themeSize.md }}>
                  Select Images
                </Text>
              </Pressable>
            </View>

            {/* Form */}
            <View>
              {/* Product Name */}
              <Text
                style={{
                  color: theme.text,
                  fontSize: themeSize.md,
                  marginTop: 20,
                  marginBottom: 6,
                  fontWeight: "700",
                }}
              >
                Product Name:
              </Text>

              <TextInput
                value={productName}
                onChangeText={setProductName}
                placeholder="What are you selling?"
                placeholderTextColor={"#ffffff8c"}
                style={{
                  padding: 15,
                  backgroundColor: theme.sectionBackground,
                  color: theme.text,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#9a9a9a",
                }}
              />

              {/* Category */}
              <Text
                style={{
                  color: theme.text,
                  fontSize: themeSize.md,
                  marginTop: 20,
                  marginBottom: 6,
                  fontWeight: "700",
                }}
              >
                Product Category:
              </Text>

              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  setVisible(true);
                }}
                style={{
                  borderWidth: 1,
                  padding: 15,
                  borderRadius: 20,
                  width: "100%",
                  backgroundColor: theme.sectionBackground,
                  borderColor: theme.borderColor,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={{ flex: 1, color: theme.text }}>{selected}</Text>
                <Image
                  source={require("../../assets/images/Sell/select.png")}
                  style={{ tintColor: theme.text }}
                />
              </Pressable>

              <Modal visible={visible} transparent animationType="slide">
                <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "flex-end",
                      backgroundColor: "rgba(0,0,0,0.5)",
                    }}
                  >
                    <TouchableWithoutFeedback>
                      <View
                        style={{
                          backgroundColor: scheme === "dark" ? theme.sectionBackground : "white",
                          padding: 20,
                          borderTopLeftRadius: 20,
                          borderTopRightRadius: 20,
                          maxHeight: 260,
                          borderWidth: 1,
                          borderColor: theme.borderColor,
                        }}
                      >
                        <Text
                          style={{
                            color: theme.text,
                            fontSize: themeSize.md,
                            fontWeight: "700",
                            textAlign: "center",
                            marginBottom: 10,
                          }}
                        >
                          Choose Product Category:
                        </Text>

                        <ScrollView
                          showsVerticalScrollIndicator={true}
                          keyboardShouldPersistTaps="handled"
                        >
                          {options.map((item, index) => (
                            <Pressable
                              key={index}
                              onPress={() => {
                                setSelected(item);
                                setVisible(false);
                              }}
                              style={{ paddingVertical: 12 }}
                            >
                              <Text
                                style={{
                                  color: theme.text,
                                  fontSize: themeSize.md,
                                }}
                              >
                                {item}
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>

              {/* Condition */}
              <Text
                style={{
                  color: theme.text,
                  fontSize: themeSize.md,
                  marginTop: 20,
                  marginBottom: 6,
                  fontWeight: "700",
                }}
              >
                Product Condition:
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  flexWrap: "wrap",
                  gap: 15,
                  marginTop: 5,
                  paddingLeft: 20,
                  paddingRight: 20
                }}
              >
                {condition.map((item, index) => (
                  <Pressable
                    key={index}
                    onPress={() => setConditionSelected(item)}
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      gap: 8,
                      width: "30%",
                    }}
                  >
                    <View
                      style={{
                        width: 16,
                        height: 16,
                        borderWidth: 1,
                        borderColor: theme.text,
                        backgroundColor:
                          conditionSelected === item ? theme.subText : "transparent",
                        borderRadius: 3,
                      }}
                    />
                    <Text
                      style={{
                        color: conditionSelected === item ? theme.subText : theme.text,
                        fontWeight: "600",
                      }}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Price */}
              <Text
                style={{
                  color: theme.text,
                  fontSize: themeSize.md,
                  marginTop: 25,
                  marginBottom: 6,
                  fontWeight: "700",
                }}
              >
                Price:
              </Text>
            
             <View
                  style={{
                    padding: 15,
                    backgroundColor: theme.sectionBackground,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: theme.borderColor,
                    marginBottom: 20,
                    flexDirection: "row",
                    gap: 10
                    }}
             >
                <Text style={{color: theme.text}}>₦</Text>
                <TextInput
                    value={price}
                    onChangeText={(value) => setPrice(value)}
                    placeholder="0.00"
                    placeholderTextColor={scheme==="dark" ? "#ffffff8c" : "#363535b9"}
                    keyboardType="numeric"
                    style={{ 
                    color: theme.text,
                    flex: 1
                    }}
              /> 
             </View>

            {/*Description*/}
              <Text
                style={{
                  color: theme.text,
                  fontSize: themeSize.md,
                  marginTop: 1,
                  marginBottom: 6,
                  fontWeight: "700",
                }}
              >
                Product Description:
              </Text>
              <TextInput 
                multiline={true}
                numberOfLines={4}
                placeholder='Descibe what you are selling, include details like size, color, and any defects'
                placeholderTextColor={scheme==="dark" ? "#ffffff8c" : "#363535b9"}
                style={{
                    borderWidth: 1,
                    maxHeight: 150,
                    minHeight: 100,
                    borderColor: theme.borderColor,
                    borderRadius: 20,
                    padding: 15,
                    color: theme.text
                }}
              />


            {/* Condition */}
            <Text
                style={{
                  color: theme.text,
                  fontSize: themeSize.md,
                  marginTop: 20,
                  marginBottom: 6,
                  fontWeight: "700",
                }}
              >
                Location:
            </Text>
            
            <View
                  style={{
                    padding: 15,
                    backgroundColor: theme.sectionBackground,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: theme.borderColor,
                    marginBottom: 20,
                    flexDirection: "row",
                    gap: 10
                    }}
             >
                <Image source={require("../../assets/images/Sell/location.png")} style={{tintColor: theme.borderColor}} />
                <TextInput

                    placeholder="Enter city or Zip code"
                    placeholderTextColor={scheme==="dark" ? "#ffffff8c" : "#363535b9"}
                    style={{ 
                    color: theme.text,
                    flex: 1
                    }}
              /> 
             </View>
              <Image source={require("../../assets/images/Sell/map.png")} />


            </View>

            {/** Sell Button */}
            <Pressable

                style={{backgroundColor:  theme.subText, padding: 15, width: "80%" , marginTop: 25,
                    borderRadius: 20, alignItems: "center", alignSelf: "center"
                }}
            >
                <Text style={{color: "white", fontSize: themeSize.md, fontWeight: "600"}}>Sell Product</Text>
            </Pressable>
            <Text style={{fontSize: themeSize.sm, color: theme.text, textAlign: "center", fontWeight: "300"}}>By posting, you agree to our <Text style={{color: theme.subText}}>Terms of Services</Text> and Community Guidelines</Text>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SellScreen;