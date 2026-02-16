import { useState } from "react"
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, Alert } from "react-native"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../../../lib/api"
import { PageContainer } from "../../../components/PageContainer"

interface Item {
  id: string
  name: string
  description: string | null
  status: string
}

export default function ItemsScreen() {
  const queryClient = useQueryClient()
  const [name, setName] = useState("")

  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ["items"],
    queryFn: () => api.get("/api/items"),
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => api.post("/api/items", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
      setName("")
    },
    onError: (err: Error) => Alert.alert("Error", err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/items/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  })

  return (
    <PageContainer>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="New item name..."
          value={name}
          onChangeText={setName}
        />
        <Pressable
          style={styles.addButton}
          onPress={() => name.trim() && createMutation.mutate({ name: name.trim() })}
        >
          <Text style={styles.addText}>Add</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Pressable onPress={() => deleteMutation.mutate(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No items yet. Add one above!</Text>}
        />
      )}
    </PageContainer>
  )
}

const styles = StyleSheet.create({
  inputRow: { flexDirection: "row", marginBottom: 16, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, fontSize: 16 },
  addButton: { backgroundColor: "#111", borderRadius: 8, paddingHorizontal: 20, justifyContent: "center" },
  addText: { color: "#fff", fontWeight: "600" },
  loading: { textAlign: "center", marginTop: 32, color: "#999" },
  item: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderBottomWidth: 1, borderBottomColor: "#eee" },
  itemName: { fontSize: 16 },
  deleteText: { color: "#f44", fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 32, color: "#999" },
})
