import React from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import WalletConnect from '../WalletConnect';
import { useAccount, useReadContract } from "wagmi"
import { QURBAN_MANAGER_ADDRESS, QURBAN_MANAGER_ABI } from "../../constants/index";
import CouponCard from '../cards/CouponCard';
import { useRole } from '@/hooks/useRole';

const CouponsSection: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { isRT } = useRole()

  const { data: dataCampaign } = useReadContract({
    address: QURBAN_MANAGER_ADDRESS as `0x${string}`,
    abi: QURBAN_MANAGER_ABI,
    functionName: "getAllCampaignIds",
    query: {
      enabled: isConnected,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })

  const { data: myCoupon } = useReadContract({
    address: QURBAN_MANAGER_ADDRESS as `0x${string}`,
    abi: QURBAN_MANAGER_ABI,
    functionName: "getMyCoupon",
    query: {
      enabled: isConnected,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
    account: address
  })

  const { data: tokenInfo } = useReadContract({
    address: QURBAN_MANAGER_ADDRESS as `0x${string}`,
    abi: QURBAN_MANAGER_ABI,
    functionName: "tokenInfo",
    query: {
      enabled: isConnected,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
    args: [myCoupon ? myCoupon : 0n ],
    account: address
  })
  console.log(tokenInfo)
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gold-50 to-gold-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-12 rounded-3xl shadow-2xl max-w-md mx-6"
        >
          <div className="w-20 h-20 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-gold-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Koneksi Wallet Diperlukan</h2>
          <p className="text-gray-600 mb-8">
            Untuk melihat kupon qurban digital Anda, silakan hubungkan wallet Web3 terlebih dahulu.
          </p>
          <div className='flex justify-center'>
            <WalletConnect />
          </div>
        </motion.div>
      </div>
    );
  }



  if (isRT) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gold-50 to-gold-100 py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Kupon <span className="text-gold-500">Qurban Digital</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Kupon digital NFT sebagai bukti partisipasi qurban Anda. 
              Dapat digunakan untuk pengambilan daging atau sebagai koleksi digital.
            </p>
          </motion.div>

          {!dataCampaign ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center bg-white p-12 rounded-3xl shadow-lg max-w-md mx-auto"
            >
              <div className="w-20 h-20 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-10 h-10 text-gold-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Belum Ada Kupon</h3>
              <p className="text-gray-600 mb-6">
                Kupon digital akan muncul setelah hewan qurban Anda disembelih dan diverifikasi.
              </p>
              <button className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300">
                Lihat Hewan Qurban
              </button>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dataCampaign.map((campaignId, index) => (
                <CouponCard campaignId={campaignId} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gold-50 to-gold-100 py-12">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Kupon <span className="text-gold-500">Qurban Digital</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Kupon digital NFT sebagai bukti partisipasi qurban Anda. 
              Dapat digunakan untuk pengambilan daging atau sebagai koleksi digital.
            </p>
          </motion.div>

          {!Number(myCoupon) ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center bg-white p-12 rounded-3xl shadow-lg max-w-md mx-auto"
            >
              <div className="w-20 h-20 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-10 h-10 text-gold-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Belum Ada Kupon</h3>
              <p className="text-gray-600 mb-6">
                Kupon digital akan muncul setelah hewan qurban Anda disembelih dan diverifikasi.
              </p>
              <button className="bg-gold-500 hover:bg-gold-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300">
                Lihat Hewan Qurban
              </button>
            </motion.div>
          ) : (
            <CouponCard campaignId={tokenInfo ? tokenInfo[0] : BigInt(0)} index={0} tokenInfo={tokenInfo} myCoupon={myCoupon} />
          )}
        </div>
      </div>
    );
  }
};

export default CouponsSection;