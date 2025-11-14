import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QueuedOperation {
  id: string;
  type: 'transcription' | 'summary';
  cassetteId: string;
  audioUri?: string; // For transcription
  text?: string; // For summary generation
  timestamp: number;
  retryCount: number;
}

const QUEUE_STORAGE_KEY = 'offline_queue';
const MAX_RETRIES = 3;

class OfflineQueueService {
  private queue: QueuedOperation[] = [];
  private isProcessing = false;

  async initialize(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (queueData) {
        this.queue = JSON.parse(queueData);
        console.log(`Loaded ${this.queue.length} queued operations from storage`);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  async addTranscription(cassetteId: string, audioUri: string): Promise<string> {
    const operation: QueuedOperation = {
      id: `transcription_${cassetteId}_${Date.now()}`,
      type: 'transcription',
      cassetteId,
      audioUri,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(operation);
    await this.saveQueue();
    console.log(`Queued transcription for cassette ${cassetteId}`);
    return operation.id;
  }

  async addSummary(cassetteId: string, text: string): Promise<string> {
    const operation: QueuedOperation = {
      id: `summary_${cassetteId}_${Date.now()}`,
      type: 'summary',
      cassetteId,
      text,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(operation);
    await this.saveQueue();
    console.log(`Queued summary generation for cassette ${cassetteId}`);
    return operation.id;
  }

  async removeOperation(operationId: string): Promise<void> {
    this.queue = this.queue.filter(op => op.id !== operationId);
    await this.saveQueue();
  }

  async getOperationsForCassette(cassetteId: string): Promise<QueuedOperation[]> {
    return this.queue.filter(op => op.cassetteId === cassetteId);
  }

  getAllOperations(): QueuedOperation[] {
    return [...this.queue];
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  async processQueue(
    onTranscription: (cassetteId: string, audioUri: string) => Promise<any>,
    onSummary: (cassetteId: string, text: string) => Promise<string>
  ): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`Processing ${this.queue.length} queued operations...`);

    const operationsToProcess = [...this.queue];

    for (const operation of operationsToProcess) {
      try {
        console.log(`Processing ${operation.type} for cassette ${operation.cassetteId}`);

        if (operation.type === 'transcription' && operation.audioUri) {
          await onTranscription(operation.cassetteId, operation.audioUri);
          await this.removeOperation(operation.id);
          console.log(`✓ Transcription completed for ${operation.cassetteId}`);
        } else if (operation.type === 'summary' && operation.text) {
          await onSummary(operation.cassetteId, operation.text);
          await this.removeOperation(operation.id);
          console.log(`✓ Summary completed for ${operation.cassetteId}`);
        }
      } catch (error) {
        console.error(`Failed to process operation ${operation.id}:`, error);
        
        // Increment retry count
        operation.retryCount++;
        
        if (operation.retryCount >= MAX_RETRIES) {
          console.warn(`Operation ${operation.id} exceeded max retries, removing from queue`);
          await this.removeOperation(operation.id);
        } else {
          console.log(`Will retry operation ${operation.id} (attempt ${operation.retryCount + 1}/${MAX_RETRIES})`);
          await this.saveQueue();
        }
      }
    }

    this.isProcessing = false;
    console.log(`Queue processing complete. ${this.queue.length} operations remaining.`);
  }

  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
    console.log('Offline queue cleared');
  }

  // Get summary of pending operations by type
  getQueueSummary(): { transcriptions: number; summaries: number } {
    return {
      transcriptions: this.queue.filter(op => op.type === 'transcription').length,
      summaries: this.queue.filter(op => op.type === 'summary').length,
    };
  }
}

export default new OfflineQueueService();
