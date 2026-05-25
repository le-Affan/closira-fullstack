import React from 'react';
import { View, Text } from 'react-native';
import { getStatusMeta, formatDateTime } from '../constants/status';

export default function TimelineEvent({ event, isLast }) {
  const { status, note, timestamp } = event;
  const meta = getStatusMeta(status);


  return (
    <View className="flex-row">
      {/* Indicator Dot & Vertical Line */}
      <View className="items-center mr-3 w-3.5 relative">
        <View 
          style={{ backgroundColor: meta.color }} 
          className="w-2 h-2 rounded-full mt-1.5 z-10" 
        />
        {!isLast && <View className="w-[1.5px] absolute top-3.5 bottom-0 bg-slate-200" />}
      </View>

      {/* Event Details */}
      <View className={`flex-1 ${isLast ? '' : 'pb-4'}`}>
        <View className="flex-row justify-between items-center">
          <Text className="text-sm font-semibold text-slate-800">
            {meta.label}
          </Text>
          <Text className="text-xs text-slate-400">
            {formatDateTime(timestamp)}
          </Text>
        </View>
        {note && (
          <Text className="text-xs text-slate-500 mt-1 leading-normal">
            {note}
          </Text>
        )}
      </View>
    </View>
  );
}
