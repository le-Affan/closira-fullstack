import React from 'react';
import { View, Text } from 'react-native';

export default function SectionHeader({ title }) {
  return (
    <View className="flex-row items-center mt-6 mb-3">
      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {title}
      </Text>
      <View className="flex-1 h-[1px] bg-slate-200 ml-3" />
    </View>
  );
}
