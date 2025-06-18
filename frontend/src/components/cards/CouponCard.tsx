import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Award, Download, ExternalLink, Share } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from "wagmi"
import { QURBAN_MANAGER_ADDRESS, QURBAN_MANAGER_ABI, QURBAN_ANIMAL_ABI, QURBAN_ANIMAL_ADDRESS } from "../../constants/index";
import { waitForTransactionReceipt, readContract } from "@wagmi/core"
import toast from "react-hot-toast"
import { config } from '../../App';
import { useRole } from '../../hooks/useRole';
import ContributorModal from '../ContributorModal';

interface CouponCardProps {
  campaignId: bigint;
  index: number;
  tokenInfo: any;
  myCoupon: bigint;
}

const CouponCard: React.FC<CouponCardProps> = ({ campaignId, index, tokenInfo, myCoupon }) => {
  const { writeContractAsync } = useWriteContract()
  const { isConnected, address } = useAccount();
  const { isRT} = useRole();
  
  const { data: coupons } = useReadContract({
    address: QURBAN_MANAGER_ADDRESS as `0x${string}`,
    abi: QURBAN_MANAGER_ABI,
    functionName: "getCouponByCampaign",
    query: {
      enabled: isConnected,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })

  
  const { data: dataCampaign } = useReadContract({
    address: QURBAN_MANAGER_ADDRESS as `0x${string}`,
    abi: QURBAN_MANAGER_ABI,
    functionName: "campaigns",
    args: [campaignId],
    query: {
      enabled: isConnected,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })
  // console.log(myCoupon, "MYCOUPON")
  console.log(coupons, "COUPON")
  console.log(dataCampaign, "data")

  const claimCoupon = async () => {
    toast.loading(`waiting for claim...`, {
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
        functionName: "claimCoupon",
        args: [myCoupon],
        account: address as `0x${string}`,
      })

      toast.dismiss()
      toast.loading("claiming coupon...", {
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
      console.error("claim coupon:", error)
      toast.dismiss()
      toast.error("claim coupon failed. Please try again.", {
        style: {
          background: "rgba(32, 0, 82, 0.95)",
          color: "#FBFAF9",
          border: "1px solid rgba(160, 5, 93, 0.5)",
          borderRadius: "12px",
          fontFamily: "Inter, sans-serif",
        },
      })
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

  console.log(dataCampaign, 'woi')

  const ActionButton = () => {
    if (isRT && dataCampaign) {
      if (!dataCampaign[10]) {
        return (
          <ContributorModal totalContributors={Number(dataCampaign[3])} animal={Number(dataCampaign[0])} campaignId={campaignId}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gold-500 hover:bg-gold-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Share className="w-4 h-4" />
              Bagikan ke Warga
            </motion.button>
          </ContributorModal>
        )
      } else {
        return (
          <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Coupon sudah dibagikan
          </div>
        )
      }
    } else {
      if (!tokenInfo[3]) {
        return (
          <motion.button
            onClick={claimCoupon}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gold-500 hover:bg-gold-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
          >
            Claim Coupon
          </motion.button>
        )
      } else {
        return null
      }
    }
  }
  if (!dataCampaign || !dataCampaign[9]) return null
  console.log(tokenInfo, tokenInfo)
  
  return (
    <motion.div
      key={campaignId}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative"
    >
      {/* Premium Badge */}
      <div className="absolute top-4 right-4 bg-gradient-to-r from-gold-400 to-gold-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 z-10">
        <Award className="w-4 h-4" />
        NFT Verified
      </div>

      {/* Coupon Header */}
      <div className="bg-gradient-to-br from-gold-400 to-gold-600 p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 transform rotate-12 translate-x-32"></div>
        <div className="relative z-10">
          <div className="text-4xl mb-2">
            {/* {coupon.animalType === 'sapi' ? '🐄' : '🐐'} */}
          </div>
          <h3 className="text-xl font-bold mb-2">Kupon Qurban Digital</h3>
          <p className="text-gold-100 capitalize">
            {/* {coupon.animalType} • {coupon.participantName} */}
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Tanggal Sembelih</span>
            </div>
            <span className="font-semibold text-gray-900">
              {/* {new Date(coupon.slaughterDate).toLocaleDateString('id-ID')} */}
            </span>
          </div>
        </div>

        {/* QR Code Visual */}
        <div className="bg-gray-50 rounded-2xl mb-6 text-center">
        <img
          src={getImage()}
          alt="Qurban Sapi"
          className="w-full h-48 object-cover"
        />
        </div>

        {/* Action Buttons */}
        <ActionButton />
        {/* <div className="space-y-3">
          <ContributorModal totalContributors={Number(dataCampaign[3])} animal={Number(dataCampaign[0])} campaignId={campaignId}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gold-500 hover:bg-gold-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Share className="w-4 h-4" />
              Bagikan ke Warga
            </motion.button>
          </ContributorModal> */}

          {/* {coupon.proofUrl && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full border-2 border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Lihat Bukti Sembelih
            </motion.button>
          )} */}
        {/* </div> */}
      </div>
    </motion.div>
  )
}

export default CouponCard;

