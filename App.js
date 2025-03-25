import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
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
  const [deletingObstacle, setDeletingObstacle] = useState(null);
  const [editedObstacleName, setEditedObstacleName] = useState("");
  const [showOptions, setShowOptions] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [trickAmount, setTrickAmount] = useState(null);

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

  const calculateTrickAmount = (obstacle) => {
    setTrickAmount(obstacle.length);
    console.log(trickAmount);
  };

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

  const handleStartEdit = (obstacle) => {
    setEditingObstacle(obstacle);
    setEditedObstacleName(obstacle.name);
    setShowOptions(null);
  };

  const handleSaveEdit = () => {
    if (editedObstacleName.trim() && editingObstacle) {
      setObstacles((prev) =>
        prev.map((obstacle) =>
          obstacle.id === editingObstacle.id
            ? { ...obstacle, name: editedObstacleName }
            : obstacle
        )
      );
      setEditingObstacle(null);
    }
  };

  const handleStartDelete = (obstacle) => {
    setDeletingObstacle(obstacle);
    setShowDeleteConfirmation(true);
    setShowOptions(null);
  };

  const handleConfirmDelete = () => {
    if (deletingObstacle) {
      setObstacles((prev) => prev.filter((o) => o.id !== deletingObstacle.id));
      setOpenObstacle(false);
    }
    setShowDeleteConfirmation(false);
    setDeletingObstacle(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setEditingObstacle(null);
  };

  const handleToggleOptions = (obstacleId) => {
    setShowOptions(showOptions === obstacleId ? null : obstacleId);
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

  const formatCountTrick = (tricks) => {
    const count = tricks?.length
    const message = count > 0 ? `${count} manobra${count === 1 ? '' : 's' } adicionada${count === 1 ? '' : 's' }` : "Ainda não há manobras aqui" 

    
    return message
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SkateNotes</Text>

      <FlatList
        data={obstacles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.obstacle}>
            {editingObstacle?.id === item.id ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={editedObstacleName}
                  onChangeText={setEditedObstacleName}
                  autoFocus
                />
                <IconButton
                  icon="check"
                  size={20}
                  onPress={handleSaveEdit}
                  disabled={!editedObstacleName.trim()}
                />
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => setEditingObstacle(null)}
                />
              </View>
            ) : (
              <View style={styles.obstacleHeader}>
                <TouchableOpacity onPress={() => openObstacleModal(item.id)}>
                  <Text style={styles.obstacleText}>{item.name}</Text>
                  <Text>{formatCountTrick(item?.tricks)}</Text>
                </TouchableOpacity>

                <View style={styles.obstacleActions}>
                  <IconButton
                    icon="dots-horizontal"
                    iconColor="black"
                    onPress={() => handleToggleOptions(item.id)}
                  />
                  {showOptions === item.id && (
                    <View style={styles.optionsContainer}>
                      <TouchableOpacity
                        style={styles.optionButton}
                        onPress={() => handleStartEdit(item)}
                      >
                        <Text>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.optionButton}
                        onPress={() => handleStartDelete(item)}
                      >
                        <Text style={{ color: "red" }}>Excluir</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        )}
      />

      {/* Modal de confirmação de exclusão */}
      <Modal
        visible={showDeleteConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.confirmationOverlay}>
          <View style={styles.confirmationContainer}>
            <Text style={styles.confirmationText}>
              Deseja realmente excluir o obstáculo "{deletingObstacle?.name}"?
            </Text>
            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[styles.confirmationButton, styles.cancelButton]}
                onPress={handleCancelDelete}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmationButton, styles.confirmButton]}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.buttonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    position: "relative",
  },
  editContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  editInput: {
    flex: 1,
    fontSize: 18,
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  optionsContainer: {
    position: "absolute",
    right: 0,
    top: 40,
    backgroundColor: "white",
    borderRadius: 5,
    padding: 10,
    elevation: 3,
    zIndex: 10,
  },
  optionButton: {
    padding: 8,
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
  confirmationOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmationContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  confirmationText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  confirmationButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  confirmationButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: "#757575",
  },
  confirmButton: {
    backgroundColor: "#D32F2F",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
