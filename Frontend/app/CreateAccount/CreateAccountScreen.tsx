import { Colors, FontSize } from '@/constants/theme';
import { registerUser } from '@/src/services/authApi';
import { saveToken } from '@/src/services/authStorage';
import { userStore } from '@/src/store/userStore';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

// ─── Brand colours (mirrors LoginScreen) ─────────────────────────────────────
const GREEN        = "#008100";
const GREEN_LIGHT  = "#00a300";
const GREEN_SUBTLE = "#e6f4e6";
const DARK_BG      = "#0d150d";
const DARK_CARD    = "#111e11";
const DARK_BORDER  = "rgba(0,180,0,0.18)";

// ─── Reusable field component ─────────────────────────────────────────────────
const Field = ({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  secure,
  keyboardType,
  autoCapitalize,
  isDark,
  rightElement,
  isValid,
  isTouched,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  icon: string;
  secure?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  isDark: boolean;
  rightElement?: React.ReactNode;
  isValid?: boolean;
  isTouched?: boolean;
}) => {
  const showStatus = isTouched && value.length > 0;
  return (
    <View style={{ width: "100%", marginBottom: 14 }}>
      <Text style={[f.label, { color: isDark ? "#9aba9a" : "#3a5a3a" }]}>{label}</Text>
      <View style={[f.row, {
        backgroundColor: isDark ? "#152015" : GREEN_SUBTLE,
        borderColor: showStatus
          ? isValid ? GREEN : "#e53935"
          : isDark ? DARK_BORDER : "rgba(0,129,0,0.15)",
      }]}>
        <Text style={f.icon}>{icon}</Text>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={isDark ? "#3a5a3a" : "#9aba9a"}
          style={[f.input, { color: isDark ? "#e0ffe0" : "#0d1a0d" }]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? "sentences"}
        />
        {rightElement}
        {showStatus && (
          <Text style={{ fontSize: 14, marginLeft: 4 }}>
            {isValid ? "✅" : "❌"}
          </Text>
        )}
      </View>
    </View>
  );
};

const f = StyleSheet.create({
  label: { fontSize: 11, fontWeight: "700", letterSpacing: 0.9, marginBottom: 7, textTransform: "uppercase" },
  row: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 13, gap: 10,
  },
  icon:  { fontSize: 15 },
  input: { flex: 1, fontSize: 14 },
});

// ─── Password strength bar ────────────────────────────────────────────────────
const StrengthBar = ({ password }: { password: string }) => {
  const score = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8)          s++;
    if (/[A-Z]/.test(password))        s++;
    if (/[0-9]/.test(password))        s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#e53935", "#fb8c00", "#fdd835", GREEN];

  if (!password) return null;
  return (
    <View style={{ width: "100%", marginTop: -8, marginBottom: 10 }}>
      <View style={{ flexDirection: "row", gap: 5, marginBottom: 5 }}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            backgroundColor: i <= score ? colors[score] : "rgba(100,100,100,0.2)",
          }} />
        ))}
      </View>
      <Text style={{ fontSize: 11, color: colors[score], fontWeight: "600" }}>
        {labels[score]}
      </Text>
    </View>
  );
};

