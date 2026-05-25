import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";

import { fetchEnquiryHistory } from "../../services/api";
import { getChannelLabel, formatDateTime } from "../../constants/status";
import MessageBubble from "../../components/MessageBubble";
import TimelineEvent from "../../components/TimelineEvent";
import SectionHeader from "../../components/SectionHeader";
import StatusBadge from "../../components/StatusBadge";

export default function EnquiryDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [enquiry, setEnquiry] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || typeof id !== "string") {
      setError("Invalid or missing Enquiry ID.");
      setLoading(false);
      return;
    }

    fetchEnquiryHistory(id)
      .then(setEnquiry)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="small" color="#0EA5E9" />
        <Text className="text-xs text-slate-500 mt-2">Loading enquiry details...</Text>
      </View>
    );
  }

  if (error || !enquiry) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-6">
        <Text className="text-sm font-bold text-red-500">Error Loading Enquiry</Text>
        <Text className="text-xs text-slate-500 mt-1.5 text-center leading-relaxed">
          {error || "Enquiry not found or could not be loaded."}
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="mt-4 bg-slate-800 px-4 py-2 rounded-md"
        >
          <Text className="text-white text-xs font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Ensure message thread and timeline logs are ordered chronologically (ascending)
  const sortedMessages = enquiry.messages 
    ? [...enquiry.messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    : [];

  const sortedTimeline = enquiry.timeline 
    ? [...enquiry.timeline].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    : [];

  return (
    <View className="flex-1 bg-slate-50 items-center justify-start w-full">
      <Stack.Screen 
        options={{ 
          headerShown: false, 
          title: `${enquiry.customer_name} - Enquiry` 
        }} 
      />

      <ScrollView 
        className="w-full max-w-3xl flex-1 bg-white border-x border-slate-200 shadow-sm" 
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
        {/* Navigation Breadcrumb with safe touch hitSlop targets */}
        <TouchableOpacity 
          onPress={() => router.back()} 
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className="mb-4 py-1.5 self-start flex-row items-center"
        >
          <Text className="text-xs font-bold text-sky-600">
            ← Back to Inbox
          </Text>
        </TouchableOpacity>

        {/* Customer Header Info Card */}
        <View className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm mb-4">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1 pr-3">
              <Text className="text-base font-bold text-slate-900 leading-snug">
                {enquiry.customer_name}
              </Text>
              <Text className="text-[10px] text-slate-400 mt-1">
                ID: {enquiry.id}
              </Text>
            </View>
            <StatusBadge status={enquiry.status} />
          </View>

          <View className="h-[1px] bg-slate-100 my-2" />

          <View className="flex-row justify-between text-xs text-slate-500 mt-2">
            <View>
              <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Inbound Channel</Text>
              <Text className="text-xs font-bold text-slate-700 mt-1">
                {getChannelLabel(enquiry.channel)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Received At</Text>
              <Text className="text-xs font-bold text-slate-700 mt-1">
                {formatDateTime(enquiry.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Escalation Alert Visibility */}
        {enquiry.status === "escalated" && (
          <View className="bg-rose-50 border-l-4 border-l-rose-500 border-y border-r border-rose-200 rounded-r-lg p-4 mb-4">
            <Text className="text-xs font-bold text-rose-800 uppercase tracking-widest mb-1.5">
              ⚠️ Escalated to Agent Review
            </Text>
            <Text className="text-xs text-rose-700 leading-relaxed font-normal">
              Reason: {enquiry.escalation_reason || "No matched workflow SOP found; auto-flagged for human handling."}
            </Text>
          </View>
        )}

        {/* SOP Matching visibility */}
        {enquiry.sop_match && (
          <View className="bg-slate-50 border-l-4 border-l-slate-400 border-y border-r border-slate-200 rounded-r-lg p-4 mb-4">
            <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Suggested SOP Match
            </Text>
            <Text className="text-xs text-slate-700 font-semibold mb-1">
              Protocol: {enquiry.sop_match}
            </Text>
            {enquiry.suggested_response && (
              <View className="bg-white border border-slate-200 p-3 rounded mt-2.5">
                <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Generated Draft Response</Text>
                <Text className="text-xs text-slate-600 leading-relaxed italic">
                  "{enquiry.suggested_response}"
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Follow-up State Visibility */}
        <View className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            ⏰ Follow-up Actions
          </Text>
          <Text className="text-xs text-slate-500 leading-relaxed mt-1.5">
            {enquiry.status === "escalated" 
              ? "Cannot schedule follow-up actions while ticket remains escalated. Please resolve the escalation first." 
              : "No active follow-ups scheduled. Standard automatic delay reminders can be scheduled by admin scripts."}
          </Text>
        </View>

        {/* Message History list */}
        <SectionHeader title="Conversation Thread" />
        <View className="mb-2">
          {sortedMessages.length > 0 ? (
            sortedMessages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          ) : (
            <Text className="text-xs text-slate-400 italic text-center py-4 bg-white rounded border border-slate-200">
              No messages recorded in thread
            </Text>
          )}
        </View>

        {/* Timeline Audit History */}
        <SectionHeader title="Enquiry Timeline Logs" />
        <View className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          {sortedTimeline.length > 0 ? (
            sortedTimeline.map((event, index) => (
              <TimelineEvent 
                key={index} 
                event={event} 
                isLast={index === sortedTimeline.length - 1} 
              />
            ))
          ) : (
            <Text className="text-xs text-slate-400 italic">No historical timeline updates recorded</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
