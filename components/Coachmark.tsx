import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  text: string;
  onDismiss: () => void;
  title?: string;
  ctaLabel?: string;
};

export default function Coachmark({
  visible,
  text,
  onDismiss,
  title,
  ctaLabel,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7, tension: 120 }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 10, duration: 160, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.94, duration: 160, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) {
        setShouldRender(false);
        scale.setValue(0.96);
        translateY.setValue(10);
      }
    });
  }, [visible, opacity, scale, translateY]);

  if (!shouldRender) return null;

  const heading = title ?? 'Travel Tip';
  const callToAction = ctaLabel ?? "Let's explore";

  return (
    <View style={s.overlay} pointerEvents="box-none">
      <Animated.View style={[s.scrim, { opacity }]} pointerEvents="none" />
      <Animated.View style={[s.bubble, { opacity, transform: [{ translateY }, { scale }] }]}>
        <View style={s.iconBadge}>
          <MaterialCommunityIcons name="airplane-takeoff" size={26} color="#0f4c81" />
        </View>
        <Text style={s.title}>{heading}</Text>
        <Text style={s.text}>{text}</Text>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss travel tip"
          style={s.ctaButton}
        >
          <Text style={s.cta}>{callToAction}</Text>
        </Pressable>
        <View style={s.arrow} />
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 90,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,49,97,0.25)',
  },
  bubble: {
    maxWidth: '90%',
    backgroundColor: '#f8fbff',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#0a3161',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15,76,129,0.08)',
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(15,76,129,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f4c81',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  text: {
    fontSize: 13,
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 19,
  },
  ctaButton: {
    marginTop: 12,
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#0f4c81',
    shadowColor: '#0a3161',
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cta: {
    fontSize: 12,
    color: '#f8fbff',
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  arrow: {
    position: 'absolute',
    bottom: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#f8fbff',
  },
});
