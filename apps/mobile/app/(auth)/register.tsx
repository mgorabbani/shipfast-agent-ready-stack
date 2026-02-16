import { useState } from "react"
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native"
import { Link } from "expo-router"
import { useAuth } from "../../lib/auth"

export default function RegisterScreen() {
  const { register } = useAuth()
  const [form, setForm] = useState({ email: "", username: "", password: "", firstName: "", lastName: "" })
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    setLoading(true)
    try {
      await register(form)
    } catch (err: any) {
      Alert.alert("Error", err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      {(["firstName", "lastName", "username", "email", "password"] as const).map((field) => (
        <TextInput
          key={field}
          style={styles.input}
          placeholder={field === "firstName" ? "First Name" : field === "lastName" ? "Last Name" : field.charAt(0).toUpperCase() + field.slice(1)}
          value={form[field]}
          onChangeText={(text) => setForm((prev) => ({ ...prev, [field]: text }))}
          secureTextEntry={field === "password"}
          autoCapitalize={field === "email" || field === "username" ? "none" : "words"}
          keyboardType={field === "email" ? "email-address" : "default"}
        />
      ))}
      <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Creating..." : "Create Account"}</Text>
      </Pressable>
      <Link href="/(auth)/login" style={styles.link}>
        Already have an account? Sign In
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 32, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 14, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: "#111", borderRadius: 8, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { marginTop: 20, textAlign: "center", color: "#666" },
})
