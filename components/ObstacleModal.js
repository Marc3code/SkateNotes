import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from "react-native";
import { IconButton } from "react-native-paper";
import TrickModal from "./TrickModal.js";

const ObstacleModal = ({
  visible,
  onClose,
  obstacle,
  statusTrick,
  onAddTrick,
  onEditTrickName,
  onDeleteTrick,
  onUpdateTrick,
}) => {
  const [showInput, setShowInput] = useState(false);
  const [newTrickName, setNewTrickName] = useState("");
  const [selectedTrickId, setSelectedTrickId] = useState(null);
  const [openTrick, setOpenTrick] = useState(false);
  const [editingTrick, setEditingTrick] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [deletingTrick, setDeletingTrick] = useState(null);

  // Sempre busca os truques atualizados do obstáculo
  const filteredTricks = obstacle?.tricks?.filter((trick) => trick.status === statusTrick) || [];

  useEffect(() => {
    // Resetar estados quando o modal abrir
    if (visible) {
      setShowInput(false);
      setEditingTrick(null);
      setDeletingTrick(null);
    }
  }, [visible]);

  const ToggleAddButton = () => {
    setShowInput(!showInput);
  };

  const handleAddTrick = () => {
    if (newTrickName.trim()) {
      const newTrick = {
        id: Date.now().toString(),
        name: newTrickName,
        status: statusTrick,
        observations: ""
      };
      onAddTrick(newTrick);
      setNewTrickName("");
      setShowInput(false);
    }
  };

  const handleStartEdit = (trick) => {
    setEditingTrick(editingTrick?.id === trick.id ? null : trick);
    setEditedName(trick.name);
  };

  const handleSaveEdit = () => {
    if (editedName.trim() && editingTrick) {
      onEditTrickName(obstacle.id, editingTrick.id, editedName);
    }
    setEditingTrick(null);
    setEditedName("");
  };

  const handleStartDelete = (trick) => {
    setDeletingTrick(deletingTrick?.id === trick.id ? null : trick);
  };

  const handleConfirmDelete = () => {
    if (deletingTrick) {
      onDeleteTrick(obstacle.id, deletingTrick.id);
    }
    setDeletingTrick(null);
  };

  const openTrickModal = (trickId) => {
    setSelectedTrickId(trickId);
    setOpenTrick(true);
  };

  const closeTrickModal = () => {
    setOpenTrick(false);
    setSelectedTrickId(null);
  };

  // Busca o truque atualizado pelo ID
  const getSelectedTrick = () => {
    return obstacle?.tricks?.find(t => t.id === selectedTrickId);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} onPress={onClose} />
          <Text style={styles.modalTitle}>
            {obstacle?.name} - {statusTrick}
          </Text>
        </View>

        <FlatList
          data={filteredTricks}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.noTricksText}>
              Nenhuma manobra encontrada para "{statusTrick}".
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.trickItem}>
              <TouchableOpacity
                onPress={() => openTrickModal(item.id)}
                style={styles.trickContent}
              >
                <Text style={styles.trickText}>{item.name}</Text>
                {item.observations ? (
                  <Text style={styles.observationPreview}>
                    {item.observations.slice(0, 30)}...
                  </Text>
                ) : null}
              </TouchableOpacity>
              <View style={styles.iconContainer}>
                <IconButton
                  icon="pencil"
                  iconColor="black"
                  onPress={() => handleStartEdit(item)}
                />
                <IconButton
                  icon="delete"
                  iconColor="red"
                  onPress={() => handleStartDelete(item)}
                />
              </View>
            </View>
          )}
        />

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => ToggleAddButton()}
        >
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>

        {showInput && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nome da manobra"
              value={newTrickName}
              onChangeText={setNewTrickName}
              autoFocus
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddTrick}
              disabled={!newTrickName.trim()}
            >
              <Text style={styles.addButtonText}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        )}

        {editingTrick && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Editar nome da manobra"
              value={editedName}
              onChangeText={setEditedName}
              autoFocus
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveEdit}
              disabled={!editedName.trim()}
            >
              <Text style={styles.addButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        )}

        {deletingTrick && (
          <View style={styles.deleteConfirmationContainer}>
            <Text style={styles.deleteText}>
              Deletar "{deletingTrick.name}"?
            </Text>
            <View style={styles.deleteButtons}>
              <TouchableOpacity
                style={[styles.deleteButton, styles.cancelButton]}
                onPress={() => setDeletingTrick(null)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, styles.confirmButton]}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.buttonText}>Deletar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TrickModal
          visible={openTrick}
          onClose={closeTrickModal}
          trick={getSelectedTrick()}
          onUpdateTrick={onUpdateTrick}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  trickItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginBottom: 10,
  },
  trickContent: {
    flex: 1,
    marginRight: 10,
  },
  trickText: {
    fontSize: 18,
    fontWeight: "500",
  },
  observationPreview: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  noTricksText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#999",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
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
  inputContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteConfirmationContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  deleteText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
  },
  deleteButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  deleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
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

export default ObstacleModal;