import { ethers } from 'ethers';
import { TOPSTRIKE_CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';

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

    // Parse and log detailed gas settings
    console.log('=== PRIVY NATIVE BUY TRANSACTION PARSING & GAS SETTINGS ===');
    console.log('Gas Settings:');
    console.log('  - Gas Limit:', gasEstimate.toString());
    console.log('  - Gas Price (wei):', gasPrice.gasPrice?.toString() || 'undefined');
    console.log('  - Gas Price (gwei):', gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : 'undefined');
    console.log('  - Max Fee Per Gas:', gasPrice.maxFeePerGas?.toString() || 'undefined');
    console.log('  - Max Priority Fee Per Gas:', gasPrice.maxPriorityFeePerGas?.toString() || 'undefined');

    // Calculate estimated transaction cost
    const estimatedCost = gasPrice.gasPrice ? gasEstimate * gasPrice.gasPrice : BigInt(0);
    console.log('  - Estimated Gas Cost (wei):', estimatedCost.toString());
    console.log('  - Estimated Gas Cost (ETH):', ethers.formatEther(estimatedCost));

    console.log('Transaction Details:');
    console.log('  - To Address:', transaction.to);
    console.log('  - Value (wei):', transaction.value.toString());
    console.log('  - Value (ETH):', ethers.formatEther(transaction.value));
    console.log('  - Nonce:', transaction.nonce);
    console.log('  - Data Length:', transaction.data.length);
    console.log('  - Function Signature:', transaction.data.slice(0, 10));

    // Parse the function call data
    const decodedData = contractInterface.decodeFunctionData('buyShares', transaction.data);
    console.log('Decoded Function Call:');
    console.log('  - Function Name: buyShares');
    console.log('  - Player ID:', decodedData[0].toString());
    console.log('  - Amount:', decodedData[1].toString());

    console.log('Network Info:');
    const network = await provider.getNetwork();
    console.log('  - Chain ID:', network.chainId.toString());
    console.log('  - Network Name:', network.name);
    console.log('=======================================================');

    // Sign the transaction using Privy's signTransaction
    console.log('Signing transaction with Privy native signTransaction...');
    const signedResult = await signTransaction(transaction);
    const signedTransaction = signedResult.signature;
    console.log('Privy native signed transaction:', signedTransaction);

    // Parse the signed transaction
    const parsedSignedTx = ethers.Transaction.from(signedTransaction);
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
    // Create contract interface for encoding function data
    const contractInterface = new ethers.Interface(CONTRACT_ABI);

    // Encode the function call data
    const data = contractInterface.encodeFunctionData('sellShares', [playerId, amount]);

    // Get current gas price and estimate gas
    const gasPrice = await provider.getFeeData();

    // Estimate gas for the transaction
    const gasEstimate = await provider.estimateGas({
      to: TOPSTRIKE_CONTRACT_ADDRESS,
      data: data,
      from: userAddress,
    });

    // Get nonce
    const nonce = await provider.getTransactionCount(userAddress);

    // Create transaction object for Privy signing
    const transaction = {
      to: TOPSTRIKE_CONTRACT_ADDRESS,
      value: 0, // sellShares is not payable
      gasLimit: gasEstimate,
      gasPrice: gasPrice.gasPrice,
      nonce: nonce,
      data: data,
    };

    console.log('Privy Native sell transaction object:', transaction);

    // Parse and log detailed gas settings for sell transaction
    console.log('=== PRIVY NATIVE SELL TRANSACTION PARSING & GAS SETTINGS ===');
    console.log('Gas Settings:');
    console.log('  - Gas Limit:', gasEstimate.toString());
    console.log('  - Gas Price (wei):', gasPrice.gasPrice?.toString() || 'undefined');
    console.log('  - Gas Price (gwei):', gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : 'undefined');
    console.log('  - Max Fee Per Gas:', gasPrice.maxFeePerGas?.toString() || 'undefined');
    console.log('  - Max Priority Fee Per Gas:', gasPrice.maxPriorityFeePerGas?.toString() || 'undefined');

    // Calculate estimated transaction cost
    const estimatedCost = gasPrice.gasPrice ? gasEstimate * gasPrice.gasPrice : BigInt(0);
    console.log('  - Estimated Gas Cost (wei):', estimatedCost.toString());
    console.log('  - Estimated Gas Cost (ETH):', ethers.formatEther(estimatedCost));

    console.log('Transaction Details:');
    console.log('  - To Address:', transaction.to);
    console.log('  - Value (wei):', transaction.value.toString());
    console.log('  - Value (ETH):', ethers.formatEther(transaction.value.toString()));
    console.log('  - Nonce:', transaction.nonce);
    console.log('  - Data Length:', transaction.data.length);
    console.log('  - Function Signature:', transaction.data.slice(0, 10));

    // Parse the function call data
    const decodedData = contractInterface.decodeFunctionData('sellShares', transaction.data);
    console.log('Decoded Function Call:');
    console.log('  - Function Name: sellShares');
    console.log('  - Player ID:', decodedData[0].toString());
    console.log('  - Amount:', decodedData[1].toString());

    console.log('Network Info:');
    const network = await provider.getNetwork();
    console.log('  - Chain ID:', network.chainId.toString());
    console.log('  - Network Name:', network.name);
    console.log('========================================================');

    // Sign the transaction using Privy's signTransaction
    console.log('Signing sell transaction with Privy native signTransaction...');
    const signedResult = await signTransaction(transaction);
    const signedTransaction = signedResult.signature;
    console.log('Privy native signed sell transaction:', signedTransaction);

    // Parse the signed transaction
    const parsedSignedTx = ethers.Transaction.from(signedTransaction);
    console.log('=== PRIVY NATIVE SIGNED SELL TRANSACTION PARSING ===');
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
    console.log('==============================================');

    // Send the signed transaction
    console.log('Broadcasting sell transaction...');
    const txResponse = await provider.broadcastTransaction(signedTransaction);
    console.log('Sell transaction response:', txResponse);

    // Wait for transaction receipt
    const receipt = await txResponse.wait();
    console.log('Privy native sell transaction receipt:', receipt);

    return {
      success: true,
      txHash: receipt?.hash || txResponse.hash,
      receipt,
      method: 'privy-native' as const
    };
  } catch (error) {
    console.error('Error selling shares with Privy native transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'privy-native' as const
    };
  }
}
