import { motion } from 'framer-motion';
import { Calendar, Users, Coins, Clock, CheckCircle, Hash, User } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract } from "wagmi"
import { QURBAN_MANAGER_ADDRESS, QURBAN_MANAGER_ABI, QURBAN_TOKEN_ADDRESS, QURBAN_TOKEN_ABI, APPROVE_VALUE, QURBAN_ANIMAL_ABI, QURBAN_ANIMAL_ADDRESS } from "../../constants/index";
import { waitForTransactionReceipt, readContract } from "@wagmi/core"
import toast from "react-hot-toast"
import { config } from '../../App';
import { useRole } from '../../hooks/useRole';

interface AnimalCardProps {
  animalId: bigint;
  index: number;
}

const AnimalCard: React.FC<AnimalCardProps> = ({ animalId, index }) => {
  // const { writeContractAsync } = useWriteContract()
  const { isConnected, address } = useAccount();
  // const { isRT} = useRole();

  const { data: dataAnimal } = useReadContract({
    address: QURBAN_ANIMAL_ADDRESS as `0x${string}`,
    abi: QURBAN_ANIMAL_ABI,
    functionName: "animals",
    args: [animalId],
    query: {
      enabled: isConnected,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })

  const { data: dataCampaign } = useReadContract({
    address: QURBAN_MANAGER_ADDRESS as `0x${string}`,
    abi: QURBAN_MANAGER_ABI,
    functionName: "campaigns",
    args: [dataAnimal ? dataAnimal[0] : 0n],
    query: {
      enabled: isConnected,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })

  console.log(dataAnimal)

  console.log(animalId, index, "WOI")
  
  // const getStatusColor = () => {
  //   if (!dataAnimal) return 'bg-gray-500';
  //   if (!dataAnimal[7] && !dataAnimal[8]) {
  //     return 'bg-islamic-green-500';
  //   } else if (dataAnimal[7]) {
  //     return 'bg-gray-500'
  //   } else {
  //     return 'bg-blue-500'
  //   }
  // };

  // const getStatusText = () => {
  //   if (!dataAnimal) return 'Unknown';
  //   if (!dataAnimal[7] && !dataAnimal[8]) {
  //     return 'Aktif';
  //   } else if (dataAnimal[7]) {
  //     return 'Selesai'
  //   } else {
  //     return 'Dibatalkan'
  //   }
  // };

  // const getImage = () => {
  //   if (dataAnimal && Number(dataAnimal[0]) === 1) {
  //     return 'http://127.0.0.1:8080/ipfs/QmVxDz7QqFxgbUeqaYu8mxkj3sJe8C7h7wxqTtmGrfPkJq';
  //   } else if (dataAnimal && Number(dataAnimal[0]) === 2) {
  //     return 'http://127.0.0.1:8080/ipfs/QmU1eax7m3AWKdSF74s2jkxbN7fVMGCXyqWWTRpacwnaPv';
  //   }
  // }

  // const ActionButton = () => {
  //   if (isRT) {
  //     return (
  //       <>
  //         {dataAnimal && !dataAnimal[7] && !dataAnimal[8] ? (
  //           <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2">
  //             <CheckCircle className="w-5 h-5" />
  //             Campaign Sedang Berlangsung
  //           </div>
  //         ) : dataAnimal && dataAnimal[7] && !dataAnimal[9] ? (
  //           <motion.button
  //             onClick={generateCouponsFromAnimal}
  //             whileHover={{ scale: 1.02 }}
  //             whileTap={{ scale: 0.98 }}
  //             className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-all duration-300"
  //           >
  //             Generate Kupon
  //           </motion.button>
  //         ) : dataAnimal && dataAnimal[9] ? (
  //           <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2">
  //             <CheckCircle className="w-5 h-5" />
  //             Campaign Selesai
  //           </div>
  //         ) : (
  //           <div className="w-full bg-blue-100 text-blue-500 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2">
  //             <Clock className="w-5 h-5" />
  //             Campaign Dibatalkan
  //           </div>
  //         )}
  //       </>
  //     )
  //   } else {
  //     return (
  //       <>
  //         {dataAnimal && !dataAnimal[7] && !dataAnimal[8] ? (
  //           <motion.button
  //             onClick={approve}
  //             whileHover={{ scale: 1.02 }}
  //             whileTap={{ scale: 0.98 }}
  //             className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-all duration-300"
  //           >
  //             Bergabung Campaign
  //           </motion.button>
  //         ) : dataAnimal && dataAnimal[7] ? (
  //           <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2">
  //             <CheckCircle className="w-5 h-5" />
  //             Campaign Selesai
  //           </div>
  //         ) : (
  //           <div className="w-full bg-blue-100 text-blue-500 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2">
  //             <Clock className="w-5 h-5" />
  //             Campaign Dibatalkan
  //           </div>
  //         )}
  //       </>
  //     )
  //   }
  // }

  const getStatusInfo = () => {
    // switch (status) {
    //   case 'menunggu':
    //     return { color: 'bg-yellow-500', text: 'Menunggu Penyembelihan', icon: Clock };
    //   case 'disembelih':
    //     return { color: 'bg-islamic-green-500', text: 'Sudah Disembelih', icon: CheckCircle };
    //   case 'distribusi':
    //     return { color: 'bg-blue-500', text: 'Dalam Distribusi', icon: Package };
    //   default:
    //     return { color: 'bg-gray-500', text: 'Unknown', icon: Clock };
    // }
    if (dataCampaign && dataCampaign[4] && !dataCampaign[9]) {
      return { color: 'bg-yellow-500', text: 'Menunggu Penyembelihan', icon: Clock };
    } else if (dataCampaign && dataCampaign[9]) {
      return { color: 'bg-islamic-green-500', text: 'Sudah Disembelih', icon: CheckCircle };
    }

    return { color: 'bg-gray-500', text: 'Unknown', icon: Clock };
  };

  
  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (!dataAnimal) return null
  // return null;
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
    >
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="text-6xl mb-2">
              {dataAnimal[1] === 'sapi' ? '🐄' : '🐐'}
            </div>
            <div className="text-lg font-semibold capitalize">{dataAnimal[1]}</div>
          </div>
        </div>
        <div className={`absolute top-4 right-4 ${statusInfo.color} text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1`}>
          <StatusIcon className="w-4 h-4" />
          {statusInfo.text}
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Hash className="w-4 h-4" />
              <span>ID Hewan</span>
            </div>
            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
              {Number(animalId)}
            </span>
          </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Tanggal Beli</span>
            </div>
            <span className="font-semibold text-gray-900">
              {new Date(Number(dataAnimal[4])).toLocaleDateString('id-ID')}
            </span>
          </div>
        </div>

        {/* <div className="mt-6 pt-4 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Hash className="w-4 h-4" />
            Lihat di Blockchain
          </motion.button>
        </div> */}
    </motion.div>
  )
}

export default AnimalCard;