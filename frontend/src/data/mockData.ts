import { Campaign, QurbanAnimal, QurbanCoupon } from '../types';

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Qurban Sapi Limousin - Masjid Blockdev',
    type: 'sapi',
    targetParticipants: 7,
    currentParticipants: 4,
    pricePerSlot: 0.15,
    endDate: '2024-06-15',
    description: 'Sapi Limousin berkualitas tinggi untuk qurban bersama komunitas Masjid Blockdev.',
    image: 'https://images.pexels.com/photos/422220/pexels-photo-422220.jpeg',
    status: 'active'
  },
  {
    id: '2',
    title: 'Qurban Kambing Etawa',
    type: 'kambing',
    targetParticipants: 1,
    currentParticipants: 0,
    pricePerSlot: 0.08,
    endDate: '2024-06-16',
    description: 'Kambing Etawa premium untuk qurban individu atau keluarga.',
    image: 'https://images.pexels.com/photos/1459881/pexels-photo-1459881.jpeg',
    status: 'active'
  },
  {
    id: '3',
    title: 'Qurban Sapi Brangus Premium',
    type: 'sapi',
    targetParticipants: 7,
    currentParticipants: 7,
    pricePerSlot: 0.18,
    endDate: '2024-06-10',
    description: 'Campaign qurban yang telah berhasil mencapai target peserta.',
    image: 'https://images.pexels.com/photos/133459/pexels-photo-133459.jpeg',
    status: 'completed'
  }
];

export const mockAnimals: QurbanAnimal[] = [
  {
    id: 'animal-1',
    type: 'sapi',
    campaignId: '1',
    participantName: 'Ahmad Fadli',
    purchaseDate: '2024-05-20',
    status: 'menunggu',
    slotNumber: 1
  },
  {
    id: 'animal-2',
    type: 'sapi',
    campaignId: '3',
    participantName: 'Ahmad Fadli',
    purchaseDate: '2024-05-15',
    status: 'disembelih',
    slotNumber: 3
  }
];

export const mockCoupons: QurbanCoupon[] = [
  {
    id: 'coupon-1',
    animalId: 'animal-2',
    participantName: 'Ahmad Fadli',
    animalType: 'sapi',
    slaughterDate: '2024-06-10',
    qrCode: 'QR123456789',
    nftTokenId: 'NFT-QRB-001',
    proofUrl: 'https://ipfs.io/proof-video-hash'
  }
];