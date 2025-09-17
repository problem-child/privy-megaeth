import { ethers } from 'ethers';
import { TOPSTRIKE_CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';

export async function buySharesWithEthersRealtime(
  signer: ethers.Signer,
  playerId: number,
  amount: number,
  value: string // ETH value in wei as string
) {
  try {
    // Create contract interface for encoding function data
    const contractInterface = new ethers.Interface(CONTRACT_ABI);

    // Encode the function call data
    const data = contractInterface.encodeFunctionData('buyShares', [playerId, amount]);

    // Get the signer's address
    const signerAddress = await signer.getAddress();

    // Get current gas price and estimate gas
    const provider = signer.provider;
    if (!provider) {
      throw new Error('Provider not available');
    }

    const gasPrice = await provider.getFeeData();

    // Estimate gas for the transaction
    const gasEstimate = await provider.estimateGas({
      to: TOPSTRIKE_CONTRACT_ADDRESS,
      data: data,
      value: ethers.parseEther(value),
      from: signerAddress,
    });

    // Get nonce
    const nonce = await provider.getTransactionCount(signerAddress);

    // Create raw transaction object
    const rawTransaction = {
      to: TOPSTRIKE_CONTRACT_ADDRESS,
      value: ethers.parseEther(value),
      gasLimit: gasEstimate,
      gasPrice: gasPrice.gasPrice,
      nonce: nonce,
      data: data,
    };

    console.log('Realtime raw transaction object:', rawTransaction);

    // Parse and log detailed gas settings
    console.log('=== REALTIME TRANSACTION PARSING & GAS SETTINGS ===');
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
    console.log('  - To Address:', rawTransaction.to);
    console.log('  - Value (wei):', rawTransaction.value.toString());
    console.log('  - Value (ETH):', ethers.formatEther(rawTransaction.value));
    console.log('  - Nonce:', rawTransaction.nonce);
    console.log('  - Data Length:', rawTransaction.data.length);
    console.log('  - Function Signature:', rawTransaction.data.slice(0, 10));

    // Parse the function call data
    const decodedData = contractInterface.decodeFunctionData('buyShares', rawTransaction.data);
    console.log('Decoded Function Call:');
    console.log('  - Function Name: buyShares');
    console.log('  - Player ID:', decodedData[0].toString());
    console.log('  - Amount:', decodedData[1].toString());

    console.log('Network Info:');
    const network = await provider.getNetwork();
    console.log('  - Chain ID:', network.chainId.toString());
    console.log('  - Network Name:', network.name);
    console.log('===========================================');

    // Sign the transaction
    const signedTransaction = await signer.signTransaction(rawTransaction);
    console.log('Signed realtime transaction:', signedTransaction);

    // Parse the signed transaction
    const parsedSignedTx = ethers.Transaction.from(signedTransaction);
    console.log('=== SIGNED REALTIME TRANSACTION PARSING ===');
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
    console.log('===================================');

    // Send the raw transaction using realtime_sendRawTransaction
    console.log('Sending transaction via realtime_sendRawTransaction...');
    const jsonRpcProvider = provider as ethers.JsonRpcProvider;
    const receipt = await jsonRpcProvider.send('realtime_sendRawTransaction', [signedTransaction]);
    console.log('Realtime transaction receipt:', receipt);

    return { success: true, txHash: receipt.transactionHash, receipt, method: 'realtime' as const };
  } catch (error) {
    console.error('Error buying shares with ethers realtime transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'realtime' as const
    };
  }
}

export async function sellSharesWithEthersRealtime(
  signer: ethers.Signer,
  playerId: number,
  amount: number
) {
  try {
    // Create contract interface for encoding function data
    const contractInterface = new ethers.Interface(CONTRACT_ABI);

    // Encode the function call data
    const data = contractInterface.encodeFunctionData('sellShares', [playerId, amount]);

    // Get the signer's address
    const signerAddress = await signer.getAddress();

    // Get current gas price and estimate gas
    const provider = signer.provider;
    if (!provider) {
      throw new Error('Provider not available');
    }

    const gasPrice = await provider.getFeeData();

    // Estimate gas for the transaction
    const gasEstimate = await provider.estimateGas({
      to: TOPSTRIKE_CONTRACT_ADDRESS,
      data: data,
      from: signerAddress,
    });

    // Get nonce
    const nonce = await provider.getTransactionCount(signerAddress);

    // Create raw transaction object
    const rawTransaction = {
      to: TOPSTRIKE_CONTRACT_ADDRESS,
      value: 0, // sellShares is not payable
      gasLimit: gasEstimate,
      gasPrice: gasPrice.gasPrice,
      nonce: nonce,
      data: data,
    };

    console.log('Realtime raw sell transaction object:', rawTransaction);

    // Parse and log detailed gas settings for sell transaction
    console.log('=== REALTIME SELL TRANSACTION PARSING & GAS SETTINGS ===');
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
    console.log('  - To Address:', rawTransaction.to);
    console.log('  - Value (wei):', rawTransaction.value.toString());
    console.log('  - Value (ETH):', ethers.formatEther(rawTransaction.value.toString()));
    console.log('  - Nonce:', rawTransaction.nonce);
    console.log('  - Data Length:', rawTransaction.data.length);
    console.log('  - Function Signature:', rawTransaction.data.slice(0, 10));

    // Parse the function call data
    const decodedData = contractInterface.decodeFunctionData('sellShares', rawTransaction.data);
    console.log('Decoded Function Call:');
    console.log('  - Function Name: sellShares');
    console.log('  - Player ID:', decodedData[0].toString());
    console.log('  - Amount:', decodedData[1].toString());

    console.log('Network Info:');
    const network = await provider.getNetwork();
    console.log('  - Chain ID:', network.chainId.toString());
    console.log('  - Network Name:', network.name);
    console.log('===============================================');

    // Sign the transaction
    const signedTransaction = await signer.signTransaction(rawTransaction);
    console.log('Signed realtime sell transaction:', signedTransaction);

    // Parse the signed transaction
    const parsedSignedTx = ethers.Transaction.from(signedTransaction);
    console.log('=== SIGNED REALTIME SELL TRANSACTION PARSING ===');
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
    console.log('=========================================');

    // Send the raw transaction using realtime_sendRawTransaction
    console.log('Sending sell transaction via realtime_sendRawTransaction...');
    const jsonRpcProvider = provider as ethers.JsonRpcProvider;
    const receipt = await jsonRpcProvider.send('realtime_sendRawTransaction', [signedTransaction]);
    console.log('Realtime sell transaction receipt:', receipt);

    return { success: true, txHash: receipt.transactionHash, receipt, method: 'realtime' as const };
  } catch (error) {
    console.error('Error selling shares with ethers realtime transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'realtime' as const
    };
  }
}