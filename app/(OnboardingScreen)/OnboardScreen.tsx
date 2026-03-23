import { Colors, FontSize } from '@/constants/theme';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  Text,
  useColorScheme,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Declutter & Earn',
    description:
      'List your items in seconds and sell directly to your peers on campus. No shipping, just local deals',
    image: require('../../assets/images/OnboardScreen/BackgroundSell.png'),
  },
  {
    id: '2',
    title: 'Find what you need',
    description:
      'Shop electronics, clothes, books, and more from students on your campus',
    image: require('../../assets/images/OnboardScreen/BackgroundBuy.png'),
  },
];

const OnboardingScreen = () => {
  const scheme = useColorScheme();
  const themeSize = FontSize.size;
  const theme = scheme === 'dark' ? Colors.splashDark : Colors.splashLight;

  const flatListRef = useRef<Animated.FlatList<any>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const onNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      router.replace('/BottomTab/BotttomTabNav');
    }
  };

  const onSkip = () => {
    router.replace('/BottomTab/BotttomTabNav');
  };

  return (
    <View style={{ marginTop: -40, flex: 1,  backgroundColor: theme.background }}>
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(index);
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View
            style={{
              width,
              flex: 1,  
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 20,
              gap: 20,
            }}
          >
            <Text
              style={{
                color: theme.text,
                fontSize: themeSize.xlg_md,
                textAlign: 'center',
                fontWeight: '600',
                letterSpacing: 1.5,
                marginTop: 40,
              }}
            >
              Hive<Text style={{ color: theme.subText }}>Market</Text>
            </Text>

            <Image source={item.image} resizeMode="contain" />

            <Text
              style={{
                color: theme.text,
                fontSize: themeSize.xlg,
                textAlign: 'center',
                fontWeight: '600',
              }}
            >
              {item.title}
            </Text>

            <Text
              style={{
                marginTop: -10,
                color: theme.text,
                textAlign: 'center',
                fontWeight: '300',
                fontSize: themeSize.md,
                lineHeight: themeSize.md + 5,
                paddingHorizontal: 15,
              }}
            >
              {item.description}
            </Text>
          </View>
        )}
      />

      <View
        style={{
          
          marginTop: 15,
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {slides.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [13, 30, 13],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={{
                width: dotWidth,
                height: 13,
                borderRadius: 50,
                backgroundColor: theme.subText,
                opacity,
              }}
            />
          );
        })}
      </View>

      <View
        style={{
          marginTop: 15,
          width: '100%',
          alignItems: 'center',
          gap: 15,
        }}
      >
        <Pressable
          onPress={onNext}
          style={{
            width: '88%',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 20,
            padding: 15,
            backgroundColor: theme.subText,
            flexDirection: 'row',
            gap: 5,
          }}
        >
          <Text
            style={{
              color: "#fff",
              textAlign: 'center',
              fontSize: themeSize.md,
              fontWeight: '600',
              letterSpacing: 1.4,
            }}
          >
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Image
            source={require('../../assets/images/OnboardScreen/nextArrow.png')}
          />
        </Pressable>

        <Pressable onPress={onSkip}>
          <Text
            style={{
              color: theme.text,
              textDecorationLine: 'underline',
            }}
          >
            Skip for now
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default OnboardingScreen;