import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus } from 'lucide-react';
import WalletConnect from '../WalletConnect';
import { useAccount, useReadContract } from "wagmi"
import { QURBAN_MANAGER_ADDRESS, QURBAN_MANAGER_ABI } from "../../constants/index";
import CampaignCard from '../cards/CampaignCard';
import { useRole } from '@/hooks/useRole'
import CreateCampaignModal from '../CreateCampaignModal';

const CampaignsSection: React.FC = () => {
  const { isRT } = useRole()
  const { isConnected } = useAccount();

  const { data: dataCampaign, refetch } = useReadContract({
    address: QURBAN_MANAGER_ADDRESS as `0x${string}`,
    abi: QURBAN_MANAGER_ABI,
    functionName: "getAllCampaignIds",
    query: {
      enabled: isConnected,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })

  console.log(dataCampaign, 'wou')

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-12 rounded-3xl shadow-2xl max-w-md mx-6"
        >
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Koneksi Wallet Diperlukan</h2>
          <p className="text-gray-600 mb-8">
            Untuk melihat dan bergabung dalam campaign qurban, silakan hubungkan wallet Web3 Anda terlebih dahulu.
          </p>
          <div className="flex justify-center">
            <WalletConnect />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Campaign <span className="text-blue-500">Qurban Patungan</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Bergabunglah dalam campaign qurban patungan yang tersedia. 
            Setiap campaign diverifikasi dan tercatat di blockchain.
          </p>
        </motion.div>

        {isRT ?  
          (<div className="w-1/4 flex mx-auto mb-8">
            <CreateCampaignModal refetch={refetch}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 justify-center w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition-all duration-300"
              >
                <Plus />
                Buat Campaign Baru
              </motion.button>
            </CreateCampaignModal>
          </div>)
        : null}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dataCampaign?.length ? dataCampaign.map((campaignId, index) => (
            <CampaignCard refetch={refetch} campaignId={campaignId} index={index} />
          )) : null}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cara Bergabung Campaign</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Pilih Campaign', desc: 'Pilih campaign qurban yang sesuai dengan keinginan Anda' },
              { step: '2', title: 'Tentukan Slot', desc: 'Pilih jumlah slot yang ingin Anda beli dalam campaign tersebut' },
              { step: '3', title: 'Bayar dengan Crypto', desc: 'Lakukan pembayaran menggunakan cryptocurrency yang tersedia' },
              { step: '4', title: 'Terima Konfirmasi', desc: 'Dapatkan konfirmasi transaksi dan tracking campaign Anda' }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CampaignsSection;