import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { fetchEnquiryHistory } from "../../services/api";
import { getStatusMeta, getChannelLabel } from "../../constants/status";

export default function EnquiryDetailScreen() {
  const { id } = useLocalSearchParams();
  const [enquiry, setEnquiry] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnquiryHistory(id)
      .then(setEnquiry)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <Text className="text-slate-500">Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="text-red-500 font-semibold">Error</Text>
        <Text className="text-slate-500 text-sm mt-1 text-center">{error}</Text>
      </View>
    );
  }

  const meta = getStatusMeta(enquiry.status);

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

      {/* Header */}
      <View className="bg-white rounded-xl p-4 border border-slate-200 mb-4">
        <Text className="text-base font-bold text-slate-800">{enquiry.customer_name}</Text>
        <Text className="text-sm text-slate-500 mt-0.5">
          {getChannelLabel(enquiry.channel)} · {new Date(enquiry.created_at).toLocaleString()}
        </Text>
        <Text className="text-sm font-medium mt-2" style={{ color: meta.color }}>
          {meta.label}
        </Text>
        {enquiry.escalation_reason ? (
          <Text className="text-xs text-red-400 mt-1">{enquiry.escalation_reason}</Text>
        ) : null}
        {enquiry.sop_match ? (
          <Text className="text-xs text-slate-400 mt-1">SOP: {enquiry.sop_match}</Text>
        ) : null}
      </View>

      {/* Message thread */}
      <Text className="text-xs font-semibold text-slate-400 uppercase mb-2">Messages</Text>
      {enquiry.messages.map((msg) => (
        <View
          key={msg.id}
          className="bg-white rounded-xl p-3 border border-slate-200 mb-2"
        >
          <Text className="text-xs font-semibold text-slate-400 uppercase mb-1">
            {msg.sender}
          </Text>
          <Text className="text-sm text-slate-700">{msg.content}</Text>
          <Text className="text-xs text-slate-400 mt-1">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      ))}

      {/* Timeline */}
      <Text className="text-xs font-semibold text-slate-400 uppercase mt-4 mb-2">Timeline</Text>
      {enquiry.timeline.map((entry, i) => (
        <View key={i} className="flex-row items-start mb-2">
          <View className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 mr-3" />
          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-700">{entry.status}</Text>
            {entry.note ? (
              <Text className="text-xs text-slate-400">{entry.note}</Text>
            ) : null}
            <Text className="text-xs text-slate-300">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        </View>
      ))}

    </ScrollView>
  );
}
