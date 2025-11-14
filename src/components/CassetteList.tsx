import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { CassetteMetadata } from '../types/cassette';

interface CassetteListProps {
  cassettes: CassetteMetadata[];
  onCassetteSelect: (cassetteId: string) => void;
  onNewCassette: () => void;
}

/**
 * Horizontal scrolling list of cassette tapes
 */
export const CassetteList: React.FC<CassetteListProps> = ({
  cassettes,
  onCassetteSelect,
  onNewCassette,
}) => {
  const { width } = Dimensions.get('window');
  const isLargeScreen = width > 768;
  const cassettesPerView = isLargeScreen ? 5 : 1;
  const cassetteWidth = isLargeScreen ? width / 5.5 : width * 0.85;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tapes</Text>
        <TouchableOpacity style={styles.newButton} onPress={onNewCassette}>
          <Text style={styles.newButtonText}>+ New Tape</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={cassetteWidth + 15}
        decelerationRate="fast"
      >
        {cassettes.map((cassette) => (
          <TouchableOpacity
            key={cassette.id}
            style={[styles.cassetteCard, { width: cassetteWidth }]}
            onPress={() => onCassetteSelect(cassette.id)}
          >
            {/* Cassette Visual */}
            <View style={styles.cassetteImage}>
              <View style={styles.cassetteBody}>
                <View style={styles.labelArea}>
                  <Text style={styles.cassetteTitle} numberOfLines={1}>
                    {cassette.title || 'Untitled'}
                  </Text>
                  <Text style={styles.cassetteDuration}>
                    {formatDuration(cassette.duration)}
                  </Text>
                </View>
                <View style={styles.tapeWindow}>
                  <View style={styles.miniReel} />
                  <View style={styles.miniReel} />
                </View>
              </View>
            </View>

            {/* Summary Text */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText} numberOfLines={3}>
                {cassette.summary || 'No summary available'}
              </Text>
              <Text style={styles.dateText}>
                {formatDate(cassette.updatedAt)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Empty state */}
        {cassettes.length === 0 && (
          <View style={[styles.emptyState, { width: width - 40 }]}>
            <Text style={styles.emptyText}>No tapes yet</Text>
            <Text style={styles.emptySubtext}>Press "+ New Tape" to start recording</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  newButton: {
    backgroundColor: '#2d5d2d',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 15,
    gap: 15,
  },
  cassetteCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cassetteImage: {
    marginBottom: 10,
  },
  cassetteBody: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    borderWidth: 2,
    borderColor: '#bbb',
    minHeight: 120,
  },
  labelArea: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cassetteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  cassetteDuration: {
    fontSize: 12,
    color: '#666',
  },
  tapeWindow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
  },
  miniReel: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#666',
  },
  summaryContainer: {
    minHeight: 80,
  },
  summaryText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 16,
    marginBottom: 5,
  },
  dateText: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
});
