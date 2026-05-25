import React, { useState, useCallback } from "react";
import { FlatList, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter, Stack, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { fetchEnquiries, updateMockEnquiry } from "../../services/api";
import { getChannelBadgeStyle, formatDateTime } from "../../constants/status";
import EmptyState from "../../components/EmptyState";

export default function EscalationsScreen() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchEnquiries()
        .then(setEnquiries)
        .finally(() => setLoading(false));
    }, [])
  );

  const handleResolveEscalation = (id) => {
    // Resolve globally and refresh local state
    updateMockEnquiry(id, { status: "sop_matched", escalation_reason: null }).then(() => {
      fetchEnquiries().then(setEnquiries);
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="small" color="#0EA5E9" />
        <Text className="text-xs text-slate-500 mt-2">Loading escalated tickets...</Text>
      </View>
    );
  }

  // Filter to show escalated enquiries only
  const escalations = enquiries.filter((e) => e.status === "escalated");

  return (
    <View className="flex-1 bg-slate-50 items-center justify-start w-full">
      <Stack.Screen options={{ headerShown: false, title: "Escalations" }} />
      
      <View className="w-full max-w-3xl flex-1 bg-white border-x border-slate-200 shadow-sm">
        {/* Header */}
        <View className="bg-white border-b border-slate-200 px-4 pt-6 pb-4">
          <Text className="text-lg font-bold text-slate-900 tracking-tight">
            Urgent Escalations
          </Text>
          <Text className="text-xs text-slate-500 mt-0.5">
            Tickets Flagged for Immediate Human Intervention
          </Text>
        </View>

        {/* Escalations List */}
        <FlatList
          data={escalations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 40, flexGrow: 1 }}
          ListEmptyComponent={<EmptyState message="No pending escalations found" />}
          renderItem={({ item }) => {
            const chStyle = getChannelBadgeStyle(item.channel);
            // Determine urgency based on keyword matches in content
            const isHighUrgency =
              item.escalation_reason?.toLowerCase().includes("billing") ||
              item.messages?.[0]?.content?.toLowerCase().includes("immediately");
            
            return (
              <TouchableOpacity
                onPress={() => router.push(`/enquiries/${item.id}`)}
                activeOpacity={0.7}
                className="bg-white p-3 rounded-lg border-l-4 border-l-rose-500 border-y border-r border-slate-200 shadow-sm mb-3 flex-col"
              >
                <View className="flex-row justify-between items-center mb-1.5">
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
                    <Text className="text-[10px] text-slate-400">
                      {formatDateTime(item.created_at)}
                    </Text>
                  </View>
                  
                  {/* Urgency Badge */}
                  <View className={`px-1.5 py-0.5 rounded ${isHighUrgency ? 'bg-red-50' : 'bg-amber-50'}`}>
                    <Text className={`text-[8px] font-bold uppercase tracking-wider ${isHighUrgency ? 'text-red-600' : 'text-amber-600'}`}>
                      {isHighUrgency ? "High Urgency" : "Medium"}
                    </Text>
                  </View>
                </View>

                {/* Escalation Reason */}
                <View className="bg-rose-50/50 p-2.5 rounded border border-rose-100/70 mb-3">
                  <Text className="text-xs text-rose-800 font-medium leading-relaxed">
                    Reason: {item.escalation_reason || "Flagged for manual review."}
                  </Text>
                </View>

                {/* Action Row */}
                <View className="flex-row justify-between items-center">
                  <Text className="text-[10px] text-slate-400 italic">
                    Tap card to view full thread
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleResolveEscalation(item.id)}
                    activeOpacity={0.7}
                    className="bg-slate-800 px-3 py-1.5 rounded-md flex-row items-center"
                  >
                    <Ionicons name="checkmark-circle-outline" size={12} color="#FFFFFF" className="mr-1" />
                    <Text className="text-[10px] font-bold text-white uppercase tracking-wider">
                      Mark Resolved
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );
}
