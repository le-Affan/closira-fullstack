import React, { useEffect, useState } from "react";
import { FlatList, Text, View, ActivityIndicator } from "react-native";
import { useRouter, Stack } from "expo-router";

import { fetchEnquiries } from "../../services/api";
import EnquiryCard from "../../components/EnquiryCard";
import EmptyState from "../../components/EmptyState";

export default function LeadsScreen() {
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
        <Text className="text-xs text-slate-500 mt-2">Loading active leads...</Text>
      </View>
    );
  }

  // Filter to show active, non-escalated enquiries
  const leads = enquiries.filter((e) => e.status !== "escalated");

  return (
    <View className="flex-1 bg-slate-50 items-center justify-start w-full">
      <Stack.Screen options={{ headerShown: false, title: "Leads" }} />
      
      <View className="w-full max-w-3xl flex-1 bg-white border-x border-slate-200 shadow-sm">
        {/* Header */}
        <View className="bg-white border-b border-slate-200 px-4 pt-6 pb-4">
          <Text className="text-lg font-bold text-slate-900 tracking-tight">
            Active Leads
          </Text>
          <Text className="text-xs text-slate-500 mt-0.5">
            Support Pipeline & SOP Qualified Inbound Tickets
          </Text>
        </View>

        {/* Tickets List */}
        <FlatList
          data={leads}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 40, flexGrow: 1 }}
          ListEmptyComponent={<EmptyState message="No active leads in pipeline" />}
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
