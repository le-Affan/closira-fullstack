import React, { useEffect, useState } from "react";
import { FlatList, Text, View, ActivityIndicator } from "react-native";
import { useRouter, Stack } from "expo-router";

import { fetchEnquiries } from "../services/api";
import EnquiryCard from "../components/EnquiryCard";
import EmptyState from "../components/EmptyState";

export default function EnquiriesDashboardScreen() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnquiries()
      .then(setEnquiries)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="small" color="#0EA5E9" />
        <Text className="text-xs text-slate-500 mt-2">Loading operations dashboard...</Text>
      </View>
    );
  }

  // Count active enquiries that need action
  const activeCount = enquiries.filter(
    (e) => e.status !== "sop_matched"
  ).length;

  return (
    <View className="flex-1 bg-slate-50">
      <Stack.Screen options={{ headerShown: false, title: "Operations Console" }} />
      {/* Operations Header */}
      <View className="bg-white border-b border-slate-200 px-4 pt-8 pb-4">
        <Text className="text-xl font-bold text-slate-900 tracking-tight">
          Closira Operations
        </Text>
        <Text className="text-xs text-slate-500 mt-1">
          Support Agents & Automation Console
        </Text>

        {/* Operational Indicators */}
        <View className="flex-row mt-4">
          <View className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-md mr-3">
            <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Total Inbox
            </Text>
            <Text className="text-lg font-bold text-slate-800 mt-0.5">
              {enquiries.length}
            </Text>
          </View>
          <View className="bg-amber-50/70 border border-amber-100 px-3 py-2 rounded-md">
            <Text className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">
              Pending Review
            </Text>
            <Text className="text-lg font-bold text-amber-800 mt-0.5">
              {activeCount}
            </Text>
          </View>
        </View>
      </View>

      {/* Tickets List */}
      <FlatList
        data={enquiries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item }) => (
          <EnquiryCard
            enquiry={item}
            onPress={() => router.push(`/enquiries/${item.id}`)}
          />
        )}
      />
    </View>
  );
}
