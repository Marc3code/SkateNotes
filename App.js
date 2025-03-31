import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator
} from "react-native";
import ObstacleModal from "./components/ObstacleModal.js";
import { IconButton } from "react-native-paper";

const API_URL = "http://localhost:5000"; // Altere para o endereço da sua API

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
  const [loading, setLoading] = useState(true);

  const handleApiError = (error) => {
    console.error("API Error:", error);
    Alert.alert("Erro", error.message || "Ocorreu um erro ao comunicar com o servidor");
  };

  // Carregar dados da API
  useEffect(() => {
    const fetchObstacles = async () => {
      try {
        const response = await fetch(`${API_URL}/obstacles`);
        if (!response.ok) {
          throw new Error("Erro ao carregar obstáculos");
        }
        const data = await response.json();
        setObstacles(data);
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchObstacles();
  }, []);

  // Funções para obstáculos
  const handleAddObstacle = async () => {
    if (!newObstacle.trim()) return;

    try {
      const response = await fetch(`${API_URL}/obstacles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newObstacle }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao adicionar obstáculo");
      }

      const newObstacleData = await response.json();
      setObstacles((prev) => [...prev, newObstacleData]);
      setNewObstacle("");
      setShowAddObstacle(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleStartEdit = (obstacle) => {
    setEditingObstacle(obstacle);
    setEditedObstacleName(obstacle.name);
    setShowOptions(null);
  };

  const handleSaveEdit = async () => {
    if (!editedObstacleName.trim() || !editingObstacle) return;

    try {
      const response = await fetch(`${API_URL}/obstacles/${editingObstacle._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editedObstacleName }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar obstáculo");
      }

      const updatedObstacle = await response.json();
      setObstacles((prev) =>
        prev.map((obstacle) =>
          obstacle._id === updatedObstacle._id ? updatedObstacle : obstacle
        )
      );
      setEditingObstacle(null);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleStartDelete = (obstacle) => {
    setDeletingObstacle(obstacle);
    setShowDeleteConfirmation(true);
    setShowOptions(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingObstacle) return;

    try {
      const response = await fetch(`${API_URL}/obstacles/${deletingObstacle._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir obstáculo");
      }

      setObstacles((prev) => prev.filter((o) => o._id !== deletingObstacle._id));
      setOpenObstacle(false);
      setShowDeleteConfirmation(false);
      setDeletingObstacle(null);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDeletingObstacle(null);
  };

  const handleToggleOptions = (obstacleId) => {
    setShowOptions(showOptions === obstacleId ? null : obstacleId);
  };

  // Funções para manobras
  const addTrickToObstacle = async (newTrick) => {
    try {
      const response = await fetch(
        `${API_URL}/obstacles/${selectedObstacleId}/tricks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newTrick,
            status: selectedStatus
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao adicionar manobra");
      }

      const updatedObstacle = await response.json();
      setObstacles((prev) =>
        prev.map((obstacle) =>
          obstacle._id === updatedObstacle._id ? updatedObstacle : obstacle
        )
      );
    } catch (error) {
      handleApiError(error);
    }
  };

  const editTrickName = async (obstacleId, trickId, newName) => {
    try {
      const response = await fetch(
        `${API_URL}/obstacles/${obstacleId}/tricks/${trickId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newName }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar manobra");
      }

      const updatedObstacle = await response.json();
      setObstacles((prev) =>
        prev.map((obstacle) =>
          obstacle._id === updatedObstacle._id ? updatedObstacle : obstacle
        )
      );
    } catch (error) {
      handleApiError(error);
    }
  };

  const deleteTrick = async (obstacleId, trickId) => {
    try {
      const response = await fetch(
        `${API_URL}/obstacles/${obstacleId}/tricks/${trickId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao excluir manobra");
      }

      const updatedObstacle = await response.json();
      setObstacles((prev) =>
        prev.map((obstacle) =>
          obstacle._id === updatedObstacle._id ? updatedObstacle : obstacle
        )
      );
    } catch (error) {
      handleApiError(error);
    }
  };

  const updateTrick = async (updatedTrick) => {
    try {
      const response = await fetch(
        `${API_URL}/obstacles/${selectedObstacleId}/tricks/${updatedTrick._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTrick),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar manobra");
      }

      const updatedObstacle = await response.json();
      setObstacles((prev) =>
        prev.map((obstacle) =>
          obstacle._id === updatedObstacle._id ? updatedObstacle : obstacle
        )
      );
    } catch (error) {
      handleApiError(error);
    }
  };

  const openObstacleModal = (obstacleId) => {
    setSelectedObstacleId(obstacleId);
    setOpenObstacle(true);
  };

  const formatCountTrick = (tricks) => {
    const count = tricks?.length || 0;
    return count > 0
      ? `${count} manobra${count === 1 ? "" : "s"} adicionada${count === 1 ? "" : "s"}`
      : "Ainda não há manobras aqui";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SkateNotes</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6347" />
        </View>
      ) : (
        <FlatList
          data={obstacles}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.obstacle}>
              {editingObstacle?._id === item._id ? (
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
                  <TouchableOpacity onPress={() => openObstacleModal(item._id)}>
                    <Text style={styles.obstacleText}>{item.name}</Text>
                    <Text>{formatCountTrick(item?.tricks)}</Text>
                  </TouchableOpacity>

                  <View style={styles.obstacleActions}>
                    <IconButton
                      icon="dots-horizontal"
                      iconColor="black"
                      onPress={() => handleToggleOptions(item._id)}
                    />
                    {showOptions === item._id && (
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
      )}

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
        obstacle={obstacles.find((o) => o._id === selectedObstacleId)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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