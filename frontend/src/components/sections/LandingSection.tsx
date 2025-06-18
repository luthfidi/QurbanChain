import React from 'react';
import { motion } from 'framer-motion';
import { Fuel as Mosque, Users, Shield, Zap } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const LandingSection: React.FC = () => {

  const features = [
    {
      icon: Shield,
      title: 'Transparansi Blockchain',
      description: 'Setiap transaksi qurban tercatat di blockchain untuk transparansi penuh'
    },
    {
      icon: Users,
      title: 'Patungan Mudah',
      description: 'Bergabung dalam qurban patungan dengan mudah dan aman'
    },
    {
      icon: Zap,
      title: 'Proses Cepat',
      description: 'Pembayaran crypto yang cepat dan konfirmasi real-time'
    },
    {
      icon: Mosque,
      title: 'Masjid Blockdev',
      description: 'Didukung oleh komunitas Masjid Blockdev yang terpercaya'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-green-50 via-white to-gold-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)] bg-[radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            BerQurban adalah platform{' '}
            <span className="text-islamic-green-500">qurban digital</span>{' '}
            yang transparan & terpercaya
            <span className="text-gold-500"> untuk umat muslim</span>
          </h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Menggunakan teknologi Web3 dan blockchain untuk memastikan setiap tahap 
            ibadah qurban Anda tercatat dengan transparan dan dapat diverifikasi. 
            Bergabunglah dengan komunitas Masjid Blockdev dalam menjalankan ibadah qurban modern.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            {/* {!wallet.isConnected ? (
              <motion.button
                onClick={connectWallet}
                className="bg-islamic-green-500 hover:bg-islamic-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Wallet className="w-6 h-6" />
                Connect Wallet untuk Mulai
              </motion.button>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm px-8 py-4 rounded-xl shadow-lg border border-islamic-green-200">
                <div className="flex items-center gap-3 text-islamic-green-600">
                  <Wallet className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Wallet Connected</div>
                    <div className="text-sm opacity-75">{wallet.address}</div>
                  </div>
                </div>
              </div>
            )} */}
            <ConnectButton />
            
            <button className="border-2 border-islamic-green-500 text-islamic-green-500 hover:bg-islamic-green-500 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300">
              Pelajari Lebih Lanjut
            </button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
            >
              <feature.icon className="w-12 h-12 text-islamic-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Masjid Blockdev Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="bg-gradient-to-r from-islamic-green-500 to-islamic-green-600 text-white p-8 md:p-12 rounded-3xl shadow-2xl"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Tentang Masjid Blockdev</h2>
              <p className="text-lg opacity-90 mb-6 leading-relaxed">
                Masjid Blockdev adalah komunitas yang memadukan teknologi blockchain dengan 
                nilai-nilai islami. Kami berkomitmen untuk menghadirkan inovasi teknologi 
                yang bermanfaat bagi umat muslim, termasuk platform qurban digital yang 
                transparan dan terpercaya ini.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Berlokasi di Jakarta Selatan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Aktif sejak 2020</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>500+ Anggota Komunitas</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-80 h-64 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Mosque className="w-24 h-24 text-white/80" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingSection;