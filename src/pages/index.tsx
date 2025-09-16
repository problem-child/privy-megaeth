import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount, useBalance, useChainId, useConnectorClient, useConfig, useConnect } from "wagmi";
import { useState } from "react";
import { ethers } from "ethers";
import { buyShares, sellShares, TransactionMethod, getMethodDisplayName, getMethodDescription } from "../utils/unifiedContract";

export default function Home() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { data: balance } = useBalance({
    address,
  });
  const { data: connectorClient } = useConnectorClient();
  const config = useConfig();
  const { connectors, connect } = useConnect();

  // BuyShares form state
  const [playerId, setPlayerId] = useState('');
  const [shareAmount, setShareAmount] = useState('');
  const [ethValue, setEthValue] = useState('');
  const [buyMethod, setBuyMethod] = useState<TransactionMethod>('contract');
  const [isLoading, setIsLoading] = useState(false);
  const [txResult, setTxResult] = useState<{success: boolean, txHash?: string, error?: string, method?: string} | null>(null);

  // SellShares form state
  const [sellPlayerId, setSellPlayerId] = useState('');
  const [sellShareAmount, setSellShareAmount] = useState('');
  const [sellMethod, setSellMethod] = useState<TransactionMethod>('contract');
  const [isSellLoading, setIsSellLoading] = useState(false);
  const [sellTxResult, setSellTxResult] = useState<{success: boolean, txHash?: string, error?: string, method?: string} | null>(null);

  // Handle faucet request - simplified to just open the URL
  const handleFaucetRequest = () => {
    window.open('https://testnet.megaeth.com/?faucet=true', '_blank');
  };

  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);

  // Get current chain info
  const currentChain = config.chains.find(chain => chain.id === chainId);

  // Get provider info
  const providerInfo = {
    chainId,
    isConnected,
    connectorName: connector?.name,
    connectorId: connector?.id,
    connectorType: connector?.type,
    currentChain: currentChain?.name,
    rpcUrl: currentChain?.rpcUrls?.default?.http?.[0],
    blockExplorer: currentChain?.blockExplorers?.default?.url,
    nativeCurrency: currentChain?.nativeCurrency,
  };

  // Get Twitter account if linked
  const twitterAccount = user?.linkedAccounts?.find(
    (account) => account.type === "twitter_oauth"
  );

  // Get Discord account if linked
  const discordAccount = user?.linkedAccounts?.find(
    (account) => account.type === "discord_oauth"
  );

  // Get Google account if linked
  const googleAccount = user?.linkedAccounts?.find(
    (account) => account.type === "google_oauth"
  );

  // Handle buyShares transaction
  const handleBuyShares = async () => {
    if (!playerId || !shareAmount || !ethValue) {
      setTxResult({ success: false, error: 'Please fill in all fields' });
      return;
    }

    // For Privy method, we need the user's address, for others we need connector client
    if (buyMethod === 'privy' && !address) {
      setTxResult({ success: false, error: 'User address not available for Privy method' });
      return;
    } else if (buyMethod !== 'privy' && !connectorClient) {
      setTxResult({ success: false, error: 'Please fill in all fields' });
      return;
    }

    setIsLoading(true);
    setTxResult(null);

    try {
      if (buyMethod === 'privy') {
        // Use Privy method with user address
        const result = await buyShares(
          address as `0x${string}`,
          parseInt(playerId),
          parseInt(shareAmount),
          ethValue,
          buyMethod
        );
        setTxResult(result);
      } else {
        // Use traditional methods with ethers signer
        if (!connectorClient) {
          throw new Error('Connector client not available');
        }
        const ethersProvider = new ethers.BrowserProvider(connectorClient.transport);
        const signer = await ethersProvider.getSigner();

        const result = await buyShares(
          signer,
          parseInt(playerId),
          parseInt(shareAmount),
          ethValue,
          buyMethod
        );

        setTxResult(result);
      }
    } catch (error) {
      setTxResult({
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
        method: buyMethod
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sellShares transaction
  const handleSellShares = async () => {
    if (!sellPlayerId || !sellShareAmount) {
      setSellTxResult({ success: false, error: 'Please fill in all fields' });
      return;
    }

    // For Privy method, we need the user's address, for others we need connector client
    if (sellMethod === 'privy' && !address) {
      setSellTxResult({ success: false, error: 'User address not available for Privy method' });
      return;
    } else if (sellMethod !== 'privy' && !connectorClient) {
      setSellTxResult({ success: false, error: 'Please fill in all fields' });
      return;
    }

    setIsSellLoading(true);
    setSellTxResult(null);

    try {
      if (sellMethod === 'privy') {
        // Use Privy method with user address
        const result = await sellShares(
          address as `0x${string}`,
          parseInt(sellPlayerId),
          parseInt(sellShareAmount),
          sellMethod
        );
        setSellTxResult(result);
      } else {
        // Use traditional methods with ethers signer
        if (!connectorClient) {
          throw new Error('Connector client not available');
        }
        const ethersProvider = new ethers.BrowserProvider(connectorClient.transport);
        const signer = await ethersProvider.getSigner();

        const result = await sellShares(
          signer,
          parseInt(sellPlayerId),
          parseInt(sellShareAmount),
          sellMethod
        );

        setSellTxResult(result);
      }
    } catch (error) {
      setSellTxResult({
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
        method: sellMethod
      });
    } finally {
      setIsSellLoading(false);
    }
  };;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Privy + MegaETH Demo
            </h1>
            <p className="text-gray-600">
              Complete wallet and user information dashboard
            </p>
          </div>

          {ready && authenticated ? (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Provider Information Section - NEW */}
              <div className="md:col-span-2 mb-6">
                <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                  <h2 className="text-lg font-semibold text-orange-800 mb-3">
                    ������ Provider & Network Information
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-orange-700">Connection Status:</span>
                        <p className="text-orange-600">
                          {isConnected ? '✅ Connected' : '❌ Disconnected'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-orange-700">Current Chain:</span>
                        <p className="text-orange-600">
                          {providerInfo.currentChain} ({chainId})
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-orange-700">Connector:</span>
                        <p className="text-orange-600">
                          {providerInfo.connectorName || 'None'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-orange-700">RPC Endpoint:</span>
                        <p className="text-orange-600 break-all font-mono text-xs">
                          {providerInfo.rpcUrl || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-orange-700">Block Explorer:</span>
                        {providerInfo.blockExplorer ? (
                          <a
                            href={providerInfo.blockExplorer}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-600 hover:text-orange-800 underline break-all"
                          >
                            {providerInfo.blockExplorer}
                          </a>
                        ) : (
                          <p className="text-orange-600">N/A</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-orange-700">Native Currency:</span>
                        <p className="text-orange-600">
                          {providerInfo.nativeCurrency?.symbol} ({providerInfo.nativeCurrency?.name})
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-orange-700">Decimals:</span>
                        <p className="text-orange-600">
                          {providerInfo.nativeCurrency?.decimals}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-orange-700">Available Connectors:</span>
                        <p className="text-orange-600">
                          {connectors.length} configured
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Connector Information */}
                  {connector && (
                    <div className="mt-4 p-3 bg-orange-100 rounded">
                      <h4 className="font-medium text-orange-800 mb-2">Active Connector Details</h4>
                      <div className="grid gap-2 md:grid-cols-2 text-sm">
                        <div>
                          <span className="font-medium text-orange-700">ID:</span>
                          <span className="text-orange-600 ml-2">{connector.id}</span>
                        </div>
                        <div>
                          <span className="font-medium text-orange-700">Type:</span>
                          <span className="text-orange-600 ml-2">{connector.type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-orange-700">Name:</span>
                          <span className="text-orange-600 ml-2">{connector.name}</span>
                        </div>
                        <div>
                          <span className="font-medium text-orange-700">UID:</span>
                          <span className="text-orange-600 ml-2 font-mono text-xs">{connector.uid}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Available Connectors */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-orange-700 hover:text-orange-900">
                      🔌 View All Available Connectors
                    </summary>
                    <div className="mt-2 p-3 bg-orange-100 rounded">
                      {connectors.map((conn, index) => (
                        <div key={index} className="mb-2 p-2 bg-white rounded text-sm">
                          <div className="font-medium text-orange-800">{conn.name}</div>
                          <div className="text-orange-600 text-xs">
                            ID: {conn.id} | Type: {conn.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>

              {/* BuyShares Section - Updated with Method Selection */}
              <div className="md:col-span-2 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h2 className="text-lg font-semibold text-green-800 mb-3">
                    🛒 Buy Shares - Choose Your Method
                  </h2>
                  <p className="text-green-600 text-sm mb-4">
                    Choose between contract calls, raw transactions, realtime API, or Privy wallet integration for buying shares
                  </p>

                  {/* Method Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-green-800 mb-3">
                      Transaction Method
                    </label>
                    <div className="grid gap-3 md:grid-cols-4">
                      <label className="flex items-center p-3 border-2 border-green-300 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                        <input
                          type="radio"
                          name="buyMethod"
                          value="contract"
                          checked={buyMethod === 'contract'}
                          onChange={(e) => setBuyMethod(e.target.value as TransactionMethod)}
                          className="mr-3 text-green-600"
                        />
                        <div>
                          <div className="font-medium text-green-800">Contract Call</div>
                          <div className="text-sm text-green-600">Uses ethers.js contract abstraction</div>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border-2 border-green-300 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                        <input
                          type="radio"
                          name="buyMethod"
                          value="raw"
                          checked={buyMethod === 'raw'}
                          onChange={(e) => setBuyMethod(e.target.value as TransactionMethod)}
                          className="mr-3 text-green-600"
                        />
                        <div>
                          <div className="font-medium text-green-800">Raw Transaction</div>
                          <div className="text-sm text-green-600">Sign and broadcast raw transaction</div>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border-2 border-green-300 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                        <input
                          type="radio"
                          name="buyMethod"
                          value="realtime"
                          checked={buyMethod === 'realtime'}
                          onChange={(e) => setBuyMethod(e.target.value as TransactionMethod)}
                          className="mr-3 text-green-600"
                        />
                        <div>
                          <div className="font-medium text-green-800">⚡ Realtime</div>
                          <div className="text-sm text-green-600">Ultra-fast MegaETH realtime API</div>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border-2 border-green-300 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                        <input
                          type="radio"
                          name="buyMethod"
                          value="privy"
                          checked={buyMethod === 'privy'}
                          onChange={(e) => setBuyMethod(e.target.value as TransactionMethod)}
                          className="mr-3 text-green-600"
                        />
                        <div>
                          <div className="font-medium text-green-800">🔐 Privy Wallet</div>
                          <div className="text-sm text-green-600">Uses Privy wallet integration</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-green-800 mb-2">
                        Player ID
                      </label>
                      <input
                        type="number"
                        value={playerId}
                        onChange={(e) => setPlayerId(e.target.value)}
                        placeholder="e.g., 1"
                        className="w-full px-4 py-3 bg-white border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 font-medium transition duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-green-800 mb-2">
                        Share Amount
                      </label>
                      <input
                        type="number"
                        value={shareAmount}
                        onChange={(e) => setShareAmount(e.target.value)}
                        placeholder="e.g., 100"
                        className="w-full px-4 py-3 bg-white border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 font-medium transition duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-green-800 mb-2">
                        ETH Value
                      </label>
                      <input
                        type="text"
                        value={ethValue}
                        onChange={(e) => setEthValue(e.target.value)}
                        placeholder="e.g., 0.01"
                        className="w-full px-4 py-3 bg-white border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 font-medium transition duration-200"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleBuyShares}
                    disabled={isLoading || (buyMethod !== 'privy' && !isConnected)}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded transition duration-200"
                  >
                    {isLoading ? '⏳ Processing...' : `🛒 Buy Shares via ${getMethodDisplayName(buyMethod)}`}
                  </button>

                  {/* Transaction Result */}
                  {txResult && (
                    <div className={`mt-4 p-3 rounded ${txResult.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
                      {txResult.success ? (
                        <div>
                          <p className="text-green-800 font-medium">✅ Transaction Successful!</p>
                          <p className="text-green-700 text-sm">Method: {getMethodDisplayName(txResult.method as TransactionMethod)}</p>
                          {txResult.txHash && (
                            <p className="text-green-700 text-sm mt-1">
                              TX Hash:{' '}
                              <a
                                href={`https://web3.okx.com/explorer/megaeth-testnet/tx/${txResult.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-green-600 hover:text-green-800 underline break-all"
                              >
                                {txResult.txHash}
                              </a>
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-red-800 font-medium">❌ Transaction Failed</p>
                          <p className="text-red-700 text-sm">Method: {getMethodDisplayName(txResult.method as TransactionMethod)}</p>
                          <p className="text-red-700 text-sm mt-1">{txResult.error}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {((buyMethod !== 'privy' && !isConnected) || (buyMethod === 'privy' && !address)) && (
                    <p className="text-yellow-600 text-sm mt-2">
                      ⚠️ {buyMethod === 'privy' ? 'Please connect your Privy wallet' : 'Please connect your wallet'} to use this feature
                    </p>
                  )}
                </div>
              </div>

              {/* SellShares Section - Updated with Method Selection */}
              <div className="md:col-span-2 mb-6">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <h2 className="text-lg font-semibold text-red-800 mb-3">
                    💸 Sell Shares - Choose Your Method
                  </h2>
                  <p className="text-red-600 text-sm mb-4">
                    Choose between contract calls, raw transactions, realtime API, or Privy wallet integration for selling shares
                  </p>

                  {/* Method Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-red-800 mb-3">
                      Transaction Method
                    </label>
                    <div className="grid gap-3 md:grid-cols-4">
                      <label className="flex items-center p-3 border-2 border-red-300 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
                        <input
                          type="radio"
                          name="sellMethod"
                          value="contract"
                          checked={sellMethod === 'contract'}
                          onChange={(e) => setSellMethod(e.target.value as TransactionMethod)}
                          className="mr-3 text-red-600"
                        />
                        <div>
                          <div className="font-medium text-red-800">Contract Call</div>
                          <div className="text-sm text-red-600">Uses ethers.js contract abstraction</div>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border-2 border-red-300 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
                        <input
                          type="radio"
                          name="sellMethod"
                          value="raw"
                          checked={sellMethod === 'raw'}
                          onChange={(e) => setSellMethod(e.target.value as TransactionMethod)}
                          className="mr-3 text-red-600"
                        />
                        <div>
                          <div className="font-medium text-red-800">Raw Transaction</div>
                          <div className="text-sm text-red-600">Sign and broadcast raw transaction</div>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border-2 border-red-300 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
                        <input
                          type="radio"
                          name="sellMethod"
                          value="realtime"
                          checked={sellMethod === 'realtime'}
                          onChange={(e) => setSellMethod(e.target.value as TransactionMethod)}
                          className="mr-3 text-red-600"
                        />
                        <div>
                          <div className="font-medium text-red-800">⚡ Realtime</div>
                          <div className="text-sm text-red-600">Ultra-fast MegaETH realtime API</div>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border-2 border-red-300 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
                        <input
                          type="radio"
                          name="sellMethod"
                          value="privy"
                          checked={sellMethod === 'privy'}
                          onChange={(e) => setSellMethod(e.target.value as TransactionMethod)}
                          className="mr-3 text-red-600"
                        />
                        <div>
                          <div className="font-medium text-red-800">🔐 Privy Wallet</div>
                          <div className="text-sm text-red-600">Uses Privy wallet integration</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-red-800 mb-2">
                        Player ID
                      </label>
                      <input
                        type="number"
                        value={sellPlayerId}
                        onChange={(e) => setSellPlayerId(e.target.value)}
                        placeholder="e.g., 1"
                        className="w-full px-4 py-3 bg-white border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500 font-medium transition duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-red-800 mb-2">
                        Share Amount
                      </label>
                      <input
                        type="number"
                        value={sellShareAmount}
                        onChange={(e) => setSellShareAmount(e.target.value)}
                        placeholder="e.g., 50"
                        className="w-full px-4 py-3 bg-white border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 placeholder-gray-500 font-medium transition duration-200"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSellShares}
                    disabled={isSellLoading || (sellMethod !== 'privy' && !isConnected)}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded transition duration-200"
                  >
                    {isSellLoading ? '⏳ Processing...' : `💸 Sell Shares via ${getMethodDisplayName(sellMethod)}`}
                  </button>

                  {/* Sell Transaction Result */}
                  {sellTxResult && (
                    <div className={`mt-4 p-3 rounded ${sellTxResult.success ? 'bg-red-100 border border-red-300' : 'bg-red-100 border border-red-300'}`}>
                      {sellTxResult.success ? (
                        <div>
                          <p className="text-red-800 font-medium">✅ Sell Transaction Successful!</p>
                          <p className="text-red-700 text-sm">Method: {getMethodDisplayName(sellTxResult.method as TransactionMethod)}</p>
                          {sellTxResult.txHash && (
                            <p className="text-red-700 text-sm mt-1">
                              TX Hash:{' '}
                              <a
                                href={`https://web3.okx.com/explorer/megaeth-testnet/tx/${sellTxResult.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-red-600 hover:text-red-800 underline break-all"
                              >
                                {sellTxResult.txHash}
                              </a>
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-red-800 font-medium">❌ Sell Transaction Failed</p>
                          <p className="text-red-700 text-sm">Method: {getMethodDisplayName(sellTxResult.method as TransactionMethod)}</p>
                          <p className="text-red-700 text-sm mt-1">{sellTxResult.error}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {((sellMethod !== 'privy' && !isConnected) || (sellMethod === 'privy' && !address)) && (
                    <p className="text-yellow-600 text-sm mt-2">
                      ⚠️ {sellMethod === 'privy' ? 'Please connect your Privy wallet' : 'Please connect your wallet'} to use this feature
                    </p>
                  )}
                </div>
              </div>

              {/* User Information Section */}
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h2 className="text-lg font-semibold text-green-800 mb-3">
                    👤 User Information
                  </h2>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-green-700">User ID:</span>
                      <p className="text-green-600 break-all">{user?.id}</p>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Email:</span>
                      <p className="text-green-600">
                        {user?.email?.address || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Created:</span>
                      <p className="text-green-600">
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Accounts Section */}
                {(twitterAccount || discordAccount || googleAccount) && (
                  <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                    <h3 className="text-lg font-semibold text-purple-800 mb-3">
                      🔗 Linked Social Accounts
                    </h3>
                    <div className="space-y-2 text-sm">
                      {twitterAccount && (
                        <div>
                          <span className="font-medium text-purple-700">
                            {" "}
                            🐦 Twitter:
                          </span>
                          <p className="text-purple-600">
                            @{twitterAccount.username}
                          </p>
                          {twitterAccount.name && (
                            <p className="text-purple-600 text-xs">
                              {twitterAccount.name}
                            </p>
                          )}
                        </div>
                      )}
                      {discordAccount && (
                        <div>
                          <span className="font-medium text-purple-700">
                            {" "}
                            💬 Discord:
                          </span>
                          <p className="text-purple-600">
                            {discordAccount.username}
                          </p>
                        </div>
                      )}
                      {googleAccount && (
                        <div>
                          <span className="font-medium text-purple-700">
                            {" "}
                            📧 Google:
                          </span>
                          <p className="text-purple-600">
                            {googleAccount.email}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Wallet Information Section */}
              <div className="space-y-4">
                {address && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-3">
                      💰 Active Wallet
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-blue-700">Address:</span>
                        <p className="text-blue-600 break-all font-mono text-xs bg-blue-100 p-2 rounded mt-1">
                          {address}
                        </p>
                        {providerInfo.blockExplorer && (
                          <a
                            href={`${providerInfo.blockExplorer}/address/${address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 underline text-xs"
                          >
                            🔍 View on Explorer
                          </a>
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Network:</span>
                        <p className="text-blue-600">
                          {providerInfo.currentChain} (Chain ID: {chainId})
                        </p>
                      </div>
                      {balance !== undefined && (
                        <>
                          <div>
                            <span className="font-medium text-blue-700">
                              Balance:
                            </span>
                            <p className="text-blue-600 font-mono">
                              {parseFloat(balance.formatted).toFixed(6)} {providerInfo.nativeCurrency?.symbol}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-blue-700">
                              Balance (Wei):
                            </span>
                            <p className="text-blue-600 font-mono text-xs break-all">
                              {balance.value.toString()}
                            </p>
                          </div>
                        </>
                      )}

                      {/* Faucet Section */}
                      {(chainId === 6342 || chainId === 70700) && (
                        <div className="mt-4 pt-3 border-t border-blue-200">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-blue-700">💧 Testnet Faucet:</span>
                              <button
                                onClick={handleFaucetRequest}
                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded transition duration-200"
                              >
                                🌐 Open Faucet
                              </button>
                            </div>

                            <p className="text-blue-500 text-xs">
                              Click to open the MegaETH testnet faucet in a new tab
                            </p>

                            {/* Debug info to help see current chain ID */}
                            <p className="text-gray-400 text-xs">
                              Current Chain ID: {chainId}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* All Connected Wallets */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
                  <h3 className="text-lg font-semibold text-indigo-800 mb-3">
                    🔐 All Connected Wallets ({wallets.length})
                  </h3>
                  <div className="space-y-3">
                    {wallets.map((wallet, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded border border-indigo-100"
                      >
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-indigo-700">Type:</span>
                            <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                              {wallet.walletClientType}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-indigo-700">
                              Address:
                            </span>
                            <p className="text-indigo-600 break-all font-mono text-xs bg-indigo-50 p-2 rounded mt-1">
                              {wallet.address}
                            </p>
                          </div>
                          {wallet.chainId && (
                            <div>
                              <span className="font-medium text-indigo-700">
                                Chain ID:
                              </span>
                              <p className="text-indigo-600">{wallet.chainId}</p>
                            </div>
                          )}
                          {wallet.connectorType && (
                            <div>
                              <span className="font-medium text-indigo-700">
                                Connector:
                              </span>
                              <p className="text-indigo-600">
                                {wallet.connectorType}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional User Details */}
              <div className="md:col-span-2">
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    📊 Additional Information
                  </h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">
                        Total Linked Accounts:
                      </span>
                      <p className="text-gray-600">
                        {user?.linkedAccounts?.length || 0}
                      </p>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">
                        Email Verified:
                      </span>
                      <p className="text-gray-600">
                        {user?.email?.address ? "✅ Yes" : "❌ No"}
                      </p>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">MFA Enabled:</span>
                      <p className="text-gray-600">
                        {user?.mfaMethods && user.mfaMethods.length > 0
                          ? "✅ Yes"
                          : "❌ No"}
                      </p>
                    </div>
                  </div>

                  {/* Raw User Object (for debugging) */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                      🔍 View Raw User Data (Debug)
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(user, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>

              {/* Logout Button */}
              <div className="md:col-span-2">
                <button
                  onClick={logout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition duration-200"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-6">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">
                  🚀 Get Started with MegaETH
                </h2>
                <p className="text-blue-600 mb-4">
                  Connect your wallet or create an embedded wallet to get started
                  on MegaETH. You can authenticate with:
                </p>
                <div className="flex justify-center space-x-4 text-sm text-blue-600">
                  <span>📧 Email</span>
                  <span>🔗 Wallet</span>
                  <span>🐦 Twitter</span>
                </div>
              </div>
              <button
                disabled={disableLogin}
                onClick={login}
                className="w-full max-w-md mx-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded transition duration-200"
              >
                {!ready ? "⏳ Loading..." : "🔐 Login / Sign Up"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
