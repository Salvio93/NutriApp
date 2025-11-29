import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

export default function CalorieWheel({ consumed, target }) {
  const radius = 80;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = consumed / target;
  // Calculate progress (can exceed 1)

  //Dynamic color
  const progressColor = consumed > target ? '#ff3b30' : '#ffffffff';

  // When over target, keep the full circle drawn (no overflow bug)
  const dashOffset =
    progress >= 1 ? 0 : circumference * (1 - Math.min(progress, 1));

  return (
    <View style={{ alignItems: 'center' }}>
      
      <Svg width={200} height={200}>
        <G rotation="-90" origin="100, 100">
          <Circle
            stroke="#7c6f6fff"
            cx="100"
            cy="100"
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke="#1575f3ff"
            cx="100"
            cy="100"
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}

            strokeDashoffset={dashOffset}
            strokeLinecap="round"          />
        </G>
      </Svg>
      <Text
        style={{
          marginTop: 20,
          fontSize: 18,
          fontWeight: '600',
          color: progressColor,
        }}
      >
        {consumed} / {target} kcal
      </Text>
    </View>
  );
}
