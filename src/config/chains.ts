import { defineChain } from 'viem'

// MegaETH Chain Configuration
export const megaeth = defineChain({
  id: 6342,
  blockTime: 1_000,
  name: 'MegaETH Testnet',
  nativeCurrency: {
    name: 'MegaETH Testnet Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_MEGAETH_RPC || 'https://carrot.megaeth.com/rpc'],
      webSocket: [process.env.NEXT_PUBLIC_MEGAETH_WSS || 'wss://carrot.megaeth.com/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MegaETH Testnet Explorer',
      url: 'https://www.megaexplorer.xyz/',
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
  testnet: true,
})
