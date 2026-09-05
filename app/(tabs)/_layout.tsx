import { Tabs } from 'expo-router';
import {
  Bookmark,
  Home,
  PlayCircle,
  Trophy,
} from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../../src/theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.inkMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconActive]}>
              <Home size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="play"
        options={{
          title: 'Pochi Solo',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconWrapper,
                styles.playWrapper,
                focused && styles.playWrapperActive,
              ]}
            >
              <PlayCircle
                size={24}
                color={focused ? '#FFFFFF' : Colors.primaryDark}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Notebook',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconActive]}>
              <Bookmark size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Champions',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrapper, focused && styles.iconActive]}>
              <Trophy size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.card,
    borderTopWidth: 2,
    borderTopColor: Colors.borderDark,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  iconWrapper: {
    padding: 2,
    borderRadius: 8,
  },
  iconActive: {},
  playWrapper: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  playWrapperActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.borderDark,
  },
});
