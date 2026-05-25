import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import StatusBadge from './StatusBadge';
import { getChannelLabel, formatDateTime } from '../constants/status';

export default function EnquiryCard({ enquiry, onPress }) {
  const { customer_name, channel, status, messages, created_at, sop_match } = enquiry;
  
  const snippet = messages && messages.length > 0 
    ? messages[0].content 
    : 'No messages recorded';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm mb-2 flex-col"
    >
      <View className="flex-row justify-between items-center mb-1.5">
        <View className="flex-row items-center flex-1 pr-2">
          <Text className="text-sm font-bold text-slate-900 leading-tight mr-2">
            {customer_name}
          </Text>
          <Text className="text-[10px] text-slate-400">
            {getChannelLabel(channel)} · {formatDateTime(created_at)}
          </Text>
        </View>
        <StatusBadge status={status} />
      </View>

      <Text className="text-xs text-slate-600 mb-2 leading-relaxed" numberOfLines={1}>
        {snippet}
      </Text>

      {sop_match && (
        <View className="bg-slate-50 border border-slate-200 self-start px-1.5 py-0.5 rounded">
          <Text className="text-[9px] font-semibold text-slate-500 uppercase tracking-wide">
            SOP Match: {sop_match}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
