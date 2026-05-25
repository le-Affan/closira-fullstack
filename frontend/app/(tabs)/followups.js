import React, { useEffect, useState } from "react";
import { FlatList, Text, View, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { useRouter, Stack } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { fetchEnquiries } from "../../services/api";
import { getChannelBadgeStyle, formatDateTime } from "../../constants/status";
import EmptyState from "../../components/EmptyState";

export default function FollowUpsScreen() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState([]);
  const [completedTaskIds, setCompletedTaskIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnquiries()
      .then(setEnquiries)
      .finally(() => setLoading(false));
  }, []);

  const handleMarkDone = (id, customerName) => {
    setCompletedTaskIds((prev) => [...prev, id]);
    Alert.alert(
      "Task Completed",
      `Follow-up task for ${customerName} marked as completed.`,
      [{ text: "OK" }]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="small" color="#0EA5E9" />
        <Text className="text-xs text-slate-500 mt-2">Loading follow-ups...</Text>
      </View>
    );
  }

  // Derive follow-ups from SOP matched (Qualified) leads that are not completed yet
  const followUpTasks = enquiries
    .filter((e) => e.status === "sop_matched" && !completedTaskIds.includes(e.id))
    .map((e) => {
      // Calculate a mock due time (e.g. 2 hours after creation)
      const creationTime = new Date(e.created_at).getTime();
      const dueTime = new Date(creationTime + 2 * 60 * 60 * 1000).toISOString();
      return {
        id: e.id,
        customer_name: e.customer_name,
        channel: e.channel,
        due_time: dueTime,
        message_preview: e.suggested_response || "Waiting for draft template response...",
      };
    });

  return (
    <View className="flex-1 bg-slate-50 items-center justify-start w-full">
      <Stack.Screen options={{ headerShown: false, title: "Follow-ups" }} />
      
      <View className="w-full max-w-3xl flex-1 bg-white border-x border-slate-200 shadow-sm">
        {/* Header */}
        <View className="bg-white border-b border-slate-200 px-4 pt-6 pb-4">
          <Text className="text-lg font-bold text-slate-900 tracking-tight">
            Pending Follow-ups
          </Text>
          <Text className="text-xs text-slate-500 mt-0.5">
            SOP Tasks & Draft Replying Action Items
          </Text>
        </View>

        {/* Tasks List */}
        <FlatList
          data={followUpTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          ListEmptyComponent={<EmptyState message="All follow-up tasks completed" />}
          renderItem={({ item }) => {
            const chStyle = getChannelBadgeStyle(item.channel);
            return (
              <View className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm mb-3 flex-col">
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center flex-1 pr-2 flex-wrap">
                    <Text className="text-sm font-bold text-slate-900 mr-2">
                      {item.customer_name}
                    </Text>
                    <View
                      style={{ backgroundColor: chStyle.backgroundColor }}
                      className="px-1.5 py-0.5 rounded mr-2"
                    >
                      <Text
                        style={{ color: chStyle.color }}
                        className="text-[8px] font-bold uppercase tracking-wider"
                      >
                        {chStyle.label}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Due Time Indicator */}
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={11} color="#D97706" className="mr-1" />
                    <Text className="text-[10px] text-amber-600 font-semibold">
                      Due: {formatDateTime(item.due_time)}
                    </Text>
                  </View>
                </View>

                {/* Message Template Preview */}
                <View className="bg-slate-50 p-2.5 rounded border border-slate-200 mb-3">
                  <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Suggested Draft Template
                  </Text>
                  <Text className="text-xs text-slate-600 leading-relaxed italic" numberOfLines={2}>
                    "{item.message_preview}"
                  </Text>
                </View>

                {/* Action Row */}
                <View className="flex-row justify-between items-center">
                  <TouchableOpacity
                    onPress={() => router.push(`/enquiries/${item.id}`)}
                    activeOpacity={0.7}
                    className="py-1"
                  >
                    <Text className="text-[10px] text-sky-600 font-bold uppercase tracking-wider">
                      View Conversation
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleMarkDone(item.id, item.customer_name)}
                    activeOpacity={0.7}
                    className="bg-emerald-600 px-3 py-1.5 rounded-md flex-row items-center"
                  >
                    <Ionicons name="checkmark-done" size={12} color="#FFFFFF" className="mr-1" />
                    <Text className="text-[10px] font-bold text-white uppercase tracking-wider">
                      Mark Done
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}