// ─── Progress dots ────────────────────────────────────────────────────────────
const StepDots = ({ current, total }: { current: number; total: number }) => (
  <View style={{ flexDirection: "row", gap: 6, marginBottom: 22, alignSelf: "flex-start" }}>
    {Array.from({ length: total }).map((_, i) => (
      <View key={i} style={{
        width: i === current ? 22 : 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: i <= current ? GREEN : "rgba(0,129,0,0.2)",
      }} />
    ))}
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────
const CreateAccountScreen = () => {
  const { full_name, email, setFullName, setEmail } = userStore();

  const scheme  = useColorScheme();
  const isDark  = scheme === "dark";
  const themeSize = FontSize.size;
  const theme   = isDark ? Colors.dark : Colors.light;

  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);

  // Touch tracking for inline validation
  const [touched, setTouched] = useState({
    name: false, email: false, pass: false, confirm: false,
  });

  const isEmailValid   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPassValid    = password.length >= 8;
  const isConfirmValid = confirmPassword === password && confirmPassword.length > 0;
  const isNameValid    = full_name.trim().length >= 2;

  const filledCount = [isNameValid, isEmailValid, isPassValid, isConfirmValid].filter(Boolean).length;

  // Button animation
  const btnScale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1,    useNativeDriver: true }).start();

  const handleRegister = async () => {
    setTouched({ name: true, email: true, pass: true, confirm: true });

    if (!full_name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Validation Error", "Please fill all fields");
      return;
    }
    if (!isEmailValid) {
      Alert.alert("Validation Error", "Please enter a valid email");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match");
      return;
    }
    if (!isPassValid) {
      Alert.alert("Validation Error", "Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      const response = await registerUser({
        fullName: full_name.trim(),
        email:    email.trim(),
        password: password.trim(),
      });
      await saveToken(response.token);
      Alert.alert("Success", "Account created successfully");
      router.replace({ pathname: "/CreateAccount/RoleScreen" });
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: isDark ? DARK_BG : "#f4faf4" , paddingTop: 25}]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Background rings */}
      <View style={s.bgPattern} pointerEvents="none">
        {[...Array(5)].map((_, i) => (
          <View key={i} style={[s.hexRing, {
            width:  100 + i * 90,
            height: 100 + i * 90,
            borderRadius: 50 + i * 45,
            borderColor: isDark
              ? `rgba(0,180,0,${0.05 - i * 0.007})`
              : `rgba(0,129,0,${0.06 - i * 0.009})`,
          }]} />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
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

        {/* Card */}
        <View style={[s.card, {
          backgroundColor: isDark ? DARK_CARD : "#fff",
          borderColor: isDark ? DARK_BORDER : "rgba(0,129,0,0.1)",
          shadowColor: isDark ? GREEN : "#000",
        }]}>
          <StepDots current={filledCount - 1 < 0 ? 0 : filledCount - 1} total={4} />

          <Text style={[s.cardTitle, { color: isDark ? "#d0ffd0" : "#0d1a0d" }]}>
            Create Account
          </Text>
          <Text style={[s.cardSub, { color: isDark ? "#5a7a5a" : "#7a9a7a" }]}>
            The exclusive marketplace for students
          </Text>

          {/* Full name */}
          <Field
            label="Full Name"
            placeholder="John Doe"
            value={full_name}
            onChangeText={(t) => { setFullName(t); setTouched(p => ({ ...p, name: true })); }}
            icon="👤"
            isDark={isDark}
            isValid={isNameValid}
            isTouched={touched.name}
          />

          {/* Email */}
          <Field
            label="Email"
            placeholder="example@gmail.com"
            value={email}
            onChangeText={(t) => { setEmail(t); setTouched(p => ({ ...p, email: true })); }}
            icon="✉"
            keyboardType="email-address"
            autoCapitalize="none"
            isDark={isDark}
            isValid={isEmailValid}
            isTouched={touched.email}
          />

          {/* Password */}
          <Field
            label="Password"
            placeholder="Min. 8 characters"
            value={password}
            onChangeText={(t) => { setPassword(t); setTouched(p => ({ ...p, pass: true })); }}
            icon="🔒"
            secure={!showPass}
            isDark={isDark}
            isValid={isPassValid}
            isTouched={touched.pass}
            rightElement={
              <Pressable onPress={() => setShowPass(p => !p)} hitSlop={10}>
                <Text style={{ fontSize: 15 }}>{showPass ? "👁" : "🙈"}</Text>
              </Pressable>
            }
          />
          <StrengthBar password={password} />

          {/* Confirm password */}
          <Field
            label="Confirm Password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChangeText={(t) => { setConfirmPassword(t); setTouched(p => ({ ...p, confirm: true })); }}
            icon="🔒"
            secure={!showConfirm}
            isDark={isDark}
            isValid={isConfirmValid}
            isTouched={touched.confirm}
            rightElement={
              <Pressable onPress={() => setShowConfirm(p => !p)} hitSlop={10}>
                <Text style={{ fontSize: 15 }}>{showConfirm ? "👁" : "🙈"}</Text>
              </Pressable>
            }
          />

          {/* Terms note */}
          <Text style={[s.terms, { color: isDark ? "#3a5a3a" : "#8aaa8a" }]}>
            By creating an account you agree to our{" "}
            <Text style={{ color: GREEN_LIGHT, fontWeight: "700" }}>Terms of Service</Text>
            {" "}and{" "}
            <Text style={{ color: GREEN_LIGHT, fontWeight: "700" }}>Privacy Policy</Text>.
          </Text>

          {/* Create account button */}
          <Animated.View style={{ transform: [{ scale: btnScale }], marginTop: 6 }}>
            <Pressable
              onPress={handleRegister}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={loading}
              style={[s.createBtn, { opacity: loading ? 0.75 : 1 }]}
            >
              <View style={s.btnShimmer} />
              <Text style={s.createBtnText}>
                {loading ? "Creating account…" : "Create Account"}
              </Text>
            </Pressable>
          </Animated.View>

          {/* Divider */}
          <View style={s.dividerRow}>
            <View style={[s.dividerLine, { backgroundColor: isDark ? "#1e331e" : "#d4ecd4" }]} />
            <Text style={[s.dividerText, { color: isDark ? "#3a5a3a" : "#9aba9a" }]}>or</Text>
            <View style={[s.dividerLine, { backgroundColor: isDark ? "#1e331e" : "#d4ecd4" }]} />
          </View>

          {/* Login link */}
          <View style={s.loginRow}>
            <Text style={[s.loginPrompt, { color: isDark ? "#5a7a5a" : "#7a9a7a" }]}>
              Already have an account?
            </Text>
            <Pressable onPress={() => router.replace("/Login/LoginScreen")}>
              <Text style={[s.loginLink, { color: GREEN_LIGHT }]}> Log in</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateAccountScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },
  scroll: { alignItems: "center", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },

  bgPattern: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  hexRing:   { position: "absolute", borderWidth: 1 },

  logoWrap: { alignItems: "center", marginBottom: 26 },
  logoRing: {
    width: 72, height: 72, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
    shadowOpacity: 0.28, shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 }, elevation: 10,
    marginBottom: 10,
  },
  logoImg: { width: 44, height: 44 },
  brand:   { fontSize: 26, fontWeight: "900", letterSpacing: -0.5 },
  tagline: { fontSize: 12, fontWeight: "500", marginTop: 2, letterSpacing: 0.4 },

  card: {
    width: "100%", borderRadius: 24, borderWidth: 1,
    padding: 24,
    shadowOpacity: 0.07, shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 }, elevation: 8,
  },
  cardTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3, marginBottom: 4 },
  cardSub:   { fontSize: 13, marginBottom: 22 },

  terms: { fontSize: 11, lineHeight: 17, marginBottom: 18, textAlign: "center" },

  createBtn: {
    backgroundColor: GREEN,
    borderRadius: 16, paddingVertical: 16,
    alignItems: "center", overflow: "hidden", position: "relative",
  },
  btnShimmer: {
    position: "absolute", top: 0, left: "10%",
    width: "30%", height: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    transform: [{ skewX: "-20deg" }],
  },
  createBtnText: { color: "#fff", fontWeight: "800", fontSize: 15, letterSpacing: 0.4 },

  dividerRow: { flexDirection: "row", alignItems: "center", marginTop: 20, marginBottom: 16, gap: 10 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, fontWeight: "600" },

  loginRow:    { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  loginPrompt: { fontSize: 13 },
  loginLink:   { fontSize: 13, fontWeight: "700" },
});