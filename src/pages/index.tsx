import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount, useBalance, useChainId, useConnectorClient, useConfig, useConnect } from "wagmi";

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
                    🌐 Provider & Network Information
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
