import { ethers } from 'ethers';
import { TOPSTRIKE_CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import { getWalletClient } from '@wagmi/core';
import { wagmiConfig } from '../config/wagmi';
import { megaeth } from '../config/chains';

// Types for transaction operations
export interface SignedTransaction {
  serializedTransaction: `0x${string}`;
  transactionHash?: `0x${string}`;
}

// Core signing functions
export async function signBuySharesTransaction(
  userAddress: `0x${string}`,
  playerId: number,
  amount: number,
  value: string // ETH value in wei as string
): Promise<{ success: boolean; transactionRequest?: any; signedTransaction?: SignedTransaction; error?: string }> {
  try {
    // Get the Privy wallet client
    const walletClient = await getWalletClient(wagmiConfig, {
      chainId: megaeth.id,
    });

    if (!walletClient) {
      throw new Error('No wallet client available. Please connect your wallet.');
    }

    console.log('Using Wagmi wallet for transaction signing');

    // Create contract interface for encoding function data
    const contractInterface = new ethers.Interface(CONTRACT_ABI);

    // Encode the function call data
    const data = contractInterface.encodeFunctionData('buyShares', [playerId, amount]);

    // Get current gas price and estimate gas
    const provider = walletClient.transport;
    const ethersProvider = new ethers.BrowserProvider(provider);
    const feeData = await ethersProvider.getFeeData();
    const nonce = await ethersProvider.getTransactionCount(userAddress);

    // Estimate gas for the transaction
    const gasEstimate = await ethersProvider.estimateGas({
      to: TOPSTRIKE_CONTRACT_ADDRESS,
      data: data,
      value: ethers.parseEther(value),
      from: userAddress,
    });

    // Prepare the transaction request with all required fields
    // Use raw BigInt/number values for Privy compatibility
    const weiValue = BigInt(ethers.parseEther(value).toString());
    const transactionRequest = {
      from: userAddress,
      to: TOPSTRIKE_CONTRACT_ADDRESS,
      value: weiValue,
      data: data,
      nonce: nonce,
      chainId: megaeth.id,
      type: 2,
      gasLimit: gasEstimate,
      maxFeePerGas: feeData.maxFeePerGas || feeData.gasPrice || BigInt(0),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || BigInt(0),
    };

    console.log('Wagmi transaction request:', transactionRequest);

    // Parse and log transaction details
    console.log('=== PRIVY TRANSACTION SIGNING ===');
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

    // Sign the transaction using Privy's wallet client
    console.log('Signing transaction via Wagmi wallet...');
    const signedTransaction = await (walletClient as any).signTransaction(transactionRequest);

    console.log('Wagmi transaction signed:', signedTransaction);

    return {
      success: true,
      transactionRequest,
      signedTransaction: {
        serializedTransaction: signedTransaction,
        transactionHash: ethers.keccak256(signedTransaction) as `0x${string}`
      }
    };
  } catch (error) {
    console.error('Error signing buy shares transaction with Wagmi:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function signSellSharesTransaction(
  userAddress: `0x${string}`,
  playerId: number,
  amount: number
): Promise<{ success: boolean; transactionRequest?: any; signedTransaction?: SignedTransaction; error?: string }> {
  try {
    // Get the Privy wallet client
    const walletClient = await getWalletClient(wagmiConfig, {
      chainId: megaeth.id,
    });

    if (!walletClient) {
      throw new Error('No wallet client available. Please connect your wallet.');
    }

    console.log('Using Wagmi wallet for sell transaction signing');

    // Create contract interface for encoding function data
    const contractInterface = new ethers.Interface(CONTRACT_ABI);

    // Encode the function call data
    const data = contractInterface.encodeFunctionData('sellShares', [playerId, amount]);

    // Get current gas price and estimate gas
    const provider = walletClient.transport;
    const ethersProvider = new ethers.BrowserProvider(provider);
    const feeData = await ethersProvider.getFeeData();
    const nonce = await ethersProvider.getTransactionCount(userAddress);

    // Estimate gas for the transaction
    const gasEstimate = await ethersProvider.estimateGas({
      to: TOPSTRIKE_CONTRACT_ADDRESS,
      data: data,
      from: userAddress,
    });

    // Prepare the transaction request with all required fields
    // Use raw BigInt/number values for Privy compatibility
    const transactionRequest = {
      from: userAddress,
      to: TOPSTRIKE_CONTRACT_ADDRESS,
      value: BigInt(0), // sellShares is not payable
      data: data,
      nonce: nonce,
      chainId: megaeth.id,
      type: 2,
      gasLimit: gasEstimate,
      maxFeePerGas: feeData.maxFeePerGas || feeData.gasPrice || BigInt(0),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || BigInt(0),
    };

    console.log('Wagmi sell transaction request:', transactionRequest);

    // Parse and log transaction details
    console.log('=== PRIVY SELL TRANSACTION SIGNING ===');
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

    // Sign the transaction using Privy's wallet client
    console.log('Signing sell transaction via Wagmi wallet...');
    const signedTransaction = await (walletClient as any).signTransaction(transactionRequest);

    console.log('Wagmi sell transaction signed:', signedTransaction);

    return {
      success: true,
      transactionRequest,
      signedTransaction: {
        serializedTransaction: signedTransaction,
        transactionHash: ethers.keccak256(signedTransaction) as `0x${string}`
      }
    };
  } catch (error) {
    console.error('Error signing sell shares transaction with Wagmi:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Core sending functions
export async function sendSignedTransaction(
  signedTransaction: SignedTransaction
): Promise<{ success: boolean; txHash?: `0x${string}`; error?: string }> {
  try {
    console.log('Sending signed transaction...');

    // Get a provider to broadcast the transaction
    const walletClient = await getWalletClient(wagmiConfig, {
      chainId: megaeth.id,
    });

    if (!walletClient) {
      throw new Error('No wallet client available for sending transaction.');
    }

    // Send the signed transaction
    const txHash = await walletClient.sendRawTransaction({
      serializedTransaction: signedTransaction.serializedTransaction
    });

    console.log('Signed transaction sent:', txHash);

    return { success: true, txHash };
  } catch (error) {
    console.error('Error sending signed transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Alternative sending using provider broadcast
export async function broadcastSignedTransaction(
  signedTransaction: `0x${string}`
): Promise<{ success: boolean; txHash?: `0x${string}`; error?: string }> {
  try {
    console.log('Broadcasting signed transaction...');

    // Get the provider from wagmi config
    const { getPublicClient } = await import('wagmi/actions');
    const client = getPublicClient(wagmiConfig, { chainId: megaeth.id });

    // Broadcast the signed transaction
    const txHash = await client.sendRawTransaction({
      serializedTransaction: signedTransaction
    });

    console.log('Signed transaction broadcasted:', txHash);

    return { success: true, txHash };
  } catch (error) {
    console.error('Error broadcasting signed transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Combined sign and send functions (for convenience)
export async function buySharesWithWagmi(
  userAddress: `0x${string}`,
  playerId: number,
  amount: number,
  value: string // ETH value in wei as string
) {
  try {
    // First sign the transaction
    const signResult = await signBuySharesTransaction(userAddress, playerId, amount, value);

    if (!signResult.success || !signResult.signedTransaction) {
      return {
        success: false,
        error: signResult.error || 'Failed to sign transaction',
        method: 'privy' as const
      };
    }

    // Then send the signed transaction
    const sendResult = await sendSignedTransaction(signResult.signedTransaction);

    if (!sendResult.success) {
      return {
        success: false,
        error: sendResult.error || 'Failed to send transaction',
        method: 'privy' as const
      };
    }

    return { success: true, txHash: sendResult.txHash, method: 'privy' as const };
  } catch (error) {
    console.error('Error buying shares with Wagmi:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'privy' as const
    };
  }
}

export async function sellSharesWithWagmi(
  userAddress: `0x${string}`,
  playerId: number,
  amount: number
) {
  try {
    // First sign the transaction
    const signResult = await signSellSharesTransaction(userAddress, playerId, amount);

    if (!signResult.success || !signResult.signedTransaction) {
      return {
        success: false,
        error: signResult.error || 'Failed to sign transaction',
        method: 'privy' as const
      };
    }

    // Then send the signed transaction
    const sendResult = await sendSignedTransaction(signResult.signedTransaction);

    if (!sendResult.success) {
      return {
        success: false,
        error: sendResult.error || 'Failed to send transaction',
        method: 'privy' as const
      };
    }

    return { success: true, txHash: sendResult.txHash, method: 'privy' as const };
  } catch (error) {
    console.error('Error selling shares with Wagmi:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'privy' as const
    };
  }
}

// Alternative implementation using wagmi's sendTransaction (if preferred)
export async function buySharesWithWagmiAlt(
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

    console.log('Wagmi transaction sent via wagmi:', txHash);

    return { success: true, txHash, method: 'privy' as const };
  } catch (error) {
    console.error('Error buying shares with Wagmi (wagmi):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'privy' as const
    };
  }
}

export async function sellSharesWithWagmiAlt(
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

    console.log('Wagmi sell transaction sent via wagmi:', txHash);

    return { success: true, txHash, method: 'privy' as const };
  } catch (error) {
    console.error('Error selling shares with Wagmi (wagmi):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'privy' as const
    };
  }
}