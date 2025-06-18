export interface Campaign {
  id: string;
  title: string;
  type: 'sapi' | 'kambing';
  targetParticipants: number;
  currentParticipants: number;
  pricePerSlot: number;
  endDate: string;
  description: string;
  image: string;
  status: 'active' | 'completed' | 'upcoming';
}

export interface QurbanAnimal {
  id: string;
  type: 'sapi' | 'kambing';
  campaignId: string;
  participantName: string;
  purchaseDate: string;
  status: 'menunggu' | 'disembelih' | 'distribusi';
  slotNumber?: number;
}

export interface QurbanCoupon {
  id: string;
  animalId: string;
  participantName: string;
  animalType: 'sapi' | 'kambing';
  slaughterDate: string;
  qrCode: string;
  nftTokenId?: string;
  proofUrl?: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
  network: string | null;
}