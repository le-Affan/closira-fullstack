import React from 'react';
import { View, Text } from 'react-native';
import { getStatusMeta } from '../constants/status';

export default function StatusBadge({ status }) {
  const meta = getStatusMeta(status);

  return (
    <View
      style={{ backgroundColor: meta.backgroundColor }}
      className="px-2 py-0.5 rounded border border-slate-100 items-center justify-center flex-row self-start"
    >
      <View
        style={{ backgroundColor: meta.color }}
        className="w-1.5 h-1.5 rounded-full mr-1.5"
      />
      <Text
        style={{ color: meta.color }}
        className="text-[9px] font-bold uppercase tracking-wider"
      >
        {meta.label}
      </Text>
    </View>
  );
}
