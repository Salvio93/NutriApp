import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

export default function CalorieWheel({ consumed, target }) {
  const navigation = useNavigation();
  const radius = 80;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = consumed / target;

  return (
    <View style={{ alignItems: 'center' }}>
      
      <Svg width={200} height={200}>
        <G rotation="-90" origin="100, 100">
          <Circle
            stroke="#eee"
            cx="100"
            cy="100"
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke="#ff6347"
            cx="100"
            cy="100"
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
        </G>
      </Svg>
      <Text style={{ marginTop: 20, marginLeft:30, fontSize: 18 }}>
        {consumed} / {target} kcal
      </Text>
    </View>
  );
}
