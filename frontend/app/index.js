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
    <View className="flex-1 bg-slate-50 items-center justify-start w-full">
      <Stack.Screen options={{ headerShown: false, title: "Operations Console" }} />
      
      <View className="w-full max-w-3xl flex-1 bg-white border-x border-slate-200 shadow-sm">
        {/* Operations Header */}
        <View className="bg-white border-b border-slate-200 px-4 pt-6 pb-4">
          <Text className="text-lg font-bold text-slate-900 tracking-tight">
            Closira Operations
          </Text>
          <Text className="text-xs text-slate-500 mt-0.5">
            Support Agents & Automation Console
          </Text>

          {/* Operational Indicators */}
          <View className="flex-row mt-3">
            <View className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded mr-3 flex-row items-center">
              <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mr-1.5">
                Total Inbox
              </Text>
              <Text className="text-xs font-bold text-slate-800">
                {enquiries.length}
              </Text>
            </View>
            <View className="bg-amber-50/70 border border-amber-100 px-2.5 py-1 rounded flex-row items-center">
              <Text className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mr-1.5">
                Pending Review
              </Text>
              <Text className="text-xs font-bold text-amber-800">
                {activeCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Tickets List */}
        <FlatList
          data={enquiries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          ListEmptyComponent={<EmptyState />}
          renderItem={({ item }) => (
            <EnquiryCard
              enquiry={item}
              onPress={() => router.push(`/enquiries/${item.id}`)}
            />
          )}
        />
      </View>
    </View>
  );
}
