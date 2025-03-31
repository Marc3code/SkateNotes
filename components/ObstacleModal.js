import React, { useState, useEffect, use } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
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
  const [deletingTrick, setDeletingTrick] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [showOptions, setShowOptions] = useState(null); 
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const filteredTricks =
    obstacle?.tricks?.filter((trick) => trick.status === statusTrick) || [];

  useEffect(() => {
    if (visible) {
      setShowInput(false);
      setEditingTrick(null);
      setShowOptions(null);
      setShowDeleteConfirmation(false);
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
        observations: "",
      };
      onAddTrick(newTrick);
      setNewTrickName("");
      setShowInput(false);
    }
  };

  const handleStartEdit = (trick) => {
    setEditingTrick(trick);
    setEditedName(trick.name);
    setShowOptions(null);
  };

  const handleSaveEdit = () => {
    if (editedName.trim() && editingTrick) {
      onEditTrickName(obstacle.id, editingTrick.id, editedName);
      setEditingTrick(null);
      setEditedName("");
    }
  };

  const handleStartDelete = (trick) => {
    setDeletingTrick(trick); 
    setShowDeleteConfirmation(true);
    setShowOptions(null);
  };

  const handleConfirmDelete = () => {
    if (deletingTrick) {
      onDeleteTrick(obstacle.id, deletingTrick.id);
    }
    setShowDeleteConfirmation(false);
    setDeletingTrick(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDeletingTrick(null);
  };

  const handleToggleOptions = (trickId) => {
    setShowOptions(showOptions === trickId ? null : trickId);
  };

  const openTrickModal = (trickId) => {
    setSelectedTrickId(trickId);
    setOpenTrick(true);
  };

  const closeTrickModal = () => {
    setOpenTrick(false);
    setSelectedTrickId(null);
  };

  const getSelectedTrick = () => {
    return obstacle?.tricks?.find((t) => t.id === selectedTrickId);
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
              {editingTrick?.id === item.id ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editedName}
                    onChangeText={setEditedName}
                    autoFocus
                  />
                  <IconButton
                    icon="check"
                    size={20}
                    onPress={handleSaveEdit}
                    disabled={!editedName.trim()}
                  />
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => setEditingTrick(null)}
                  />
                </View>
              ) : (
                <>
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
                          <Text style={{color: 'red'}}>Excluir</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </>
              )}
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
                Deseja realmente excluir a manobra "{editingTrick?.name}"?
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
    position: 'relative',
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
    position: 'relative',
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
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  optionsContainer: {
    position: 'absolute',
    right: 40,
    top: 40,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    elevation: 3,
    zIndex: 10,
  },
  optionButton: {
    padding: 8,
  },
  confirmationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  confirmationText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  confirmationButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  confirmButton: {
    backgroundColor: '#D32F2F',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ObstacleModal;