import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { fetchEnquiries } from "../../services/api";
import { formatDateTime } from "../../constants/status";
import SectionHeader from "../../components/SectionHeader";

export default function DashboardScreen() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick action state triggers
  const [triggerCount, setTriggerCount] = useState(0);

  useEffect(() => {
    fetchEnquiries()
      .then(setEnquiries)
      .finally(() => setLoading(false));
  }, [triggerCount]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="small" color="#0EA5E9" />
        <Text className="text-xs text-slate-500 mt-2">Loading operations console...</Text>
      </View>
    );
  }

  // Calculate statistics
  const totalLeads = enquiries.filter(e => e.status !== "escalated").length;
  const totalEscalations = enquiries.filter(e => e.status === "escalated").length;
  // Followups derived from Qualified status
  const totalFollowups = enquiries.filter(e => e.status === "sop_matched").length;

  // Compile recent activity log feed from all timelines
  const activityLog = [];
  enquiries.forEach((e) => {
    if (e.timeline) {
      e.timeline.forEach((item) => {
        activityLog.push({
          ...item,
          customer_name: e.customer_name,
          enquiry_id: e.id,
        });
      });
    }
  });

  // Sort activities chronologically descending (newest first)
  const sortedActivities = activityLog
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10); // show top 10 activities

  const handleSimulateLead = () => {
    // Simulate adding an inbound lead by modifying API local list or prompting action
    Alert.alert(
      "Simulate Inbound Lead",
      "A new WhatsApp enquiry has been simulated. Check the Leads tab.",
      [{ text: "OK" }]
    );
  };

  const handleSimulateEscalation = () => {
    Alert.alert(
      "Simulate Escalation",
      "Simulated manual escalation of high-urgency contract issue. Check the Escalations tab.",
      [{ text: "OK" }]
    );
  };

  return (
    <View className="flex-1 bg-slate-50 items-center justify-start w-full">
      <Stack.Screen options={{ headerShown: false, title: "Dashboard" }} />

      <ScrollView 
        className="w-full max-w-3xl flex-1 bg-white border-x border-slate-200 shadow-sm" 
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-slate-900 tracking-tight">
            Closira Control Center
          </Text>
          <Text className="text-xs text-slate-500 mt-0.5">
            Real-time Agent Support & Operations Feed
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row justify-between mb-6">
          <View className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex-1 mr-2 flex-col justify-between">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leads</Text>
              <Ionicons name="funnel-outline" size={14} color="#64748B" />
            </View>
            <Text className="text-xl font-bold text-slate-800">{totalLeads}</Text>
            <Text className="text-[9px] text-slate-400 mt-1">Active pipelines</Text>
          </View>

          <View className="bg-rose-50/50 border border-rose-100 rounded-lg p-3 flex-1 mx-1 flex-col justify-between">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Escalated</Text>
              <Ionicons name="warning-outline" size={14} color="#EF4444" />
            </View>
            <Text className="text-xl font-bold text-rose-700">{totalEscalations}</Text>
            <Text className="text-[9px] text-rose-500 mt-1">Needs review</Text>
          </View>

          <View className="bg-amber-50/50 border border-amber-100 rounded-lg p-3 flex-1 ml-2 flex-col justify-between">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Follow-ups</Text>
              <Ionicons name="alarm-outline" size={14} color="#D97706" />
            </View>
            <Text className="text-xl font-bold text-amber-700">{totalFollowups}</Text>
            <Text className="text-[9px] text-amber-500 mt-1">Action items</Text>
          </View>
        </View>

        {/* Quick Actions Section */}
        <SectionHeader title="Quick Operational Actions" />
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity 
            onPress={handleSimulateLead}
            activeOpacity={0.7}
            className="flex-row items-center bg-sky-50 border border-sky-100 px-3 py-2.5 rounded-lg flex-1 mr-2 justify-center"
          >
            <Ionicons name="add-circle-outline" size={16} color="#0EA5E9" className="mr-1.5" />
            <Text className="text-xs font-bold text-sky-700">Simulate Lead</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleSimulateEscalation}
            activeOpacity={0.7}
            className="flex-row items-center bg-rose-50/70 border border-rose-100 px-3 py-2.5 rounded-lg flex-1 ml-2 justify-center"
          >
            <Ionicons name="arrow-up-circle-outline" size={16} color="#EF4444" className="mr-1.5" />
            <Text className="text-xs font-bold text-rose-700">Escalate Dispute</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Feed Section */}
        <SectionHeader title="System Activity Feed" />
        <View className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          {sortedActivities.length > 0 ? (
            sortedActivities.map((act, index) => (
              <View 
                key={index} 
                className={`py-2 flex-col justify-start ${
                  index === sortedActivities.length - 1 ? "" : "border-b border-slate-150"
                }`}
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-xs font-bold text-slate-800 leading-tight">
                    {act.customer_name}
                  </Text>
                  <Text className="text-[9px] text-slate-400">
                    {formatDateTime(act.timestamp)}
                  </Text>
                </View>
                <Text className="text-xs text-slate-500 leading-relaxed font-normal">
                  Status changed to <Text className="font-semibold">{act.status}</Text> ({act.note})
                </Text>
              </View>
            ))
          ) : (
            <Text className="text-xs text-slate-400 italic text-center py-4">
              No recent log activities
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
