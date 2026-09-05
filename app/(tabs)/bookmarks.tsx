import * as WebBrowser from 'expo-web-browser';
import { BookmarkX, ExternalLink } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PochiLabrador } from '../../src/components/mascot/MascotVectors';
import { PochiRepository } from '../../src/data/repository';
import { Colors } from '../../src/theme/colors';
import { Bookmark } from '../../src/types';

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const loadBookmarks = useCallback(async () => {
    const list = await PochiRepository.getBookmarks();
    setBookmarks(list);
  }, []);

  // Reload when screen appears
  React.useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleRemove = async (q: Bookmark['question']) => {
    await PochiRepository.toggleBookmark(q);
    loadBookmarks();
  };

  const handleOpenWikipedia = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (e) {
      console.warn('Failed to open Wikipedia', e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Knowledge Notebook</Text>
        <Text style={styles.subtitle}>STUDY NOTEBOOK • SAVED QUESTIONS</Text>
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <PochiLabrador size={100} expression="pensive" />
          <Text style={styles.emptyTitle}>Your Notebook is Empty</Text>
          <Text style={styles.emptySub}>
            Tap the bookmark ribbon after resolving any question to save it for review.
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.question_id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const q = item.question;
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryPillText}>
                      {q.category.toUpperCase()}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleRemove(q)}
                    style={({ pressed }) => [
                      styles.removeBtn,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <BookmarkX size={16} color={Colors.inkSecondary} />
                  </Pressable>
                </View>

                <Text style={styles.answerText}>{q.answer}</Text>
                <Text style={styles.clueSnippet}>{q.clue_text}</Text>

                <View style={styles.summaryBox}>
                  <Text style={styles.summaryText}>{q.context_summary}</Text>
                </View>

                <Pressable
                  onPress={() => handleOpenWikipedia(q.wikipedia_url)}
                  style={({ pressed }) => [
                    styles.wikiBtn,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.wikiBtnText}>Wikipedia Article</Text>
                  <ExternalLink size={14} color={Colors.primaryDark} />
                </Pressable>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.ink,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.ink,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.inkSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: 20,
    gap: 14,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 16,
    shadowColor: Colors.ink,
    shadowOffset: { width: 2.5, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryPill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  removeBtn: {
    padding: 4,
  },
  answerText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primaryDark,
    marginBottom: 6,
  },
  clueSnippet: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.ink,
    marginBottom: 10,
  },
  summaryBox: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.inkSecondary,
  },
  wikiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  wikiBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  buttonPressed: {
    transform: [{ translateY: 2 }],
  },
});
