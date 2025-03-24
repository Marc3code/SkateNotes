import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ObstacleModal from "./components/ObstacleModal.js";
import { IconButton } from "react-native-paper";

export default function App() {
  const [openObstacle, setOpenObstacle] = useState(false);
  const [selectedObstacleId, setSelectedObstacleId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("Aprender");
  const [newObstacle, setNewObstacle] = useState("");
  const [showAddObstacle, setShowAddObstacle] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  const [editingObstacle, setEditingObstacle] = useState(null);
  const [editedObstacleName, setEditedObstacleName] = useState("");

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("@SkateNotes:obstacles");
        if (storedData) setObstacles(JSON.parse(storedData));
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    loadData();
  }, []);

  // Salvar dados
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem(
          "@SkateNotes:obstacles",
          JSON.stringify(obstacles)
        );
      } catch (error) {
        console.error("Erro ao salvar dados:", error);
      }
    };
    saveData();
  }, [obstacles]);

  // Funções para obstáculos
  const handleAddObstacle = () => {
    if (newObstacle.trim()) {
      setObstacles((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: newObstacle,
          tricks: [],
        },
      ]);
      setNewObstacle("");
      setShowAddObstacle(false);
    }
  };

  const handleEditObstacle = (obstacleId, newName) => {
    setObstacles((prev) =>
      prev.map((obstacle) =>
        obstacle.id === obstacleId ? { ...obstacle, name: newName } : obstacle
      )
    );
    setEditingObstacle(null);
  };

  const handleDeleteObstacle = (obstacleId) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este obstáculo?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: () => {
            setObstacles((prev) => prev.filter((o) => o.id !== obstacleId));
            setOpenObstacle(false);
          },
        },
      ]
    );
  };

  // Funções para manobras
  const addTrickToObstacle = (newTrick) => {
    setObstacles((prev) =>
      prev.map((obstacle) =>
        obstacle.id === selectedObstacleId
          ? { ...obstacle, tricks: [...obstacle.tricks, newTrick] }
          : obstacle
      )
    );
  };

  const editTrickName = (obstacleId, trickId, newName) => {
    setObstacles((prev) =>
      prev.map((obstacle) => {
        if (obstacle.id === obstacleId) {
          return {
            ...obstacle,
            tricks: obstacle.tricks.map((trick) =>
              trick.id === trickId ? { ...trick, name: newName } : trick
            ),
          };
        }
        return obstacle;
      })
    );
  };

  const deleteTrick = (obstacleId, trickId) => {
    setObstacles((prev) =>
      prev.map((obstacle) => ({
        ...obstacle,
        tricks: obstacle.tricks.filter((trick) => trick.id !== trickId),
      }))
    );
  };

  const updateTrick = (updatedTrick) => {
    setObstacles((prev) =>
      prev.map((obstacle) => ({
        ...obstacle,
        tricks: obstacle.tricks.map((trick) =>
          trick.id === updatedTrick.id ? updatedTrick : trick
        ),
      }))
    );
  };

  const openObstacleModal = (obstacleId) => {
    setSelectedObstacleId(obstacleId);
    setOpenObstacle(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SkateNotes</Text>

      <FlatList
        data={obstacles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ScrollView style={styles.obstacle}>
            <View style={styles.obstacleHeader}>
              {editingObstacle?.id === item.id ? (
                <TextInput
                  style={styles.editInput}
                  value={editedObstacleName}
                  onChangeText={setEditedObstacleName}
                  autoFocus
                />
              ) : (
                <TouchableOpacity onPress={() => openObstacleModal(item.id)}>
                  <Text style={styles.obstacleText}>{item.name}</Text>
                </TouchableOpacity>
              )}

              <View style={styles.obstacleActions}>
                {editingObstacle?.id === item.id ? (
                  <>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() =>
                        handleEditObstacle(item.id, editedObstacleName)
                      }
                    >
                      <Text style={styles.buttonText}>Salvar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setEditingObstacle(null)}
                    >
                      <Text style={styles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingObstacle(item);
                        setEditedObstacleName(item.name);
                      }}
                    >
                      <IconButton
                        icon="pencil"
                        iconColor="black"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteObstacle(item.id)}
                    >
                      <IconButton
                        icon="delete"
                        iconColor="red"
                      />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        )}
      />

      <View style={styles.navBar}>
        {["Aprender", "Aprimorar", "Na Base"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.navButton,
              selectedStatus === status && styles.selectedButton,
            ]}
            onPress={() =>
              setSelectedStatus(status === selectedStatus ? "" : status)
            }
          >
            <Text style={styles.navText}>{status}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setShowAddObstacle(!showAddObstacle)}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>

      {showAddObstacle && (
        <View style={styles.addObstacleContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nome do Obstáculo"
            value={newObstacle}
            onChangeText={setNewObstacle}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddObstacle}
            disabled={!newObstacle.trim()}
          >
            <Text style={styles.addButtonText}>Adicionar Obstáculo</Text>
          </TouchableOpacity>
        </View>
      )}

      <ObstacleModal
        visible={openObstacle}
        onClose={() => {
          setOpenObstacle(false);
          setSelectedObstacleId(null);
        }}
        obstacle={obstacles.find((o) => o.id === selectedObstacleId)}
        statusTrick={selectedStatus}
        onAddTrick={addTrickToObstacle}
        onEditTrickName={editTrickName}
        onDeleteTrick={deleteTrick}
        onUpdateTrick={updateTrick}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  obstacle: {
    backgroundColor: "#ddd",
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },
  obstacleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  obstacleText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  obstacleActions: {
    flexDirection: "row",
    gap: 10,
    marginLeft: 10,
  },
  editInput: {
    flex: 1,
    fontSize: 18,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: "#757575",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#222",
    paddingVertical: 15,
    width: "100%",
  },
  navButton: {
    padding: 10,
  },
  selectedButton: {
    backgroundColor: "#555",
  },
  navText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  floatingButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#FF6347",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  floatingButtonText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  addObstacleContainer: {
    position: "absolute",
    bottom: 150,
    right: 20,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: 200,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
