import { ethers } from 'ethers';
import { TOPSTRIKE_CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';
import {logObjectTable, logTransactionTable} from "@/utils/objectTableLogger";

export interface PrivyRealtimeTransactionResult {
  success: boolean;
  txHash?: string;
  receipt?: any;
  error?: string;
  method: 'privy-native-realtime';
}

export async function buySharesWithPrivyNativeRealtime(
  signTransaction: (transaction: any) => Promise<{ signature: `0x${string}` }>,
  provider: ethers.Provider,
  userAddress: string,
  playerId: number,
  amount: number,
  value: string // ETH value in wei as string
): Promise<PrivyRealtimeTransactionResult> {
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

    console.log('Privy Native Realtime buy transaction object:', transaction);
    logTransactionTable(transaction, 'Privy Native Realtime buy transaction object');

    //
    // // Parse and log detailed gas settings
    // console.log('=== PRIVY NATIVE REALTIME BUY TRANSACTION PARSING & GAS SETTINGS ===');
    // console.log('Gas Settings:');
    // console.log('  - Gas Limit:', gasEstimate.toString());
    // console.log('  - Gas Price (wei):', gasPrice.gasPrice?.toString() || 'undefined');
    // console.log('  - Gas Price (gwei):', gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : 'undefined');
    // console.log('  - Max Fee Per Gas:', gasPrice.maxFeePerGas?.toString() || 'undefined');
    // console.log('  - Max Priority Fee Per Gas:', gasPrice.maxPriorityFeePerGas?.toString() || 'undefined');
    //
    // // Calculate estimated transaction cost
    // const estimatedCost = gasPrice.gasPrice ? gasEstimate * gasPrice.gasPrice : BigInt(0);
    // console.log('  - Estimated Gas Cost (wei):', estimatedCost.toString());
    // console.log('  - Estimated Gas Cost (ETH):', ethers.formatEther(estimatedCost));
    //
    // console.log('Transaction Details:');
    // console.log('  - To Address:', transaction.to);
    // console.log('  - Value (wei):', transaction.value.toString());
    // console.log('  - Value (ETH):', ethers.formatEther(transaction.value));
    // console.log('  - Nonce:', transaction.nonce);
    // console.log('  - Data Length:', transaction.data.length);
    // console.log('  - Function Signature:', transaction.data.slice(0, 10));
    //
    // // Parse the function call data
    // const decodedData = contractInterface.decodeFunctionData('buyShares', transaction.data);
    // console.log('Decoded Function Call:');
    // console.log('  - Function Name: buyShares');
    // console.log('  - Player ID:', decodedData[0].toString());
    // console.log('  - Amount:', decodedData[1].toString());
    //
    // console.log('Network Info:');
    // const network = await provider.getNetwork();
    // console.log('  - Chain ID:', network.chainId.toString());
    // console.log('  - Network Name:', network.name);
    // console.log('=================================================================');

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



    // Send the raw transaction using realtime_sendRawTransaction
    console.log('Sending transaction via realtime_sendRawTransaction...');
    const jsonRpcProvider = provider as ethers.JsonRpcProvider;
    const receipt = await jsonRpcProvider.send('realtime_sendRawTransaction', [signedTransaction]);
    console.log('Privy native realtime buy transaction receipt:', receipt);

    return {
      success: true,
      txHash: receipt.transactionHash || receipt.hash,
      receipt,
      method: 'privy-native-realtime' as const
    };
  } catch (error) {
    console.error('Error buying shares with Privy native realtime transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'privy-native-realtime' as const
    };
  }
}

export async function sellSharesWithPrivyNativeRealtime(
  signTransaction: (transaction: any) => Promise<{ signature: `0x${string}` }>,
  provider: ethers.Provider,
  userAddress: string,
  playerId: number,
  amount: number
): Promise<PrivyRealtimeTransactionResult> {
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

    console.log('Privy Native Realtime sell transaction object:', transaction);

    // Parse and log detailed gas settings for sell transaction
    console.log('=== PRIVY NATIVE REALTIME SELL TRANSACTION PARSING & GAS SETTINGS ===');
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
    console.log('==================================================================');

    // Sign the transaction using Privy's signTransaction
    console.log('Signing sell transaction with Privy native signTransaction...');
    const signedResult = await signTransaction(transaction);
    const signedTransaction = signedResult.signature;
    console.log('Privy native signed sell transaction:', signedTransaction);

    // Parse the signed transaction
    const parsedSignedTx = ethers.Transaction.from(signedTransaction);
    console.log('=== PRIVY NATIVE REALTIME SELL SIGNED TRANSACTION PARSING ===');
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
    console.log('==========================================================');

    // Send the raw transaction using realtime_sendRawTransaction
    console.log('Sending sell transaction via realtime_sendRawTransaction...');
    const jsonRpcProvider = provider as ethers.JsonRpcProvider;
    const receipt = await jsonRpcProvider.send('realtime_sendRawTransaction', [signedTransaction]);
    console.log('Privy native realtime sell transaction receipt:', receipt);

    return {
      success: true,
      txHash: receipt.transactionHash || receipt.hash,
      receipt,
      method: 'privy-native-realtime' as const
    };
  } catch (error) {
    console.error('Error selling shares with Privy native realtime transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'privy-native-realtime' as const
    };
  }
}
