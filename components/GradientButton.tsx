// GastosApp/components/GradientButton.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ThemeColors } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';

export type GradientButtonType = 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'invested' | 'default';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  type?: GradientButtonType;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const getGradientColors = (type: GradientButtonType, colors: ThemeColors, isDark: boolean): [string, string] => {
  switch (type) {
    case 'primary':
      return isDark ? [colors.primary, '#0059B3'] : [colors.primary, '#0056b3'];
    case 'success':
      return isDark ? [colors.success, '#1A7A37'] : [colors.success, '#004d00'];
    case 'danger':
      return isDark ? [colors.danger, '#B32B22'] : [colors.danger, '#c82333'];
    case 'warning':
      return isDark ? [colors.warning, '#B36F07'] : [colors.warning, '#cc7a00'];
    case 'info':
      return isDark ? [colors.info, '#075FB3'] : [colors.info, '#117a8b'];
    case 'invested':
      return isDark ? [colors.invested, '#A06FE0'] : [colors.invested, '#6A1EA2'];
    default:
      return isDark ? [colors.secondaryText, '#5A5A5A'] : [colors.secondaryText, '#545b62'];
  }
};

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  style,
  textStyle,
  disabled = false,
  loading = false,
  icon,
}) => {
  const { colors, isDark } = useTheme();
  const gradientColors = getGradientColors(type, colors, isDark);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.buttonContainer,
        style,
        (disabled || loading) && styles.disabledButton
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.card} />
        ) : (
          <View style={styles.contentContainer}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.buttonText, textStyle]}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default GradientButton;