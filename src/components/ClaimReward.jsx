"use client"

import { useEffect, useState } from "react"
import {
  sendTransaction,
  waitForBatchConfirmation,
} from "../utils/paymentService" // Make sure you're using custom wrapped functions
import {
  connectWallet,
  disconnetWallet,
  switchToBaseSepolia,
} from "../utils/walletServices"
import { checkPaymasterService } from "../utils/walletProvider"

const ClaimReward = () => {

  
    const [provider, setProvider] = useState(null);
    const [sdk, setSdk] = useState(null);
    const [status, setStatus] = useState('idle');
    const [batchId, setBatchId] = useState('');
    const [batchStatus, setBatchStatus] = useState(null);
    const [error, setError] = useState(null);
    const [walletConnected, setWalletConnected] = useState(false);
    const [userAddress, setUserAddress] = useState('');


  // ✅ Environment variables
  const contractAddress = import.meta.env.VITE_REWARDS_CONTRACT_ADDRESS
  const paymasterUrl = import.meta.env.VITE_PAYMASTER_SERVICE_URL

  // ✅ Connect wallet
  const handleConnectWallet = async () => {
    try {
      setStatus("connecting")
      setError(null)

      const result = await connectWallet() // fix: should call `connectWallet` not `walletConnected`

      if (!result || !result.address) {
        throw new Error("Failed to connect wallet")
      }

      const { address, provider: walletProvider, sdk: accountSdk } = result

      await switchToBaseSepolia(walletProvider)

      setProvider(walletProvider)
      setSdk(accountSdk)
      setUserAddress(address)
      setWalletConnected(true)
      setStatus("connected")
    } catch(err){
            setError(err.message || "Failed to claim reward");
            setStatus('error');
    }
  }

  // ✅ Disconnect wallet
  const handleDisconnectWallet = async () => {
    await disconnetWallet(sdk)
    setWalletConnected(false)
    setUserAddress("")
    setProvider(null)
    setSdk(null)
    setBatchId("")
    setBatchStatus(null)
    setStatus("idle")
    setError(null)
  }

  // ✅ Claim Reward logic
  const claimReward = async () => {
    try {
      if (!contractAddress || !paymasterUrl) {
        throw new Error("Configuration missing")
      }

      if (!walletConnected || !userAddress) {
        throw new Error("Please connect your wallet first")
      }

      setStatus("claiming")
      setError(null)
      setBatchId("")
      setBatchStatus(null)

      const isPaymasterConfigured = await checkPaymasterService(paymasterUrl, provider)
      if (!isPaymasterConfigured) {
        throw new Error("Paymaster service not configured properly")
      }

      const batchId = await sendTransaction(provider, userAddress, contractAddress, paymasterUrl)
      setBatchId(batchId)
      setStatus("claimed")

      if (batchId) {
        setStatus("confirming")
        const finalStatus = await waitForBatchConfirmation(provider, batchId)
        setBatchStatus(finalStatus)
        setStatus("confirmed")
      }
    } catch(err){
            setError(err.message || "Failed to claim reward");
            setStatus('error');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded-md">
      <h1 className="text-2xl font-bold mb-4">Claim Your Reward</h1>

      <div className="mb-4">
        {walletConnected ? (
          <div className="space-y-2">
            <p><strong>Wallet:</strong> {userAddress}</p>
            <button
              onClick={handleDisconnectWallet}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectWallet}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Connect Wallet
          </button>
        )}
      </div>

      <button
        onClick={claimReward}
        disabled={!walletConnected || status === "claiming" || status === "confirming"}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {status === "claiming" ? "Claiming..." : "Claim Reward"}
      </button>

      {/* Status Section */}
      <div className="mt-6 space-y-2 text-sm">
        <p><strong>Status:</strong> {status}</p>
        {batchId && <p><strong>Batch ID:</strong> {batchId}</p>}
        {batchStatus && <p><strong>Batch Status:</strong> {JSON.stringify(batchStatus)}</p>}
        {error && <p className="text-red-500"><strong>Error:</strong> {error}</p>}
      </div>
    </div>
  )
}

export default ClaimReward
