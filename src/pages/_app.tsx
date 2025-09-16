import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useState } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/config/wagmi";
import { megaeth } from "@/config/chains";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  const [showWalletUIs, setShowWalletUIs] = useState(true);

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      debug={true}
      config={{
        // Display email, wallet, and Twitter as login methods
        loginMethods: ["email", "wallet", "twitter"],
        // Customize Privy's appearance in your app
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          logo: "https://your-logo-url.com/logo.png", // Replace with your logo
        },
        // @ts-ignore
        loginUIConfig: { debug: true },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          showWalletUIs: showWalletUIs,
        },
        // Configure the default chain for embedded wallets
        defaultChain: megaeth,
        // Configure supported chains
        supportedChains: [megaeth],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <div style={{ padding: '10px' }}>
            <button onClick={() => setShowWalletUIs(!showWalletUIs)}>
              {showWalletUIs ? 'Hide' : 'Show'} Wallet UIs
            </button>
          </div>
          <Component {...pageProps} />
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
