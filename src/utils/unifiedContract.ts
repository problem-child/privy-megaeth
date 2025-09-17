import { ethers } from 'ethers';
import { buySharesWithEthers, sellSharesWithEthers } from './ethersContract';
import { buySharesWithSignedTransaction, sellSharesWithSignedTransaction } from './ethersSignedTransactionContract';
import { buySharesWithEthersRealtime, sellSharesWithEthersRealtime } from './ethersRealtimeTransactionContract';
import { buySharesWithWagmi, sellSharesWithWagmi } from './wagmiSignedSendTransactionContract';
import { buySharesWithPrivyNative, sellSharesWithPrivyNative } from './privyNativeSignAndSend';

export type TransactionMethod = 'contract' | 'raw' | 'realtime' | 'privy' | 'privy-native';

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
  method: TransactionMethod = 'contract',
  privyHelpers?: {
    signTransaction: (transaction: any) => Promise<{ signature: `0x${string}` }>;
    provider: ethers.Provider;
  }
): Promise<TransactionResult> {
  if (method === 'raw') {
    if (typeof signerOrAddress === 'string') {
      throw new Error('Raw method requires an ethers.Signer, not an address string');
    }
    return await buySharesWithSignedTransaction(signerOrAddress, playerId, amount, value);
  } else if (method === 'realtime') {
    if (typeof signerOrAddress === 'string') {
      throw new Error('Realtime method requires an ethers.Signer, not an address string');
    }
    return await buySharesWithEthersRealtime(signerOrAddress, playerId, amount, value);
  } else if (method === 'privy') {
    if (typeof signerOrAddress !== 'string') {
      throw new Error('Privy method requires a user address string, not an ethers.Signer');
    }
    return await buySharesWithWagmi(signerOrAddress, playerId, amount, value);
  } else if (method === 'privy-native') {
    if (typeof signerOrAddress !== 'string') {
      throw new Error('Privy native method requires a user address string, not an ethers.Signer');
    }
    if (!privyHelpers) {
      throw new Error('Privy native method requires signTransaction function and provider');
    }
    return await buySharesWithPrivyNative(
      privyHelpers.signTransaction,
      privyHelpers.provider,
      signerOrAddress,
      playerId,
      amount,
      value
    );
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
  method: TransactionMethod = 'contract',
  privyHelpers?: {
    signTransaction: (transaction: any) => Promise<{ signature: `0x${string}` }>;
    provider: ethers.Provider;
  }
): Promise<TransactionResult> {
  if (method === 'raw') {
    if (typeof signerOrAddress === 'string') {
      throw new Error('Raw method requires an ethers.Signer, not an address string');
    }
    return await sellSharesWithSignedTransaction(signerOrAddress, playerId, amount);
  } else if (method === 'realtime') {
    if (typeof signerOrAddress === 'string') {
      throw new Error('Realtime method requires an ethers.Signer, not an address string');
    }
    return await sellSharesWithEthersRealtime(signerOrAddress, playerId, amount);
  } else if (method === 'privy') {
    if (typeof signerOrAddress !== 'string') {
      throw new Error('Privy method requires a user address string, not an ethers.Signer');
    }
    return await sellSharesWithWagmi(signerOrAddress, playerId, amount);
  } else if (method === 'privy-native') {
    if (typeof signerOrAddress !== 'string') {
      throw new Error('Privy native method requires a user address string, not an ethers.Signer');
    }
    if (!privyHelpers) {
      throw new Error('Privy native method requires signTransaction function and provider');
    }
    return await sellSharesWithPrivyNative(
      privyHelpers.signTransaction,
      privyHelpers.provider,
      signerOrAddress,
      playerId,
      amount
    );
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
      return 'Ethers Signed';
    case 'realtime':
      return 'Ethers Realtime';
    case 'privy':
      return 'Wagmi Signed Send';
    case 'privy-native':
      return 'Privy Native Sign';
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
      return 'Uses ethers signed transaction for lower-level control';
    case 'realtime':
      return 'Uses ethers signing plus realtime send for ultra-fast transaction execution and immediate receipts';
    case 'privy':
      return 'Uses Wagmi wallet integration for seamless transaction signing and sending';
    case 'privy-native':
      return 'Uses Privy native signTransaction hook for transaction signing';
    default:
      return 'Unknown transaction method';
  }
}
