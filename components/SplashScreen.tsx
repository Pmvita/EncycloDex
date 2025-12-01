import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after animation
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Dark grey frame */}
      <View style={styles.frame}>
        {/* Main content area with warm reddish-orange background */}
        <View style={styles.contentArea}>
          {/* Abstract decorative shapes */}
          <View style={styles.decorativeShapes}>
            <Animated.View
              style={[
                styles.shape,
                styles.shape1,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.shape,
                styles.shape2,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.shape,
                styles.shape3,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.shape,
                styles.shape4,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            />
          </View>

          {/* Centered open book icon */}
          <Animated.View
            style={[
              styles.bookContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.book}>
              {/* Spine at bottom */}
              <View style={styles.spine} />
              
              {/* Left pages fanned upward and outward */}
              <View style={styles.bookLeft}>
                <View style={[styles.page, styles.leftPage1]} />
                <View style={[styles.page, styles.leftPage2]} />
                <View style={[styles.page, styles.leftPage3]} />
              </View>
              
              {/* Right pages fanned upward and outward */}
              <View style={styles.bookRight}>
                <View style={[styles.page, styles.rightPage1]} />
                <View style={[styles.page, styles.rightPage2]} />
                <View style={[styles.page, styles.rightPage3]} />
              </View>
            </View>
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a2a2a', // Dark grey background
  },
  frame: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentArea: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FF7F66', // Warm reddish-orange/coral
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  decorativeShapes: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  shape: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 200, 180, 0.4)', // Lighter semi-transparent reddish-orange
    borderRadius: 100,
  },
  shape1: {
    width: 120,
    height: 120,
    top: '15%',
    left: '10%',
    transform: [{ rotate: '45deg' }],
  },
  shape2: {
    width: 100,
    height: 100,
    top: '25%',
    right: '15%',
    transform: [{ rotate: '-30deg' }],
  },
  shape3: {
    width: 80,
    height: 80,
    bottom: '20%',
    left: '20%',
    transform: [{ rotate: '60deg' }],
  },
  shape4: {
    width: 90,
    height: 90,
    bottom: '30%',
    right: '10%',
    transform: [{ rotate: '-45deg' }],
  },
  bookContainer: {
    zIndex: 10,
  },
  book: {
    width: 140,
    height: 120,
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  spine: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -4,
    width: 8,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 2,
    zIndex: 10,
  },
  bookLeft: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 70,
    height: 100,
  },
  bookRight: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 70,
    height: 100,
  },
  page: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 4,
    bottom: 0,
    width: 60,
    height: 90,
  },
  // Left pages fanned upward and outward to the left
  leftPage1: {
    left: 0,
    transform: [{ rotate: '-15deg' }, { translateY: -5 }],
    zIndex: 3,
  },
  leftPage2: {
    left: 5,
    transform: [{ rotate: '-10deg' }, { translateY: -10 }],
    opacity: 0.8,
    zIndex: 2,
  },
  leftPage3: {
    left: 10,
    transform: [{ rotate: '-5deg' }, { translateY: -15 }],
    opacity: 0.6,
    zIndex: 1,
  },
  // Right pages fanned upward and outward to the right
  rightPage1: {
    right: 0,
    transform: [{ rotate: '15deg' }, { translateY: -5 }],
    zIndex: 3,
  },
  rightPage2: {
    right: 5,
    transform: [{ rotate: '10deg' }, { translateY: -10 }],
    opacity: 0.8,
    zIndex: 2,
  },
  rightPage3: {
    right: 10,
    transform: [{ rotate: '5deg' }, { translateY: -15 }],
    opacity: 0.6,
    zIndex: 1,
  },
});
