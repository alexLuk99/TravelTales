import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';

type Props = {
  visible: boolean;
  text: string;
  onDismiss: () => void;
};

export default function Coachmark({ visible, text, onDismiss }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 10, duration: 160, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={s.overlay}>
      <Animated.View style={[s.bubble, { opacity, transform: [{ translateY }] }]}>
        <Text style={s.title}>Hint</Text>
        <Text style={s.text}>{text}</Text>
        <View style={s.arrow} />
        <Pressable onPress={onDismiss} accessibilityRole="button" accessibilityLabel="Dismiss hint">
          <Text style={s.cta}>Got it</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 90,
    backgroundColor: 'rgba(0,0,0,0.12)', // keeps the dimmed background
  },
  bubble: {
    maxWidth: '90%',
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    alignItems: 'center',
  },
  title: { fontSize: 14, fontWeight: '700', marginBottom: 4, color: '#111' },
  text: { fontSize: 13, color: '#333', textAlign: 'center' },
  cta: { marginTop: 10, fontSize: 12, color: '#117a8b', fontWeight: '700' },
  arrow: {
    position: 'absolute',
    bottom: -8,
    width: 0, height: 0,
    borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 10,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: 'white',
  },
});
