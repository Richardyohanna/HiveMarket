import { Colors, FontSize } from '@/constants/theme';
import { chatSocketService } from '@/src/api/chatSocket';
import { getUserData } from '@/src/api/userApi';
import { loginUser } from "@/src/services/authApi";
import { userStore } from '@/src/store/userStore';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from 'react-native';

//import HivemarketWebSocket from '../../src/api/Hivemarketwebsocket';

// ─── Brand colours ────────────────────────────────────────────────────────────
const GREEN        = "#008100";
const GREEN_LIGHT  = "#00a300";
const GREEN_GLOW   = "rgba(0,129,0,0.18)";
const GREEN_SUBTLE = "#e6f4e6";
const DARK_BG      = "#0d150d";
const DARK_CARD    = "#111e11";
const DARK_BORDER  = "rgba(0,180,0,0.18)";

// ─── Forgot-password modal ────────────────────────────────────────────────────
const ForgotPasswordModal = ({
  visible,
  isDark,
  onClose,
}: {
  visible: boolean;
  isDark: boolean;
  onClose: () => void;
}) => {
  const [resetEmail, setResetEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!resetEmail.trim()) {
      Alert.alert("Enter your email", "Please type the email linked to your account.");
      return;
    }
    setSending(true);
    // TODO: wire up your real reset API here
    await new Promise(r => setTimeout(r, 1400));
    
    setSending(false);
    setSent(true);
  };

  const handleClose = () => {
    setSent(false);
    setResetEmail("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={modal.overlay}>
          <TouchableWithoutFeedback>
            <View style={[modal.card, {
              backgroundColor: isDark ? DARK_CARD : "#fff",
              borderColor: isDark ? DARK_BORDER : "rgba(0,129,0,0.12)",
            }]}>
              {/* Decorative top bar */}
              <View style={modal.topAccent} />

              <Text style={[modal.title, { color: isDark ? "#e8ffe8" : "#0d1a0d" }]}>
                Reset Password
              </Text>

              {sent ? (
                <View style={modal.sentWrap}>
                  <Text style={modal.sentIcon}>✉️</Text>
                  <Text style={[modal.sentTitle, { color: isDark ? "#c8ffc8" : GREEN }]}>
                    Check your inbox
                  </Text>
                  <Text style={[modal.sentBody, { color: isDark ? "#9bbf9b" : "#4a7a4a" }]}>
                    We sent a reset link to{"\n"}
                    <Text style={{ fontWeight: "700" }}>{resetEmail}</Text>
                  </Text>
                  <Pressable style={modal.doneBtn} onPress={handleClose}>
                    <Text style={modal.doneBtnText}>Done</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <Text style={[modal.body, { color: isDark ? "#8aaa8a" : "#5a7a5a" }]}>
                    Enter your account email and we'll send you a link to reset your password.
                  </Text>

                  <View style={[modal.inputWrap, {
                    backgroundColor: isDark ? "#1a2e1a" : GREEN_SUBTLE,
                    borderColor: isDark ? DARK_BORDER : "rgba(0,129,0,0.2)",
                  }]}>
                    <Text style={modal.inputIcon}>✉</Text>
                    <TextInput
                      value={resetEmail}
                      onChangeText={setResetEmail}
                      placeholder="your@email.com"
                      placeholderTextColor={isDark ? "#4a6a4a" : "#9ab89a"}
                      style={[modal.input, { color: isDark ? "#e0ffe0" : "#0d1a0d" }]}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <Pressable
                    onPress={handleSend}
                    disabled={sending}
                    style={[modal.sendBtn, { opacity: sending ? 0.7 : 1 }]}
                  >
                    <Text style={modal.sendBtnText}>
                      {sending ? "Sending…" : "Send Reset Link"}
                    </Text>
                  </Pressable>

                  <Pressable onPress={handleClose}>
                    <Text style={[modal.cancel, { color: isDark ? "#5a7a5a" : "#7a9a7a" }]}>
                      Cancel
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ─── Login Screen ─────────────────────────────────────────────────────────────
const LoginScreen = () => {

   /*
  const user = userStore.getState();

  const email = user.email;
  const setEmail = user.setEmail;
  const setFullName = user.setFullName;
  const setProfilePicture = user.setProfilePicture;
  const setCampus = user.setCampus;
  const setLocation = user.setLocation;
  const setUniversity = user.setUniversity;
  const setGender = user.setGender;
  const setRole = user.setRole;
  const setUserId = user.setUserId;

   */
 
  const {
    email,
    setEmail,
    setFullName,
    setProfilePicture,
    setCampus,
    setLocation,
    setUniversity,
    setGender,
    setRole,
    setUserId,
  } = userStore();

  
  const scheme  = useColorScheme();
  const isDark  = scheme === "dark";
  const themeSize = FontSize.size;
  const theme   = isDark ? Colors.dark : Colors.light;

  const [password,       setPassword]       = useState("");
  const [loading,        setLoading]        = useState(false);
  const [showPassword,   setShowPassword]   = useState(false);
  const [forgotVisible,  setForgotVisible]  = useState(false);

  // Subtle press animation for the button
  const btnScale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please enter email and password");
      return;
    }
    try {
      setLoading(true);
      await loginUser({ email: email.trim(), password: password.trim() }).then(() => {
        if (!email) return;
        getUserData(email, async (data) => {
          if (data) {
            setUserId(data.id);
            setFullName(data.full_name);
            setProfilePicture(data.profile_picture);
            setCampus(data.campus);
            setUniversity(data.university);
            setLocation(data.location);
            setGender(data.gender);

            if (data.role) setRole(data.role);

            //THis will exit the connections if the user data.id is null
            if(data.id == null ) return;

            await chatSocketService.connect(data.id).then(() => {
              console.log("[Login] WebSocket connection established for user:", data.id);
            });

            console.log(
            "[Login] WebSocket connected for:",
            data.id
            );

          }
        }).then(() => {
          router.replace({ pathname: "/HomeScreen" });
        });
      });
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: isDark ? DARK_BG : "#f4faf4" , paddingTop: 25}]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={s.inner}>

          {/* ── Background hex pattern ── */}
          <View style={s.bgPattern} pointerEvents="none">
            {[...Array(6)].map((_, i) => (
              <View
                key={i}
                style={[s.hexRing, {
                  width:  120 + i * 80,
                  height: 120 + i * 80,
                  borderRadius: 60 + i * 40,
                  borderColor: isDark
                    ? `rgba(0,180,0,${0.06 - i * 0.008})`
                    : `rgba(0,129,0,${0.07 - i * 0.01})`,
                }]}
              />
            ))}
          </View>

          {/* ── Logo + wordmark ── */}
          <View style={s.logoWrap}>
            <View style={[s.logoRing, {
              backgroundColor: isDark ? "#0a1f0a" : "#fff",
              shadowColor: GREEN,
              borderColor: isDark ? DARK_BORDER : "rgba(0,129,0,0.15)",
            }]}>
              <Image
                source={require("../../assets/images/favicon.png")}
                style={s.logoImg}
                resizeMode="contain"
              />
            </View>
            <Text style={[s.brand, { color: isDark ? "#e8ffe8" : "#0d1a0d" }]}>
              Hive<Text style={{ color: GREEN }}>Market</Text>
            </Text>
            <Text style={[s.tagline, { color: isDark ? "#5a8a5a" : "#6a9a6a" }]}>
              Your campus marketplace
            </Text>
          </View>

          {/* ── Card ── */}
          <View style={[s.card, {
            backgroundColor: isDark ? DARK_CARD : "#fff",
            borderColor: isDark ? DARK_BORDER : "rgba(0,129,0,0.1)",
            shadowColor: isDark ? GREEN : "#000",
          }]}>
            <Text style={[s.cardTitle, { color: isDark ? "#d0ffd0" : "#0d1a0d" }]}>
              Welcome back
            </Text>
            <Text style={[s.cardSub, { color: isDark ? "#5a7a5a" : "#7a9a7a" }]}>
              Sign in to continue
            </Text>

            {/* Email */}
            <Text style={[s.label, { color: isDark ? "#9aba9a" : "#3a5a3a" }]}>Email</Text>
            <View style={[s.inputRow, {
              backgroundColor: isDark ? "#152015" : GREEN_SUBTLE,
              borderColor: isDark ? DARK_BORDER : "rgba(0,129,0,0.15)",
            }]}>
              <Text style={s.inputIcon}>✉</Text>
              <TextInput
                placeholder="example@gmail.com"
                placeholderTextColor={isDark ? "#3a5a3a" : "#9aba9a"}
                style={[s.textInput, { color: isDark ? "#e0ffe0" : "#0d1a0d" }]}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password */}
            <Text style={[s.label, { color: isDark ? "#9aba9a" : "#3a5a3a", marginTop: 14 }]}>Password</Text>
            <View style={[s.inputRow, {
              backgroundColor: isDark ? "#152015" : GREEN_SUBTLE,
              borderColor: isDark ? DARK_BORDER : "rgba(0,129,0,0.15)",
            }]}>
              <Text style={s.inputIcon}>🔒</Text>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor={isDark ? "#3a5a3a" : "#9aba9a"}
                style={[s.textInput, { color: isDark ? "#e0ffe0" : "#0d1a0d" }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(p => !p)} hitSlop={10}>
                <Text style={s.eyeIcon}>{showPassword ? "👁" : "🙈"}</Text>
              </Pressable>
            </View>

            {/* Forgot password */}
            <Pressable
              onPress={() => setForgotVisible(true)}
              style={s.forgotWrap}
            >
              <Text style={[s.forgotText, { color: GREEN_LIGHT }]}>
                Forgot password?
              </Text>
            </Pressable>

            {/* Sign in button */}
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <Pressable
                onPress={handleLogin}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                disabled={loading}
                style={[s.signInBtn, { opacity: loading ? 0.75 : 1 }]}
              >
                {/* Shimmer strip */}
                <View style={s.btnShimmer} />
                <Text style={s.signInText}>
                  {loading ? "Signing in…" : "Sign In"}
                </Text>
              </Pressable>
            </Animated.View>

            {/* Divider */}
            <View style={s.dividerRow}>
              <View style={[s.dividerLine, { backgroundColor: isDark ? "#1e331e" : "#d4ecd4" }]} />
              <Text style={[s.dividerText, { color: isDark ? "#3a5a3a" : "#9aba9a" }]}>or</Text>
              <View style={[s.dividerLine, { backgroundColor: isDark ? "#1e331e" : "#d4ecd4" }]} />
            </View>

            {/* Sign up */}
            <View style={s.signupRow}>
              <Text style={[s.signupPrompt, { color: isDark ? "#5a7a5a" : "#7a9a7a" }]}>
                Don't have an account?
              </Text>
              <Pressable onPress={() => router.replace("/CreateAccount/CreateAccountScreen")}>
                <Text style={[s.signupLink, { color: GREEN_LIGHT }]}> Sign up</Text>
              </Pressable>
            </View>
          </View>

        </View>
      </TouchableWithoutFeedback>

      {/* Forgot password modal */}
      <ForgotPasswordModal
        visible={forgotVisible}
        isDark={isDark}
        onClose={() => setForgotVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:  { flex: 1 },
  inner: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },

  // Background rings
  bgPattern: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  hexRing: {
    position: "absolute",
    borderWidth: 1,
  },

  // Logo
  logoWrap: { alignItems: "center", marginBottom: 28 },
  logoRing: {
    width: 78,
    height: 78,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
    marginBottom: 12,
  },
  logoImg:  { width: 48, height: 48 },
  brand:    { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  tagline:  { fontSize: 12, fontWeight: "500", marginTop: 2, letterSpacing: 0.4 },

  // Card
  card: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  cardTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  cardSub:   { fontSize: 13, marginTop: 3, marginBottom: 20 },

  // Labels & inputs
  label: { fontSize: 12, fontWeight: "700", letterSpacing: 0.8, marginBottom: 6, textTransform: "uppercase" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  inputIcon: { fontSize: 15 },
  textInput: { flex: 1, fontSize: 14 },
  eyeIcon:   { fontSize: 16 },

  // Forgot
  forgotWrap: { alignSelf: "flex-end", marginTop: 10, marginBottom: 20 },
  forgotText: { fontSize: 13, fontWeight: "600" },

  // Sign-in button
  signInBtn: {
    backgroundColor: GREEN,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  btnShimmer: {
    position: "absolute",
    top: 0,
    left: "10%",
    width: "30%",
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    transform: [{ skewX: "-20deg" }],
  },
  signInText: { color: "#fff", fontWeight: "800", fontSize: 15, letterSpacing: 0.4 },

  // Divider
  dividerRow: { flexDirection: "row", alignItems: "center", marginTop: 20, marginBottom: 16, gap: 10 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, fontWeight: "600" },

  // Sign up
  signupRow:    { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  signupPrompt: { fontSize: 13 },
  signupLink:   { fontSize: 13, fontWeight: "700" },
});

// ─── Modal styles ─────────────────────────────────────────────────────────────
const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    shadowColor: GREEN,
    shadowOpacity: 0.15,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    overflow: "hidden",
  },
  topAccent: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 4,
    backgroundColor: GREEN,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 8, marginTop: 8 },
  body:  { fontSize: 13, lineHeight: 20, marginBottom: 20 },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
    marginBottom: 18,
  },
  inputIcon: { fontSize: 15, color: GREEN },
  input:     { flex: 1, fontSize: 14 },

  sendBtn: {
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 14,
  },
  sendBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  cancel: { textAlign: "center", fontSize: 13, fontWeight: "600" },

  // Sent state
  sentWrap:  { alignItems: "center", paddingVertical: 10 },
  sentIcon:  { fontSize: 44, marginBottom: 12 },
  sentTitle: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
  sentBody:  { fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  doneBtn: {
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  doneBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});