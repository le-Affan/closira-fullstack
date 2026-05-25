import React from 'react';
import { View, Text } from 'react-native';

export default function MessageBubble({ message }) {
  const { sender, content, timestamp } = message;
  const isCustomer = sender === 'customer';
  
  const timeStr = new Date(timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <View className={`flex-row mb-3 ${isCustomer ? 'justify-start' : 'justify-end'}`}>
      <View 
        className={`max-w-[85%] p-3.5 rounded-lg border ${
          isCustomer 
            ? 'bg-white border-slate-200 rounded-bl-none' 
            : sender === 'ai'
              ? 'bg-sky-50 border-sky-100 rounded-br-none'
              : 'bg-emerald-50 border-emerald-100 rounded-br-none'
        }`}
      >
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-6">
            {sender === 'customer' ? 'Customer' : sender === 'ai' ? 'AI Copilot' : 'Agent'}
          </Text>
          <Text className="text-[10px] text-slate-400">{timeStr}</Text>
        </View>
        <Text className="text-sm text-slate-800 leading-relaxed font-normal">
          {content}
        </Text>
      </View>
    </View>
  );
}
