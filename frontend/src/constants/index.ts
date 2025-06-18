import { parseEther } from 'viem';
import qurbanAnimalNFT from './qurbanAnimalNFT';
import qurbanToken from './qurbanToken';
import qurbanManager from './qurbanManager';

export const QURBAN_ANIMAL_ABI = qurbanAnimalNFT;
export const QURBAN_TOKEN_ABI = qurbanToken;
export const QURBAN_MANAGER_ABI = qurbanManager;

export const QURBAN_ANIMAL_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
export const QURBAN_TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
export const QURBAN_MANAGER_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"

export const APPROVE_VALUE = parseEther('10000')
