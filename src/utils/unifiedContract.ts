import { ethers } from 'ethers';
import { buySharesWithEthers, sellSharesWithEthers } from './ethersContract';
import { buySharesWithRawTransaction, sellSharesWithRawTransaction } from './rawTransactionContract';
import { buySharesWithRealtimeTransaction, sellSharesWithRealtimeTransaction } from './realtimeTransactionContract';
import { buySharesWithPrivy, sellSharesWithPrivy } from './privyTransactionContract';

export type TransactionMethod = 'contract' | 'raw' | 'realtime' | 'privy';

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  receipt?: any;
  error?: string;
  method: TransactionMethod;
}

export async function buyShares(
  signerOrAddress: ethers.Signer | `0x${string}`,
  playerId: number,
  amount: number,
  value: string,
  method: TransactionMethod = 'contract'
): Promise<TransactionResult> {
  if (method === 'raw') {
    if (typeof signerOrAddress === 'string') {
      throw new Error('Raw method requires an ethers.Signer, not an address string');
    }
    return await buySharesWithRawTransaction(signerOrAddress, playerId, amount, value);
  } else if (method === 'realtime') {
    if (typeof signerOrAddress === 'string') {
      throw new Error('Realtime method requires an ethers.Signer, not an address string');
    }
    return await buySharesWithRealtimeTransaction(signerOrAddress, playerId, amount, value);
  } else if (method === 'privy') {
    if (typeof signerOrAddress !== 'string') {
      throw new Error('Privy method requires a user address string, not an ethers.Signer');
    }
    return await buySharesWithPrivy(signerOrAddress, playerId, amount, value);
  } else {
    if (typeof signerOrAddress === 'string') {
      throw new Error('Contract method requires an ethers.Signer, not an address string');
    }
    const result = await buySharesWithEthers(signerOrAddress, playerId, amount, value);
    return { ...result, method: 'contract' };
  }
}

export async function sellShares(
  signerOrAddress: ethers.Signer | `0x${string}`,
  playerId: number,
  amount: number,
  method: TransactionMethod = 'contract'
): Promise<TransactionResult> {
  if (method === 'raw') {
    if (typeof signerOrAddress === 'string') {
      throw new Error('Raw method requires an ethers.Signer, not an address string');
    }
    return await sellSharesWithRawTransaction(signerOrAddress, playerId, amount);
  } else if (method === 'realtime') {
    if (typeof signerOrAddress === 'string') {
      throw new Error('Realtime method requires an ethers.Signer, not an address string');
    }
    return await sellSharesWithRealtimeTransaction(signerOrAddress, playerId, amount);
  } else if (method === 'privy') {
    if (typeof signerOrAddress !== 'string') {
      throw new Error('Privy method requires a user address string, not an ethers.Signer');
    }
    return await sellSharesWithPrivy(signerOrAddress, playerId, amount);
  } else {
    if (typeof signerOrAddress === 'string') {
      throw new Error('Contract method requires an ethers.Signer, not an address string');
    }
    const result = await sellSharesWithEthers(signerOrAddress, playerId, amount);
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
    case 'privy':
      return 'Privy Wallet';
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
    case 'privy':
      return 'Uses Privy wallet integration for seamless transaction signing and sending';
    default:
      return 'Unknown transaction method';
  }
}
