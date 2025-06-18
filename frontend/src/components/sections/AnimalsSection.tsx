import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Hash, User, Clock, CheckCircle, Package } from 'lucide-react';
import { mockAnimals } from '../../data/mockData';
import WalletConnect from '../WalletConnect';
import { useAccount, useReadContract } from "wagmi"
import { QURBAN_MANAGER_ADDRESS, QURBAN_MANAGER_ABI, QURBAN_ANIMAL_ADDRESS, QURBAN_ANIMAL_ABI } from "../../constants/index";
import CampaignCard from '../cards/CampaignCard';
import { useRole } from '@/hooks/useRole'
import CreateCampaignModal from '../CreateCampaignModal';
import AnimalCard from '../cards/AnimalCard';

const AnimalsSection: React.FC = () => {
  const { address, isConnected } = useAccount()

  const { data: dataAnimal } = useReadContract({
    address: QURBAN_ANIMAL_ADDRESS as `0x${string}`,
    abi: QURBAN_ANIMAL_ABI,
    functionName: "getAllAnimalIds",
    query: {
      enabled: isConnected,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })

  console.log(dataAnimal);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-12 rounded-3xl shadow-2xl max-w-md mx-6"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Koneksi Wallet Diperlukan</h2>
          <p className="text-gray-600 mb-8">
            Untuk melihat daftar hewan qurban yang telah Anda beli, silakan hubungkan wallet Web3 Anda.
          </p>
          <WalletConnect />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Daftar <span className="text-red-500">Hewan Qurban</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Pantau status hewan qurban yang telah Anda beli. Semua informasi 
            tercatat di blockchain untuk transparansi penuh.
          </p>
        </motion.div>

        {mockAnimals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-white p-12 rounded-3xl shadow-lg max-w-md mx-auto"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Belum Ada Hewan Qurban</h3>
            <p className="text-gray-600 mb-6">
              Anda belum memiliki hewan qurban. Bergabunglah dengan campaign untuk memulai.
            </p>
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300">
              Lihat Campaign
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dataAnimal?.length && dataAnimal.map((animal, index) => {

              return (
                <AnimalCard animalId={animal} index={index} />
              );
            })}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Status Hewan Qurban</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { 
                status: 'menunggu', 
                icon: Clock, 
                title: 'Menunggu Penyembelihan', 
                desc: 'Hewan sudah dibeli dan menunggu jadwal penyembelihan sesuai kampanye',
                color: 'bg-yellow-500'
              },
              { 
                status: 'disembelih', 
                icon: CheckCircle, 
                title: 'Sudah Disembelih', 
                desc: 'Proses penyembelihan telah selesai dan terekam di blockchain',
                color: 'bg-islamic-green-500'
              }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.status} className="text-center">
                  <div className={`w-16 h-16 ${item.color} text-white rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimalsSection;