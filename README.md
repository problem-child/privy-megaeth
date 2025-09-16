This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.

# Privy + MegaETH Integration

This Next.js project demonstrates how to integrate Privy embedded wallets with the MegaETH blockchain. Users can authenticate via email or external wallets and automatically receive embedded wallets for seamless interaction with the MegaETH network.

## Features

- 🔐 **Privy Authentication**: Email and wallet-based login
- 💼 **Embedded Wallets**: Automatic wallet creation for users without wallets
- ⚡ **MegaETH Integration**: Native support for MegaETH blockchain
- 🎨 **Modern UI**: Clean, responsive interface with Tailwind CSS
- 🔄 **Real-time Updates**: Live wallet balance and connection status

## Prerequisites

- Node.js 16+ and npm
- A Privy account and app configuration
- Basic understanding of React and Next.js

## Quick Start

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
3. **Configure your Privy App ID** in `.env.local`:
   ```env
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## Privy Dashboard Setup

Follow these steps to configure your Privy application for MegaETH integration:

### 1. Create a Privy Account

1. Go to [https://dashboard.privy.io](https://dashboard.privy.io)
2. Sign up for an account or log in if you already have one
3. Create a new app or select an existing one

### 2. Get Your App ID

1. In your Privy dashboard, navigate to your app
2. Copy the **App ID** from the overview page
3. Add it to your `.env.local` file as `NEXT_PUBLIC_PRIVY_APP_ID`

### 3. Configure Login Methods

In your Privy dashboard:

1. Go to **Configuration** → **Login methods**
2. Enable the following login methods:
   - ✅ **Email** (for passwordless authentication)
   - ✅ **Wallet** (for existing wallet connections)
3. Configure any additional social login providers if desired

### 4. Set Up Embedded Wallets

1. Navigate to **Configuration** → **Embedded wallets**
2. Enable **Embedded wallet creation**
3. Configure the following settings:
   - **Creation policy**: "Create for users without wallets" (recommended)
   - **Wallet type**: "Privy wallet" (default)
   - **Recovery method**: Enable email recovery

### 5. Configure Supported Networks

1. Go to **Configuration** → **Networks**
2. Add MegaETH as a supported network:
   - **Network Name**: MegaETH
   - **Chain ID**: 70700
   - **RPC URL**: https://rpc.megaeth.systems
   - **Currency Symbol**: ETH
   - **Block Explorer**: https://explorer.megaeth.systems

### 6. Set Default Network

1. In the Networks configuration page
2. Set **MegaETH** as the default network for embedded wallets
3. This ensures new embedded wallets are created on MegaETH by default

### 7. Configure App Settings

1. Navigate to **Configuration** → **App settings**
2. Configure the following:
   - **App name**: Your application name
   - **App logo**: Upload your app logo URL
   - **Theme**: Choose light or dark theme
   - **Accent color**: Set your brand color (e.g., #676FFF)

### 8. Set Up Domains (Production)

For production deployment:

1. Go to **Configuration** → **Settings**
2. Add your production domain(s) to **Allowed origins**
3. Add any additional callback URLs if using OAuth providers

### 9. Configure Webhooks (Optional)

To receive user events:

1. Navigate to **Configuration** → **Webhooks**
2. Add your webhook endpoint URL
3. Select events you want to receive:
   - User created
   - User logged in
   - Wallet linked
   - Wallet created

## Project Structure

```
src/
├── config/
│   ├── chains.ts          # MegaETH chain configuration
│   └── wagmi.ts           # Wagmi configuration
├── pages/
│   ├── _app.tsx           # Privy provider setup
│   └── index.tsx          # Demo page with wallet integration
└── styles/
    └── globals.css        # Tailwind CSS styles
```

## Key Configuration Files

### MegaETH Chain Configuration (`src/config/chains.ts`)

```typescript
import { defineChain } from 'viem'

export const megaeth = defineChain({
  id: 70700,
  name: 'MegaETH',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.megaeth.systems'],
    },
  },
  blockExplorers: {
    default: {
      name: 'MegaETH Explorer',
      url: 'https://explorer.megaeth.systems',
    },
  },
  testnet: false,
})
```

### Privy Provider Setup (`src/pages/_app.tsx`)

The app is configured with:
- Email and wallet login methods
- Embedded wallet creation for users without wallets
- MegaETH as the default and supported chain
- Wagmi integration for blockchain interactions

## Transaction Methods

This project provides multiple ways to interact with the MegaETH blockchain, each optimized for different use cases:

### Available Methods

1. **Contract Method** (`'contract'`)
   - Uses ethers.js contract abstraction
   - Easier development with automatic encoding/decoding
   - Good for most standard interactions

2. **Raw Transaction Method** (`'raw'`)
   - Manual transaction signing and broadcasting
   - Lower-level control over transaction parameters
   - Useful for advanced use cases

3. **Realtime Transaction Method** (`'realtime'`) ⭐ **NEW**
   - Uses MegaETH's `realtime_sendRawTransaction` API
   - Ultra-fast execution with immediate receipt
   - No polling required - gets results in ~10ms
   - Perfect for high-frequency trading applications

### Usage Examples

```typescript
import { buyShares, sellShares } from '../utils/unifiedContract';

// Using contract method (default)
const result1 = await buyShares(signer, playerId, amount, value, 'contract');

// Using raw transaction method
const result2 = await buyShares(signer, playerId, amount, value, 'raw');

// Using realtime method (recommended for speed)
const result3 = await buyShares(signer, playerId, amount, value, 'realtime');
```

### Realtime Method Benefits

- ⚡ **10ms execution**: Transactions are executed and receipts returned within 10 milliseconds
- 📄 **Immediate receipts**: No need to poll for transaction confirmation
- 🔒 **Preconfirmed**: Uses MegaETH's preconfirmation guarantees
- 🎯 **Perfect for trading**: Ideal for high-frequency trading applications

### When to Use Each Method

- **Use `contract`** for standard development and simpler code
- **Use `raw`** when you need fine-grained control over transaction parameters
- **Use `realtime`** for maximum speed and immediate feedback (recommended for production trading apps)

## Troubleshooting

### Common Issues

1. **"App ID not found" error**:
   - Verify your `NEXT_PUBLIC_PRIVY_APP_ID` is correct
   - Ensure the environment variable is properly loaded

2. **Network connection issues**:
   - Check that MegaETH RPC endpoint is accessible
   - Verify chain configuration matches the network

3. **Embedded wallet not created**:
   - Ensure embedded wallets are enabled in Privy dashboard
   - Check the creation policy is set correctly

4. **CORS errors in production**:
   - Add your domain to allowed origins in Privy dashboard
   - Verify all callback URLs are properly configured

### Debug Mode

To enable debug mode, add this to your Privy configuration:

```typescript
config={{
  // ... other config
  _debug: true, // Only for development
}}
```

## Security Considerations

- Never expose your Privy App Secret in client-side code
- Use environment variables for all sensitive configuration
- Implement proper error handling for authentication flows
- Consider rate limiting for production applications

## Next Steps

- Implement transaction signing with embedded wallets
- Add support for smart contract interactions
- Integrate with MegaETH-specific features
- Add more comprehensive error handling
- Implement user profile management

## Resources

- [Privy Documentation](https://docs.privy.io/)
- [MegaETH Documentation](https://docs.megaeth.systems/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)

## License

MIT License - see LICENSE file for details.
