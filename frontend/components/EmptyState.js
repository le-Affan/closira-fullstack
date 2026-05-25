import React from 'react';
import { View, Text } from 'react-native';

export default function EmptyState({ message = 'No enquiries found' }) {
  return (
    <View className="flex-1 items-center justify-center p-8 bg-slate-50">
      <Text className="text-base font-bold text-slate-800 text-center">
        {message}
      </Text>
      <Text className="text-xs text-slate-400 mt-1.5 text-center leading-relaxed max-w-[240px]">
        Incoming customer tickets from WhatsApp, Email, or Call will appear here for review.
      </Text>
    </View>
  );
}
