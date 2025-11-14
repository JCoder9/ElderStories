import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type ConnectionChangeCallback = (isConnected: boolean) => void;

class NetworkService {
  private isOnline: boolean = true;
  private listeners: Set<ConnectionChangeCallback> = new Set();
  private unsubscribe: (() => void) | null = null;

  initialize(): void {
    // Subscribe to network state changes
    this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      console.log(`Network state changed: ${this.isOnline ? 'ONLINE' : 'OFFLINE'}`);

      // Notify listeners only when connection state actually changes
      if (wasOnline !== this.isOnline) {
        this.notifyListeners(this.isOnline);
      }
    });

    // Get initial network state
    NetInfo.fetch().then((state: NetInfoState) => {
      this.isOnline = state.isConnected ?? false;
      console.log(`Initial network state: ${this.isOnline ? 'ONLINE' : 'OFFLINE'}`);
    });
  }

  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners.clear();
  }

  addConnectionChangeListener(callback: ConnectionChangeCallback): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(isConnected: boolean): void {
    this.listeners.forEach(callback => {
      try {
        callback(isConnected);
      } catch (error) {
        console.error('Error in connection change callback:', error);
      }
    });
  }

  async checkConnection(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      this.isOnline = state.isConnected ?? false;
      return this.isOnline;
    } catch (error) {
      console.error('Failed to check network connection:', error);
      return false;
    }
  }

  isConnected(): boolean {
    return this.isOnline;
  }

  async getConnectionInfo(): Promise<NetInfoState> {
    return await NetInfo.fetch();
  }
}

export default new NetworkService();
