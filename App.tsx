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
      {/* Top navigation bar */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.topButton}
          onPress={() => setCurrentScreen('settings')}
        >
          <Text style={styles.topButtonText}>⚙️</Text>
        </TouchableOpacity>
        
        {userProfile.isAdmin && (
          <TouchableOpacity
            style={styles.topButton}
            onPress={() => setCurrentScreen('admin')}
          >
            <Text style={styles.topButtonText}>👑</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <MainScreen userProfile={userProfile} />
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
  topNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 1000,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(90, 74, 58, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#c9a87a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  topButtonText: {
    fontSize: 24,
  },
});

