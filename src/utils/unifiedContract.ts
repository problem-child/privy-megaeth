import { ethers } from 'ethers';
import { buySharesWithEthers, sellSharesWithEthers } from './ethersContract';
import { buySharesWithRawTransaction, sellSharesWithRawTransaction } from './rawTransactionContract';
import { buySharesWithRealtimeTransaction, sellSharesWithRealtimeTransaction } from './realtimeTransactionContract';

export type TransactionMethod = 'contract' | 'raw' | 'realtime';

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  receipt?: any;
  error?: string;
  method: TransactionMethod;
}

export async function buyShares(
  signer: ethers.Signer,
  playerId: number,
  amount: number,
  value: string,
  method: TransactionMethod = 'contract'
): Promise<TransactionResult> {
  if (method === 'raw') {
    return await buySharesWithRawTransaction(signer, playerId, amount, value);
  } else if (method === 'realtime') {
    return await buySharesWithRealtimeTransaction(signer, playerId, amount, value);
  } else {
    const result = await buySharesWithEthers(signer, playerId, amount, value);
    return { ...result, method: 'contract' };
  }
}

export async function sellShares(
  signer: ethers.Signer,
  playerId: number,
  amount: number,
  method: TransactionMethod = 'contract'
): Promise<TransactionResult> {
  if (method === 'raw') {
    return await sellSharesWithRawTransaction(signer, playerId, amount);
  } else if (method === 'realtime') {
    return await sellSharesWithRealtimeTransaction(signer, playerId, amount);
  } else {
    const result = await sellSharesWithEthers(signer, playerId, amount);
    return { ...result, method: 'contract' };
  }
}

// Helper function to get method display name
export function getMethodDisplayName(method: TransactionMethod): string {
  switch (method) {
    case 'contract':
      return 'Contract Call';
    case 'raw':
      return 'Raw Transaction';
    case 'realtime':
      return 'Realtime Transaction';
    default:
      return 'Unknown Method';
  }
}

// Helper function to get method description
export function getMethodDescription(method: TransactionMethod): string {
  switch (method) {
    case 'contract':
      return 'Uses ethers.js contract abstraction for easier development';
    case 'raw':
      return 'Uses raw transaction signing and broadcasting for lower-level control';
    case 'realtime':
      return 'Uses MegaETH realtime API for ultra-fast transaction execution and immediate receipts';
    default:
      return 'Unknown transaction method';
  }
}
