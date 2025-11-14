import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SetupOverlayProps {
  visible: boolean;
  onComplete: (storageType: 'local' | 'google-drive') => void;
}

export const SetupOverlay: React.FC<SetupOverlayProps> = ({ visible, onComplete }) => {
  const [selectedStorage, setSelectedStorage] = useState<'local' | 'google-drive' | null>(null);

  const handleConfirm = async () => {
    if (selectedStorage) {
      await AsyncStorage.setItem('storage_type', selectedStorage);
      await AsyncStorage.setItem('setup_complete', 'true');
      onComplete(selectedStorage);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Welcome to ElderStories</Text>
          <Text style={styles.subtitle}>Choose where to store your recordings</Text>

          {/* Local Storage Option */}
          <TouchableOpacity
            style={[
              styles.option,
              selectedStorage === 'local' && styles.optionSelected,
            ]}
            onPress={() => setSelectedStorage('local')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📱</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Local Storage</Text>
              <Text style={styles.optionDescription}>
                Save recordings to device storage in TapeRecordings folder
              </Text>
              <Text style={styles.optionNote}>✓ Works offline</Text>
            </View>
            {selectedStorage === 'local' && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>

          {/* Google Drive Option */}
          <TouchableOpacity
            style={[
              styles.option,
              selectedStorage === 'google-drive' && styles.optionSelected,
            ]}
            onPress={() => setSelectedStorage('google-drive')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>☁️</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Google Drive</Text>
              <Text style={styles.optionDescription}>
                Sync recordings to Google Drive for backup and access from anywhere
              </Text>
              <Text style={styles.optionNote}>✓ Auto backup • ✓ Cross-device sync</Text>
            </View>
            {selectedStorage === 'google-drive' && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !selectedStorage && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={!selectedStorage}
          >
            <Text
              style={[
                styles.confirmButtonText,
                !selectedStorage && styles.confirmButtonTextDisabled,
              ]}
            >
              Continue
            </Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            You can change this later in settings
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 500,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  optionSelected: {
    borderColor: '#2d5d2d',
    backgroundColor: '#f0f8f0',
  },
  iconContainer: {
    marginRight: 15,
  },
  icon: {
    fontSize: 40,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  optionNote: {
    fontSize: 12,
    color: '#2d5d2d',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 24,
    color: '#2d5d2d',
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#2d5d2d',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  confirmButtonTextDisabled: {
    color: '#999',
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
