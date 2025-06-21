import { motion } from 'framer-motion';
import { Calendar, Users, Coins, Clock, CheckCircle } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract } from "wagmi"
import { QURBAN_MANAGER_ADDRESS, QURBAN_MANAGER_ABI, QURBAN_TOKEN_ADDRESS, QURBAN_TOKEN_ABI, APPROVE_VALUE, QURBAN_ANIMAL_ABI, QURBAN_ANIMAL_ADDRESS } from "../../constants/index";
import { waitForTransactionReceipt, readContract } from "@wagmi/core"
import toast from "react-hot-toast"
import { config } from '../../App';
import { useRole } from '../../hooks/useRole';

interface CampaignCardProps {
  campaignId: bigint;
  index: number;
  refetch: () => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaignId, index, refetch }) => {
  const { writeContractAsync } = useWriteContract()
  const { isConnected, address } = useAccount();
  const { isRT} = useRole();

  const { data: dataCampaign, refetch: refetchCampaign } = useReadContract({
    address: QURBAN_MANAGER_ADDRESS as `0x${string}`,
    abi: QURBAN_MANAGER_ABI,
    functionName: "campaigns",
    args: [campaignId],
    query: {
      enabled: isConnected,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })

  console.log(campaignId, index, "WOI")

  const approve = async () => {
    toast.loading(`approving`, {
      style: {
        background: "rgba(32, 0, 82, 0.95)",
        color: "#FBFAF9",
        border: "1px solid rgba(131, 110, 249, 0.3)",
        borderRadius: "12px",
        fontFamily: "Inter, sans-serif",
      },
    })

    try {
      const result = await writeContractAsync({
        address: QURBAN_TOKEN_ADDRESS as `0x${string}`,
        abi: QURBAN_TOKEN_ABI,
        functionName: "approve",
        args: [QURBAN_MANAGER_ADDRESS, APPROVE_VALUE],
        account: address as `0x${string}`,
      })

      toast.dismiss()
      toast.loading("Approving transaction...", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(131, 110, 249, 0.3)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })

      await waitForTransactionReceipt(config, {
        hash: result as `0x${string}`,
      })

      toast.dismiss()
      // Success toast will be handled by event listener
    } catch (error) {
      console.error("Approve:", error)
      toast.dismiss()
      toast.error("Approve failed. Please try again.", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(160, 5, 93, 0.5)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })
    } finally {
      await contribute()
    }
  }

  const contribute = async () => {
    toast.loading(`contributing...`, {
      style: {
        background: "rgba(32, 0, 82, 0.95)",
        color: "#FBFAF9",
        border: "1px solid rgba(131, 110, 249, 0.3)",
        borderRadius: "12px",
        fontFamily: "Inter, sans-serif",
      },
    })

    try {
      const result = await writeContractAsync({
        address: QURBAN_MANAGER_ADDRESS as `0x${string}`,
        abi: QURBAN_MANAGER_ABI,
        functionName: "contribute",
        args: [campaignId],
        account: address as `0x${string}`,
      })

      toast.dismiss()
      toast.loading("Contributing...", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(131, 110, 249, 0.3)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })

      await waitForTransactionReceipt(config, {
        hash: result as `0x${string}`,
      })

      toast.dismiss()
      // Success toast will be handled by event listener
    } catch (error) {
      console.error("Contribute:", error)
      toast.dismiss()
      toast.error("Contribut failed. Please try again.", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(160, 5, 93, 0.5)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })
    } finally {
      setTimeout(() => {
        refetch();
        refetchCampaign();
      }, 500)
    }
  }

  const generateCouponsFromAnimal = async () => {
    toast.loading(`waiting for approvement...`, {
      style: {
        background: "rgba(32, 0, 82, 0.95)",
        color: "#FBFAF9",
        border: "1px solid rgba(131, 110, 249, 0.3)",
        borderRadius: "12px",
        fontFamily: "Inter, sans-serif",
      },
    })

    try {
      const animalToken = await readContract(config, {
        abi: QURBAN_ANIMAL_ABI,
        address: QURBAN_ANIMAL_ADDRESS,
        functionName: "campaignToAnimal",
        args: [campaignId]
      });

      const result = await writeContractAsync({
        address: QURBAN_MANAGER_ADDRESS as `0x${string}`,
        abi: QURBAN_MANAGER_ABI,
        functionName: "generateCouponsFromAnimal",
        args: [animalToken],
        account: address as `0x${string}`,
      })

      toast.dismiss()
      toast.loading("generating coupon...", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(131, 110, 249, 0.3)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })

      await waitForTransactionReceipt(config, {
        hash: result as `0x${string}`,
      })

      toast.dismiss()
      // Success toast will be handled by event listener
    } catch (error) {
      console.error("generate coupon:", error)
      toast.dismiss()
      toast.error("generate coupon failed. Please try again.", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(160, 5, 93, 0.5)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })
    } finally {
      setTimeout(() => {
        refetch();
        refetchCampaign();
      }, 500)
    }
  }
  
  const getStatusColor = () => {
    if (!dataCampaign) return 'bg-gray-500';
    if (!dataCampaign[7] && !dataCampaign[8]) {
      return 'bg-islamic-green-500';
    } else if (dataCampaign[7]) {
      return 'bg-gray-500'
    } else {
      return 'bg-blue-500'
    }
  };

  const getStatusText = () => {
    if (!dataCampaign) return 'Unknown';
    if (!dataCampaign[7] && !dataCampaign[8]) {
      return 'Aktif';
    } else if (dataCampaign[7]) {
      return 'Selesai'
    } else {
      return 'Dibatalkan'
    }
  };

  const getImage = () => {
    if (dataCampaign && Number(dataCampaign[0]) === 1) {
      return 'http://127.0.0.1:8080/ipfs/QmVxDz7QqFxgbUeqaYu8mxkj3sJe8C7h7wxqTtmGrfPkJq';
    } else if (dataCampaign && Number(dataCampaign[0]) === 2) {
      return 'http://127.0.0.1:8080/ipfs/QmU1eax7m3AWKdSF74s2jkxbN7fVMGCXyqWWTRpacwnaPv';
    }
  }

  const ActionButton = () => {
    if (isRT) {
      return (
        <>
          {dataCampaign && !dataCampaign[7] && !dataCampaign[8] ? (
            <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Campaign Sedang Berlangsung
            </div>
          ) : dataCampaign && dataCampaign[7] && !dataCampaign[9] ? (
            <motion.button
              onClick={generateCouponsFromAnimal}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Generate Kupon
            </motion.button>
          ) : dataCampaign && dataCampaign[9] ? (
            <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Campaign Selesai
            </div>
          ) : (
            <div className="w-full bg-blue-100 text-blue-500 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2">
              <Clock className="w-5 h-5" />
              Campaign Dibatalkan
            </div>
          )}
        </>
      )
    } else {
      return (
        <>
          {dataCampaign && !dataCampaign[7] && !dataCampaign[8] ? (
            <motion.button
              onClick={approve}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Bergabung Campaign
            </motion.button>
          ) : dataCampaign && dataCampaign[7] ? (
            <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Campaign Selesai
            </div>
          ) : (
            <div className="w-full bg-blue-100 text-blue-500 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2">
              <Clock className="w-5 h-5" />
              Campaign Dibatalkan
            </div>
          )}
        </>
      )
    }
  }

  if (!dataCampaign) return null
  
  return (
    <motion.div
      key={campaignId}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      <div className="relative">
        <img
          src={getImage()}
          alt="Qurban Sapi"
          className="w-full h-48 object-cover"
        />
        <div className={`absolute top-4 right-4 ${getStatusColor()} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
          {getStatusText()}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{
          dataCampaign && Number(dataCampaign[0]) === 1 ? "Qurban Sapi" : "Qurban Kambing"
        }</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {dataCampaign && Number(dataCampaign[0]) === 1 ?
          "Sapi berkualitas tinggi untuk qurban bersama komunitas Masjid Blockdev.":
          "Kambing berkualitas tinggi untuk qurban bersama komunitas Masjid Blockdev." }
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>Peserta</span>
            </div>
            <span className="font-semibold text-gray-900">
              {Number(dataCampaign[3])}/{Number(dataCampaign[4])}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(Number(dataCampaign[3]) / Number(dataCampaign[4])) * 100}%`
              }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Coins className="w-4 h-4" />
              <span>Per Slot</span>
            </div>
            <span className="font-bold text-blue-500">{Number(Number(dataCampaign[1]) / (Number(dataCampaign[4]) * 10**18))} QBC</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Berakhir</span>
            </div>
            <span className="font-semibold text-gray-900">
              {new Date(Number(dataCampaign[6])).toLocaleDateString('id-ID')}
            </span>
          </div>
        </div>
        <ActionButton />
      </div>
    </motion.div>
  )
}

export default CampaignCard;