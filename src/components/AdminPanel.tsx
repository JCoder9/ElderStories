import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { UserProfile } from '../services/AuthService';

interface AdminPanelProps {
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userList: UserProfile[] = [];
      let cost = 0;

      querySnapshot.forEach((doc) => {
        const user = doc.data() as UserProfile;
        userList.push(user);
        if (user.isApproved || user.isAdmin) {
          cost += user.totalCost || 0;
        }
      });

      userList.sort((a, b) => {
        if (a.isAdmin) return -1;
        if (b.isAdmin) return 1;
        if (a.isApproved && !b.isApproved) return -1;
        if (!a.isApproved && b.isApproved) return 1;
        return 0;
      });

      setUsers(userList);
      setTotalCost(cost);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load users:', error);
      Alert.alert('Error', 'Failed to load users');
      setLoading(false);
    }
  };

  const approveUser = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        isApproved: true,
        approvedAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'User approved');
      loadUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to approve user');
    }
  };

  const revokeApproval = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        isApproved: false,
      });
      Alert.alert('Success', 'Approval revoked');
      loadUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to revoke approval');
    }
  };

  const makeAdmin = async (uid: string) => {
    Alert.alert(
      'Confirm',
      'Make this user an admin? Admins have full access.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Make Admin',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', uid), {
                isAdmin: true,
                isApproved: true,
              });
              Alert.alert('Success', 'User is now an admin');
              loadUsers();
            } catch (error) {
              Alert.alert('Error', 'Failed to make admin');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Admin Panel</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Users</Text>
          <Text style={styles.statValue}>{users.length}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Approved</Text>
          <Text style={styles.statValue}>
            {users.filter((u) => u.isApproved || u.isAdmin).length}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Monthly Cost</Text>
          <Text style={[styles.statValue, totalCost >= 20 && styles.overBudget]}>
            ${totalCost.toFixed(2)}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {users.map((user) => (
          <View key={user.uid} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={styles.userInfo}>
                <Text style={styles.userEmail}>{user.email}</Text>
                {user.displayName && (
                  <Text style={styles.userName}>{user.displayName}</Text>
                )}
              </View>
              <View style={styles.badges}>
                {user.isAdmin && (
                  <Text style={[styles.badge, styles.adminBadge]}>ADMIN</Text>
                )}
                {user.isApproved && !user.isAdmin && (
                  <Text style={[styles.badge, styles.approvedBadge]}>
                    APPROVED
                  </Text>
                )}
                {!user.isApproved && !user.isAdmin && (
                  <Text style={[styles.badge, styles.pendingBadge]}>PENDING</Text>
                )}
              </View>
            </View>

            <View style={styles.userStats}>
              <Text style={styles.userStat}>
                Transcriptions: {user.monthlyUsage || 0}
              </Text>
              <Text style={styles.userStat}>
                Cost: ${(user.totalCost || 0).toFixed(2)}
              </Text>
              <Text style={styles.userStat}>
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </View>

            {!user.isAdmin && (
              <View style={styles.actions}>
                {!user.isApproved ? (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => approveUser(user.uid)}
                  >
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.revokeButton]}
                    onPress={() => revokeApproval(user.uid)}
                  >
                    <Text style={styles.actionButtonText}>Revoke</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, styles.adminButton]}
                  onPress={() => makeAdmin(user.uid)}
                >
                  <Text style={styles.actionButtonText}>Make Admin</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  statsCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  overBudget: {
    color: '#ff3b30',
  },
  content: {
    flex: 1,
  },
  userCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    color: '#666',
  },
  badges: {
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 10,
    fontWeight: '600',
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
  userStats: {
    marginBottom: 12,
  },
  userStat: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  revokeButton: {
    backgroundColor: '#ff9800',
  },
  adminButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
