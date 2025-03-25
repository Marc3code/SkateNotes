import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Platform,
  Dimensions
} from "react-native";
import { IconButton } from "react-native-paper";
import { debounce } from "lodash";

const TrickModal = ({ visible, onClose, trick, onUpdateTrick }) => {
  const [localTrick, setLocalTrick] = useState(trick);
  const [observation, setObservation] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { width } = Dimensions.get("window");
  const buttonWidth = 120;

  // Sincroniza o estado local com as props
  useEffect(() => {
    setLocalTrick(trick);
    setObservation(trick?.observations || "");
  }, [trick]);

  const debouncedSave = useCallback(
    debounce(async (text) => {
      if (localTrick) {
        setIsSaving(true);
        const updatedTrick = { ...localTrick, observations: text };
        await onUpdateTrick(updatedTrick);
        setIsSaving(false);
      }
    }, 1000),
    [localTrick, onUpdateTrick]
  );

  const handleTextChange = (text) => {
    setObservation(text);
    debouncedSave(text);
  };

  const handleStatusSelect = async (status) => {
    if (localTrick) {
      setIsSaving(true);
      const updatedTrick = { ...localTrick, status };
      await onUpdateTrick(updatedTrick);
      setIsSaving(false);
    }
    setShowOptions(false);
    onClose()
  };

  const handleShowOptions = () => {
    setShowOptions(!showOptions);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.modalContainer}>
        {/* Overlay de salvamento */}
        {isSaving && (
          <View style={styles.savingOverlay}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.savingText}>Salvando...</Text>
          </View>
        )}

        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} onPress={onClose} />
          <View style={styles.titleContainer}>
            <Text style={styles.modalTitle}>{localTrick?.name}</Text>
          </View>
        </View>

        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Escreva suas observações aqui..."
          placeholderTextColor="#888"
          value={observation}
          onChangeText={handleTextChange}
          autoFocus
          selectionColor="#FF6347"
        />

        {showOptions && (
          <View style={styles.optionsContainer}>
            {["Aprender", "Aprimorar", "Na Base"].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.optionButton,
                  localTrick?.status === status && styles.selectedStatus
                ]}
                onPress={() => handleStatusSelect(status)}
              >
                <Text style={styles.optionText}>Mover para {status}</Text>
                {localTrick?.status === status && (
                  <View style={styles.statusIndicator} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.moverButton, { left: width / 2 - buttonWidth / 2 }]}
          onPress={handleShowOptions}
        >
          <Text style={styles.moverButtonText}>
            {localTrick?.status || "Selecionar Status"}
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 10,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  textInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    textAlignVertical: "top",
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 20,
    color: "#333",
  },
  optionsContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
    padding: 10,
  },
  optionButton: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
  },
  selectedStatus: {
    backgroundColor: "#e3f2fd",
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  optionText: {
    color: "#333",
    fontSize: 16,
  },
  statusIndicator: {
    position: "absolute",
    right: 10,
    top: "50%",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2196F3",
    transform: [{ translateY: -4 }],
  },
  moverButton: {
    position: "absolute",
    bottom: 30,
    backgroundColor: "#FF6347",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  moverButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  savingOverlay: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 999,
  },
  savingText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 14,
  },
  savingHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
});

export default TrickModal;