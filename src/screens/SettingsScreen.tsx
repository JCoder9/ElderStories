import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthService, { UserProfile } from '../services/AuthService';

interface SettingsScreenProps {
  userProfile: UserProfile;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userProfile,
  onBack,
}) => {
  const [apiKey, setApiKey] = useState(userProfile.personalApiKey || '');
  const [saving, setSaving] = useState(false);

  const handleSaveApiKey = async () => {
    setSaving(true);
    try {
      await AuthService.updateUserProfile({ personalApiKey: apiKey });
      Alert.alert('Saved', 'Your OpenAI API key has been saved');
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await AuthService.signOut();
          onBack();
        },
      },
    ]);
  };

  const renderStatusBadge = () => {
    if (userProfile.isAdmin) {
      return <Text style={[styles.badge, styles.adminBadge]}>ADMIN</Text>;
    }
    if (userProfile.isApproved) {
      return <Text style={[styles.badge, styles.approvedBadge]}>APPROVED</Text>;
    }
    return <Text style={[styles.badge, styles.pendingBadge]}>PENDING APPROVAL</Text>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <Text style={styles.email}>{userProfile.email}</Text>
            {userProfile.displayName && (
              <Text style={styles.displayName}>{userProfile.displayName}</Text>
            )}
            <View style={styles.statusRow}>{renderStatusBadge()}</View>
          </View>
        </View>

        {/* Usage Stats */}
        {(userProfile.isAdmin || userProfile.isApproved) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Usage</Text>
            <View style={styles.card}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Transcriptions:</Text>
                <Text style={styles.statValue}>{userProfile.monthlyUsage}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Cost:</Text>
                <Text style={styles.statValue}>
                  ${userProfile.totalCost.toFixed(2)} / $20.00
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Remaining:</Text>
                <Text style={styles.statValue}>
                  ${AuthService.getRemainingBudget().toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Personal API Key */}
        {!userProfile.isApproved && !userProfile.isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal OpenAI API Key</Text>
            <Text style={styles.sectionDescription}>
              Your account is pending approval. Add your own OpenAI API key to use
              transcriptions immediately.
            </Text>
            <View style={styles.card}>
              <TextInput
                style={styles.apiKeyInput}
                placeholder="sk-proj-..."
                value={apiKey}
                onChangeText={setApiKey}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveApiKey}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Saving...' : 'Save API Key'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.helpText}>
                Get your API key from{' '}
                <Text style={styles.link}>platform.openai.com/api-keys</Text>
              </Text>
            </View>
          </View>
        )}

        {/* Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          <View style={styles.card}>
            <Text style={styles.infoText}>
              {userProfile.isAdmin || userProfile.isApproved
                ? '✓ You have access to free transcriptions (up to $20/month)\n✓ All recording features available\n✓ Offline support enabled'
                : '• Recording and playback work without approval\n• Timeline editing works offline\n• Transcription requires approval or personal API key\n• Contact admin for approval'}
            </Text>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 16,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  displayName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statusRow: {
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  adminBadge: {
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  approvedBadge: {
    backgroundColor: '#2196F3',
    color: '#fff',
  },
  pendingBadge: {
    backgroundColor: '#FF9800',
    color: '#fff',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  apiKeyInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    lineHeight: 18,
  },
  link: {
    color: '#007AFF',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  signOutButton: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  signOutText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
  },
});
