import { ethers } from 'ethers';
import { TOPSTRIKE_CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import {logObjectTable, logTransactionTable} from "@/utils/objectTableLogger";

export interface PrivyTransactionResult {
  success: boolean;
  txHash?: string;
  receipt?: any;
  error?: string;
  method: 'privy-native';
}

export async function buySharesWithPrivyNative(
  signTransaction: (transaction: any) => Promise<{ signature: `0x${string}` }>,
  provider: ethers.Provider,
  userAddress: string,
  playerId: number,
  amount: number,
  value: string // ETH value in wei as string
): Promise<PrivyTransactionResult> {
  try {
    // Create contract interface for encoding function data
    const contractInterface = new ethers.Interface(CONTRACT_ABI);

    // Encode the function call data
    const data = contractInterface.encodeFunctionData('buyShares', [playerId, amount]);

    // Get current gas price and estimate gas
    const gasPrice = await provider.getFeeData();

    // Estimate gas for the transaction
    const gasEstimate = await provider.estimateGas({
      to: TOPSTRIKE_CONTRACT_ADDRESS,
      data: data,
      value: ethers.parseEther(value),
      from: userAddress,
    });

    // Get nonce
    const nonce = await provider.getTransactionCount(userAddress);

    // Create transaction object for Privy signing
    const transaction = {
      to: TOPSTRIKE_CONTRACT_ADDRESS,
      value: ethers.parseEther(value),
      gasLimit: gasEstimate,
      gasPrice: gasPrice.gasPrice,
      nonce: nonce,
      data: data,
    };

    console.log('Privy Native buy transaction object:', transaction);

    // Sign the transaction using Privy's signTransaction
    console.log('Signing transaction with Privy native signTransaction...');
    const signedResult = await signTransaction(transaction);


    const signedTransaction = signedResult.signature;
    console.log('Privy native signed transaction:', signedTransaction);

    // Parse the signed transaction
    const parsedSignedTx = ethers.Transaction.from(signedTransaction);
    console.log('=== SIGNED REALTIME TRANSACTION PARSING ===');

    // Extract key attributes from parsed signed transaction
    const parsedTxAttributes = {
      hash: parsedSignedTx.hash,
      to: parsedSignedTx.to,
      from: parsedSignedTx.from,
      value: parsedSignedTx.value.toString(),
      valueEth: ethers.formatEther(parsedSignedTx.value),
      gasLimit: parsedSignedTx.gasLimit.toString(),
      gasPrice: parsedSignedTx.gasPrice?.toString() || 'null',
      gasPriceGwei: parsedSignedTx.gasPrice ? ethers.formatUnits(parsedSignedTx.gasPrice, 'gwei') : 'null',
      nonce: parsedSignedTx.nonce,
      data: parsedSignedTx.data,
      dataLength: parsedSignedTx.data.length,
      functionSignature: parsedSignedTx.data.slice(0, 10),
      chainId: parsedSignedTx.chainId.toString(),
      type: parsedSignedTx.type,
      signature: {
        r: parsedSignedTx.signature?.r || 'null',
        s: parsedSignedTx.signature?.s || 'null',
        v: parsedSignedTx.signature?.v?.toString() || 'null'
      },
      serialized: parsedSignedTx.serialized,
      serializedLength: parsedSignedTx.serialized.length
    };

    console.log('=== SIGNED REALTIME TRANSACTION ATTRIBUTES ===');
    logObjectTable(parsedTxAttributes, 'Parsed Signed Transaction Attributes');




    console.log('=== PRIVY NATIVE SIGNED TRANSACTION PARSING ===');
    console.log('Parsed Signed Transaction:');
    console.log('  - Hash:', parsedSignedTx.hash);
    console.log('  - From:', parsedSignedTx.from);
    console.log('  - To:', parsedSignedTx.to);
    console.log('  - Value:', parsedSignedTx.value.toString());
    console.log('  - Gas Limit:', parsedSignedTx.gasLimit.toString());
    console.log('  - Gas Price:', parsedSignedTx.gasPrice?.toString() || 'undefined');
    console.log('  - Nonce:', parsedSignedTx.nonce);
    console.log('  - Type:', parsedSignedTx.type);
    console.log('  - Chain ID:', parsedSignedTx.chainId.toString());
    console.log('=============================================');

    // Send the signed transaction
    console.log('Broadcasting transaction...');
    const txResponse = await provider.broadcastTransaction(signedTransaction);
    console.log('Transaction response:', txResponse);

    // Wait for transaction receipt
    const receipt = await txResponse.wait();
    console.log('Privy native buy transaction receipt:', receipt);

    return {
      success: true,
      txHash: receipt?.hash || txResponse.hash,
      receipt,
      method: 'privy-native' as const
    };
  } catch (error) {
    console.error('Error buying shares with Privy native transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'privy-native' as const
    };
  }
}

export async function sellSharesWithPrivyNative(
  signTransaction: (transaction: any) => Promise<{ signature: `0x${string}` }>,
  provider: ethers.Provider,
  userAddress: string,
  playerId: number,
  amount: number
): Promise<PrivyTransactionResult> {
  try {
    // TODO: Implement sell shares with Privy native signing
    console.log('sellSharesWithPrivyNative called with:', {
      userAddress,
      playerId,
      amount
    });

    // Stub implementation - return success for now
    return {
      success: true,
      txHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      method: 'privy-native' as const
    };
  } catch (error) {
    console.error('Error in sellSharesWithPrivyNative:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'privy-native' as const
    };
  }
}
