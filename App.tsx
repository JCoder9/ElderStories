import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { User } from 'firebase/auth';
import { MainScreen } from './src/screens/MainScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AdminPanel } from './src/components/AdminPanel';
import AuthService, { UserProfile } from './src/services/AuthService';

type Screen = 'main' | 'settings' | 'admin';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');

  useEffect(() => {
    // Initialize auth listener
    AuthService.initialize((authUser, profile) => {
      setUser(authUser);
      setUserProfile(profile);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Show login if not authenticated
  if (!user || !userProfile) {
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

  // Show different screens based on current selection
  if (currentScreen === 'settings') {
    return (
      <SettingsScreen
        userProfile={userProfile}
        onBack={() => setCurrentScreen('main')}
      />
    );
  }

  if (currentScreen === 'admin' && userProfile.isAdmin) {
    return <AdminPanel onBack={() => setCurrentScreen('main')} />;
  }

  // Main screen with navigation
  return (
    <>
      <MainScreen userProfile={userProfile} />
      
      {/* Floating action buttons */}
      <View style={styles.fab}>
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => setCurrentScreen('settings')}
        >
          <Text style={styles.fabText}>⚙️</Text>
        </TouchableOpacity>
        
        {userProfile.isAdmin && (
          <TouchableOpacity
            style={[styles.fabButton, styles.adminFab]}
            onPress={() => setCurrentScreen('admin')}
          >
            <Text style={styles.fabText}>👑</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    gap: 12,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  adminFab: {
    backgroundColor: '#4CAF50',
  },
  fabText: {
    fontSize: 24,
  },
});

