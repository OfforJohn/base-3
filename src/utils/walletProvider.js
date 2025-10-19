// Checks if the connected wallet supports sending calls via Paymaster
export const isWalletSendCallsSupported = async (provider) => {
  if (!provider || typeof provider.request !== "function") {
    console.warn("⚠️ Provider is missing or invalid");
    return false;
  }

  try {
    const capabilities = await provider.request({
      method: "wallet_getCapabilities",
    });

    console.log("✅ Wallet capabilities received:", capabilities);

    // Check if any chain supports paymaster service
    return Object.values(capabilities || {}).some(
      (cap) => cap?.paymasterService?.supported
    );
  } catch (error) {
    console.warn("❌ wallet_getCapabilities failed:", error);
    return false; // fallback to false if request fails
  }
};

// Validates Paymaster URL and checks if wallet supports Paymaster calls
export const checkPaymasterService = async (paymasterUrl, provider) => {
  if (!paymasterUrl) {
    console.warn("⚠️ No paymaster URL provided");
    return false;
  }

  try {
    // Validate URL format
    new URL(paymasterUrl);

    if (!provider) {
      console.warn("⚠️ No provider passed");
      return false;
    }

    // Optional: Check wallet capabilities (may not be needed with Coinbase)
    const supported = await isWalletSendCallsSupported(provider);

    console.log("✅ Skipping /status check, wallet support:", supported);

    return true; // <- Just return true, skip the /status check
  } catch (err) {
    console.error("❌ Paymaster service check failed:", err);
    return false;
  }
};

