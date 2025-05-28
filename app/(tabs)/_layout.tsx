// GastosApp/app/(tabs)/_layout.tsx
import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext'; // Ajustado para subir dois níveis

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarStyle: {
          backgroundColor: colors.card, 
          borderTopColor: colors.border,
        },
        headerShown: false, // O header já é provido pelo Stack em app/_layout.tsx
      }}>
      <Tabs.Screen
        name="home" // Corresponde ao arquivo app/(tabs)/home.tsx
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dados" // Corresponde ao arquivo app/(tabs)/dados.tsx
        options={{
          title: 'Dados',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="preferencias" // Corresponde ao arquivo app/(tabs)/preferencias.tsx
        options={{
          title: 'Prefs', 
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}