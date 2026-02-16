import { View, Text, Pressable, StyleSheet } from "react-native"
import { useAuth } from "../../../lib/auth"
import { PageContainer } from "../../../components/PageContainer"

export default function DashboardScreen() {
  const { user, logout } = useAuth()

  return (
    <PageContainer>
      <Text style={styles.greeting}>Hello, {user?.email}</Text>
      <Text style={styles.role}>Role: {user?.role}</Text>
      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>
    </PageContainer>
  )
}

const styles = StyleSheet.create({
  greeting: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  role: { fontSize: 16, color: "#666", marginBottom: 32 },
  logoutButton: { backgroundColor: "#f44", borderRadius: 8, padding: 14, alignItems: "center" },
  logoutText: { color: "#fff", fontWeight: "600" },
})
