import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import type { Pin, IpfsCluster } from "@prisma/client";

// Extend the Pin type to handle string serialization of BigInt and Dates
interface SerializedPin extends Omit<Pin, 'size' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
  size: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  ipfsCluster: SerializedIpfsCluster;
}

interface SerializedIpfsCluster extends Omit<IpfsCluster, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export function usePins() {
  const { getAccessToken } = usePrivy();
  
  return useQuery({
    queryKey: ["pins"],
    queryFn: async () => {
      const token = await getAccessToken();
      const response = await fetch("/api/pins", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch pins");
      return response.json() as Promise<SerializedPin[]>;
    },
  });
}

export function useUpdatePin() {
  const queryClient = useQueryClient();
  const { getAccessToken } = usePrivy();
  
  return useMutation({
    mutationFn: async ({ cid, name }: { cid: string; name: string }) => {
      const token = await getAccessToken();
      const response = await fetch(`/api/pins/${cid}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Failed to update pin");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pins"] });
    },
  });
}

export function useDeletePin() {
  const queryClient = useQueryClient();
  const { getAccessToken } = usePrivy();
  
  return useMutation({
    mutationFn: async (cid: string) => {
      const token = await getAccessToken();
      const response = await fetch(`/api/pins/${cid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete pin");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pins"] });
    },
  });
} 