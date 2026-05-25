import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import StatusBadge from './StatusBadge';
import { getChannelLabel, formatDateTime } from '../constants/status';

export default function EnquiryCard({ enquiry, onPress }) {
  const { customer_name, channel, status, messages, created_at } = enquiry;
  
  const snippet = messages && messages.length > 0 
    ? messages[0].content 
    : 'No messages recorded';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-3 flex-col"
    >
      <View className="flex-row justify-between items-start mb-2.5">
        <View className="flex-1 pr-3">
          <Text className="text-base font-bold text-slate-900 leading-snug">
            {customer_name}
          </Text>
          <Text className="text-xs text-slate-500 mt-1">
            Via {getChannelLabel(channel)} · {formatDateTime(created_at)}
          </Text>
        </View>
        <StatusBadge status={status} />
      </View>

      <Text className="text-sm text-slate-600 mb-3 leading-relaxed" numberOfLines={2}>
        {snippet}
      </Text>

      {enquiry.sop_match && (
        <View className="bg-slate-50 border border-slate-200 self-start px-2.5 py-1 rounded">
          <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            SOP Match: {enquiry.sop_match}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

