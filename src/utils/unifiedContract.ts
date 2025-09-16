import { ethers } from 'ethers';
import { buySharesWithEthers, sellSharesWithEthers } from './ethersContract';
import { buySharesWithRawTransaction, sellSharesWithRawTransaction } from './rawTransactionContract';

export type TransactionMethod = 'contract' | 'raw';

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
  } else {
    const result = await sellSharesWithEthers(signer, playerId, amount);
    return { ...result, method: 'contract' };
  }
}

// Helper function to get method display name
export function getMethodDisplayName(method: TransactionMethod): string {
  return method === 'contract' ? 'Contract Call' : 'Raw Transaction';
}

// Helper function to get method description
export function getMethodDescription(method: TransactionMethod): string {
  return method === 'contract'
    ? 'Uses ethers.js contract abstraction for easier development'
    : 'Uses raw transaction signing and broadcasting for lower-level control';
}
