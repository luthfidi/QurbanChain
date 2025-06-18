import { useAccount, useReadContract } from "wagmi"
import { QURBAN_MANAGER_ADDRESS, QURBAN_MANAGER_ABI } from "../constants/index";

export const useRole = () => {
  const { isConnected, address } = useAccount();

  const msgSender = address ? address : '0x';

  const { data: isRT } = useReadContract({
    address: QURBAN_MANAGER_ADDRESS as `0x${string}`,
    abi: QURBAN_MANAGER_ABI,
    functionName: "hasRole",
    args: ["0xd03353e93ddb6c43ccb1aedab9d24fde90e2dc61e9a7b020ec215ca74ef922d5", msgSender],
    query: {
      enabled: isConnected,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })
  
  return {
    isRT: isRT
  };
};