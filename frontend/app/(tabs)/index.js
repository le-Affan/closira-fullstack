import React, { useState, useCallback } from "react";
import { ScrollView, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { fetchEnquiries, addMockEnquiry } from "../../services/api";
import { getChannelBadgeStyle, formatDateTime } from "../../constants/status";
import SectionHeader from "../../components/SectionHeader";

export default function DashboardScreen() {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchEnquiries().then(setEnquiries).finally(() => setLoading(false));
    }, [])
  );

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
  const totalFollowups = enquiries.filter(e => e.status === "sop_matched").length;
  // Deriving Missed count dynamically from call channels
  const totalMissed = enquiries.filter(e => e.channel === "call").length;

  // Compile recent activity log feed from all timelines
  const activityLog = [];
  enquiries.forEach((e) => {
    if (e.timeline) {
      e.timeline.forEach((item) => {
        activityLog.push({
          ...item,
          customer_name: e.customer_name,
          channel: e.channel,
          enquiry_id: e.id,
        });
      });
    }
  });

  // Sort activities chronologically descending (newest first)
  const sortedActivities = activityLog
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 8); // show top 8 activities

  const handleSimulateLead = () => {
    const names = ["Liam Carter", "Olivia Vance", "Ethan Hunt", "Sofia Martinez", "Noah Patel", "Emma Stone"];
    const channels = ["whatsapp", "email", "call"];
    const messagesByChannel = {
      whatsapp: [
        "Hi! Do you have pricing for the premium gold package?",
        "Hey there, just following up on my booking request.",
        "Hello, is there any availability for tomorrow afternoon?"
      ],
      email: [
        "Inquiry regarding business hours and consult packages.",
        "Requesting pricing plans for enterprise subscriptions.",
        "Could you send over the custom quote template?"
      ],
      call: [
        "Missed callback request regarding onboarding scheduling.",
        "Inbound call log: customer inquiring about office address.",
        "Callback requested regarding cleaning packages."
      ]
    };
    const sops = ["Pricing Inquiry", "Booking Request", "General Consultation"];

    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomChannel = channels[Math.floor(Math.random() * channels.length)];
    const channelMsgs = messagesByChannel[randomChannel];
    const randomMsg = channelMsgs[Math.floor(Math.random() * channelMsgs.length)];
    
    const isQualified = Math.random() > 0.4;
    const status = isQualified ? "sop_matched" : "new";
    const sop_match = isQualified ? sops[Math.floor(Math.random() * sops.length)] : null;
    const suggested_response = isQualified 
      ? `Thank you for reaching out. We can help with your ${sop_match?.toLowerCase()}. Let us know your details.`
      : null;

    const newLead = {
      id: `simulated-lead-${Date.now()}`,
      customer_name: randomName,
      channel: randomChannel,
      status,
      sop_match,
      suggested_response,
      escalation_reason: null,
      created_at: new Date().toISOString(),
      messages: [
        {
          id: `sim-msg-${Date.now()}-a`,
          sender: "customer",
          content: randomMsg,
          timestamp: new Date().toISOString(),
        }
      ],
      timeline: [
        {
          status: "queued",
          note: "Enquiry received",
          timestamp: new Date().toISOString(),
        },
        ...(isQualified ? [{
          status: "sop_matched",
          note: `Auto-qualified: SOP matched (${sop_match})`,
          timestamp: new Date().toISOString(),
        }] : [])
      ]
    };

    addMockEnquiry(newLead).then(() => {
      fetchEnquiries().then(setEnquiries);
    });
  };

  const handleSimulateEscalation = () => {
    const names = ["Marcus Sterling", "Nadia Petrova", "Derrick Jones", "Yuki Tanaka"];
    const reasons = [
      "Customer is requesting immediate callback regarding contract discrepancy.",
      "Billing dispute: double charged on premium invoice.",
      "Agent review requested: customer expressing extreme frustration with delayed delivery."
    ];
    const channels = ["whatsapp", "email", "call"];

    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomReason = reasons[Math.floor(Math.random() * reasons.length)];
    const randomChannel = channels[Math.floor(Math.random() * channels.length)];

    const newEsc = {
      id: `simulated-esc-${Date.now()}`,
      customer_name: randomName,
      channel: randomChannel,
      status: "escalated",
      sop_match: null,
      suggested_response: null,
      escalation_reason: randomReason,
      created_at: new Date().toISOString(),
      messages: [
        {
          id: `sim-msg-${Date.now()}-a`,
          sender: "customer",
          content: "URGENT: I need someone to resolve my billing discrepancy immediately. I cannot wait any longer.",
          timestamp: new Date().toISOString(),
        }
      ],
      timeline: [
        {
          status: "queued",
          note: "Enquiry received",
          timestamp: new Date().toISOString(),
        },
        {
          status: "escalated",
          note: `Auto-escalated: ${randomReason}`,
          timestamp: new Date().toISOString(),
        }
      ]
    };

    addMockEnquiry(newEsc).then(() => {
      fetchEnquiries().then(setEnquiries);
    });
  };

  return (
    <View className="flex-1 bg-slate-50 items-center justify-start w-full">
      <Stack.Screen options={{ headerShown: false, title: "Dashboard" }} />

      <ScrollView 
        className="w-full max-w-3xl flex-1 bg-white border-x border-slate-200 shadow-sm" 
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="mb-5">
          <Text className="text-lg font-bold text-slate-900 tracking-tight">
            Closira Control Center
          </Text>
          <Text className="text-xs text-slate-500 mt-0.5">
            Real-time Agent Support & Operations Feed
          </Text>
        </View>

        {/* Stats Grid - Responsive 2x2 on mobile, 4x1 on desktop */}
        <View className="flex-row flex-wrap -mx-1 mb-4">
          <View className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 min-w-[120px] flex-1 m-1 flex-col justify-between">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Leads</Text>
              <Ionicons name="funnel-outline" size={13} color="#64748B" />
            </View>
            <Text className="text-base font-bold text-slate-800">{totalLeads}</Text>
            <Text className="text-[8px] text-slate-400 mt-0.5">Active</Text>
          </View>

          <View className="bg-rose-50/50 border border-rose-100 rounded-lg p-2.5 min-w-[120px] flex-1 m-1 flex-col justify-between">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">Escalated</Text>
              <Ionicons name="warning-outline" size={13} color="#EF4444" />
            </View>
            <Text className="text-base font-bold text-rose-700">{totalEscalations}</Text>
            <Text className="text-[8px] text-rose-500 mt-0.5">Urgent</Text>
          </View>

          <View className="bg-amber-50/50 border border-amber-100 rounded-lg p-2.5 min-w-[120px] flex-1 m-1 flex-col justify-between">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Follow-ups</Text>
              <Ionicons name="alarm-outline" size={13} color="#D97706" />
            </View>
            <Text className="text-base font-bold text-amber-700">{totalFollowups}</Text>
            <Text className="text-[8px] text-amber-500 mt-0.5">Actionable</Text>
          </View>

          <View className="bg-slate-100 border border-slate-200 rounded-lg p-2.5 min-w-[120px] flex-1 m-1 flex-col justify-between">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Missed</Text>
              <Ionicons name="close-circle-outline" size={13} color="#475569" />
            </View>
            <Text className="text-base font-bold text-slate-800">{totalMissed}</Text>
            <Text className="text-[8px] text-slate-500 mt-0.5">Callbacks</Text>
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
            sortedActivities.map((act, index) => {
              const chStyle = getChannelBadgeStyle(act.channel);
              return (
                <View 
                  key={index} 
                  className={`py-2 flex-col justify-start ${
                    index === sortedActivities.length - 1 ? "" : "border-b border-slate-200"
                  }`}
                >
                  <View className="flex-row justify-between items-center mb-1 flex-wrap">
                    <View className="flex-row items-center flex-wrap">
                      <Text className="text-xs font-bold text-slate-800 mr-2 leading-tight">
                        {act.customer_name}
                      </Text>
                      
                      {act.channel && (
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
                      )}

                      <Text className="text-[10px] text-slate-500 font-semibold">
                        ({act.status})
                      </Text>
                    </View>

                    <Text className="text-[9px] text-slate-400">
                      {formatDateTime(act.timestamp)}
                    </Text>
                  </View>
                  <Text className="text-xs text-slate-500 leading-relaxed font-normal">
                    Event: {act.note}
                  </Text>
                </View>
              );
            })
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
