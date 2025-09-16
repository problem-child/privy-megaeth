import { ethers } from 'ethers';
import { TOPSTRIKE_CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { getWalletClient } from '@wagmi/core';
import { wagmiConfig } from '../config/wagmi';
import { megaeth } from '../config/chains';

export async function buySharesWithPrivy(
  userAddress: `0x${string}`,
  playerId: number,
  amount: number,
  value: string // ETH value in wei as string
) {
  try {
    // Get the Privy wallet client
    const walletClient = await getWalletClient(wagmiConfig, {
      chainId: megaeth.id,
    });

    if (!walletClient) {
      throw new Error('No wallet client available. Please connect your wallet.');
    }

    console.log('Using Privy wallet for transaction');

    // Create contract interface for encoding function data
    const contractInterface = new ethers.Interface(CONTRACT_ABI);

    // Encode the function call data
    const data = contractInterface.encodeFunctionData('buyShares', [playerId, amount]);

    // Prepare the transaction request
    const transactionRequest = {
      to: TOPSTRIKE_CONTRACT_ADDRESS as `0x${string}`,
      value: BigInt(ethers.parseEther(value).toString()),
      data: data as `0x${string}`,
      chainId: megaeth.id,
    };

    console.log('Privy transaction request:', transactionRequest);

    // Parse and log transaction details
    console.log('=== PRIVY TRANSACTION PARSING ===');
    console.log('Transaction Details:');
    console.log('  - To Address:', transactionRequest.to);
    console.log('  - Value (wei):', transactionRequest.value.toString());
    console.log('  - Value (ETH):', ethers.formatEther(transactionRequest.value));
    console.log('  - Data Length:', transactionRequest.data.length);
    console.log('  - Function Signature:', transactionRequest.data.slice(0, 10));

    // Parse the function call data
    const decodedData = contractInterface.decodeFunctionData('buyShares', transactionRequest.data);
    console.log('Decoded Function Call:');
    console.log('  - Function Name: buyShares');
    console.log('  - Player ID:', decodedData[0].toString());
    console.log('  - Amount:', decodedData[1].toString());
    console.log('==================================');

    // Send the transaction using Privy's wallet client
    console.log('Sending transaction via Privy wallet...');
    const txHash = await walletClient.sendTransaction(transactionRequest);

    console.log('Privy transaction sent:', txHash);

    // Wait for confirmation (optional - Privy handles this internally)
    // Note: Privy typically handles transaction confirmation through their UI
    // but we can still wait for the transaction if needed

    return { success: true, txHash, method: 'privy' as const };
  } catch (error) {
    console.error('Error buying shares with Privy:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'privy' as const
    };
  }
}

export async function sellSharesWithPrivy(
  userAddress: `0x${string}`,
  playerId: number,
  amount: number
) {
  try {
    // Get the Privy wallet client
    const walletClient = await getWalletClient(wagmiConfig, {
      chainId: megaeth.id,
    });

    if (!walletClient) {
      throw new Error('No wallet client available. Please connect your wallet.');
    }

    console.log('Using Privy wallet for sell transaction');

    // Create contract interface for encoding function data
    const contractInterface = new ethers.Interface(CONTRACT_ABI);

    // Encode the function call data
    const data = contractInterface.encodeFunctionData('sellShares', [playerId, amount]);

    // Prepare the transaction request
    const transactionRequest = {
      to: TOPSTRIKE_CONTRACT_ADDRESS as `0x${string}`,
      value: BigInt(0), // sellShares is not payable
      data: data as `0x${string}`,
      chainId: megaeth.id,
    };

    console.log('Privy sell transaction request:', transactionRequest);

    // Parse and log transaction details
    console.log('=== PRIVY SELL TRANSACTION PARSING ===');
    console.log('Transaction Details:');
    console.log('  - To Address:', transactionRequest.to);
    console.log('  - Value (wei):', transactionRequest.value.toString());
    console.log('  - Value (ETH):', ethers.formatEther(transactionRequest.value));
    console.log('  - Data Length:', transactionRequest.data.length);
    console.log('  - Function Signature:', transactionRequest.data.slice(0, 10));

    // Parse the function call data
    const decodedData = contractInterface.decodeFunctionData('sellShares', transactionRequest.data);
    console.log('Decoded Function Call:');
    console.log('  - Function Name: sellShares');
    console.log('  - Player ID:', decodedData[0].toString());
    console.log('  - Amount:', decodedData[1].toString());
    console.log('======================================');

    // Send the transaction using Privy's wallet client
    console.log('Sending sell transaction via Privy wallet...');
    const txHash = await walletClient.sendTransaction(transactionRequest);

    console.log('Privy sell transaction sent:', txHash);

    return { success: true, txHash, method: 'privy' as const };
  } catch (error) {
    console.error('Error selling shares with Privy:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'privy' as const
    };
  }
}

// Alternative implementation using wagmi's sendTransaction (if preferred)
export async function buySharesWithPrivyAlt(
  userAddress: `0x${string}`,
  playerId: number,
  amount: number,
  value: string
) {
  try {
    // Import sendTransaction from wagmi/actions
    const { sendTransaction } = await import('wagmi/actions');

    // Create contract interface for encoding function data
    const contractInterface = new ethers.Interface(CONTRACT_ABI);
    const data = contractInterface.encodeFunctionData('buyShares', [playerId, amount]);

    // Send transaction using wagmi's sendTransaction
    const txHash = await sendTransaction(wagmiConfig, {
      to: TOPSTRIKE_CONTRACT_ADDRESS as `0x${string}`,
      value: BigInt(ethers.parseEther(value).toString()),
      data: data as `0x${string}`,
      chainId: megaeth.id,
    });

    console.log('Privy transaction sent via wagmi:', txHash);

    return { success: true, txHash, method: 'privy' as const };
  } catch (error) {
    console.error('Error buying shares with Privy (wagmi):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'privy' as const
    };
  }
}

export async function sellSharesWithPrivyAlt(
  userAddress: `0x${string}`,
  playerId: number,
  amount: number
) {
  try {
    // Import sendTransaction from wagmi/actions
    const { sendTransaction } = await import('wagmi/actions');

    // Create contract interface for encoding function data
    const contractInterface = new ethers.Interface(CONTRACT_ABI);
    const data = contractInterface.encodeFunctionData('sellShares', [playerId, amount]);

    // Send transaction using wagmi's sendTransaction
    const txHash = await sendTransaction(wagmiConfig, {
      to: TOPSTRIKE_CONTRACT_ADDRESS as `0x${string}`,
      value: BigInt(0),
      data: data as `0x${string}`,
      chainId: megaeth.id,
    });

    console.log('Privy sell transaction sent via wagmi:', txHash);

    return { success: true, txHash, method: 'privy' as const };
  } catch (error) {
    console.error('Error selling shares with Privy (wagmi):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'privy' as const
    };
  }
}