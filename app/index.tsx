// GastosApp/app/index.tsx
import { Redirect } from 'expo-router';
import React from 'react';

export default function AppIndex() {
  // Redireciona para a primeira aba (home) dentro do grupo (tabs)
  // O nome "(tabs)" aqui deve corresponder ao nome da sua pasta de grupo
  // e "home" ao nome da sua tela de aba inicial.
  return <Redirect href="/(tabs)/home" />;
}