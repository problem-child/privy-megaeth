import { ethers } from 'ethers';
import { TOPSTRIKE_CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contracts';

export function getTopStrikeContract(signer: ethers.Signer) {
  return new ethers.Contract(TOPSTRIKE_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

export async function buySharesWithEthers(
  signer: ethers.Signer,
  playerId: number,
  amount: number,
  value: string // ETH value in wei as string
) {
  const contract = getTopStrikeContract(signer);

  try {
    const tx = await contract.buyShares(playerId, amount, {
      value: ethers.parseEther(value)
    });

    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    return { success: true, txHash: tx.hash, receipt };
  } catch (error) {
    console.error('Error buying shares:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sellSharesWithEthers(
  signer: ethers.Signer,
  playerId: number,
  amount: number
) {
  const contract = getTopStrikeContract(signer);

  try {
    const tx = await contract.sellShares(playerId, amount);

    console.log('Sell transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Sell transaction confirmed:', receipt);

    return { success: true, txHash: tx.hash, receipt };
  } catch (error) {
    console.error('Error selling shares:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}