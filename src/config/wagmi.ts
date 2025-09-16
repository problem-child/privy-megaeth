import { http, createConfig } from 'wagmi'
import { megaeth } from './chains'

export const wagmiConfig = createConfig({
  chains: [megaeth],
  transports: {
    [megaeth.id]: http(),
  },
})
