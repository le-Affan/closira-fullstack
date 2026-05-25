import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

import { fetchEnquiries } from "../services/api";
import { getStatusMeta, getChannelLabel } from "../constants/status";

export default function EnquiriesListScreen() {
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
        <Text className="text-slate-500">Loading enquiries…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <Text className="px-4 pt-6 pb-2 text-lg font-bold text-slate-800">
        Enquiries ({enquiries.length})
      </Text>

      <FlatList
        data={enquiries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => {
          const meta = getStatusMeta(item.status);
          return (
            <TouchableOpacity
              onPress={() => router.push(`/enquiries/${item.id}`)}
              className="bg-white rounded-xl p-4 border border-slate-200"
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text className="font-semibold text-slate-800">
                  {item.customer_name}
                </Text>
                <Text className="text-xs text-slate-400">
                  {getChannelLabel(item.channel)}
                </Text>
              </View>

              <Text className="text-slate-500 text-sm mb-2" numberOfLines={1}>
                {item.messages[0]?.content ?? "No message"}
              </Text>

              <Text
                className="text-xs font-medium"
                style={{ color: meta.color }}
              >
                {meta.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
