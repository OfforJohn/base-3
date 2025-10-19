import {createBaseAccountSDK, base} from "@base-org/account"
import {baseSepolia} from "viem/chains"


let sdkInstance = null
export const getBaseAccountSDK = () => {
    if(!sdkInstance){
        try{
        sdkInstance = createBaseAccountSDK({
            appName: "Paymaster Demo",
            appLogoUrl: "https://github.com/base/brand-kit/blob/main/logo/Logotype/Digital/Base_lockup_2color.svg",
            appChainIds: [base.constants.CHAIN_IDS.baseSepolia]

            
        })

    } catch(error){
        console.log(`Error setting up base account sdk : ${error}`)
    }

    }
    return sdkInstance;
}

export const isWalletAvailable = () => {
    try {
        return getBaseAccountSDK() !== null; 
    }  catch(error) {
        console.log(`Error: Cannot find SDK instance: ${error}`)
    }
}

export const connectWallet = async () =>{
    const sdk = getBaseAccountSDK();

    const provider = sdk.getProvider();

    if(!provider){
        throw new Error ("No Provider available from base account sdk")
    }

    const accounts = await provider.request({method: 'eth_requestAccounts'});

    if(!accounts || accounts.length ===0){
        throw new Error("No account returned");
    }
    return {
        address: accounts[0],
        provider,
        sdk

    }
}

export const switchToBaseSepolia = async (provider) => {
    try{
        if(provider){
            throw new Error("No Provider Available");
        }
        const chainId = await provider.request({method: "eth_chainId"});
        const currentChainId = parseInt(chainId,16);
        const targetChainId = baseSepolia.id;

        if(currentChainId === targetChainId){
            return true;
        }

        await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{chainId: `0x${targetChainId.toString(16)}`}]

        })
        return true;
    } catch(error){
        if(error.code === 4902){
            try{
                const rpcUrl = import.meta.env.VITE_RPC_URL;

                 await provider.request({
                    method: `wallet_addEthereumChain`,
                    params: [
                        {
                            chainId: `0x${baseSepolia.id.toString(16)}`,
                            chainName: 'Base Sepolia',
                            nativeCurrency: {
                                name: 'ETH',
                                symbol: 'ETH',
                                decimals: 18
                            },
                            rpcUrls: [rpcUrl],
                            blockExplorerUrls: ['https://sepolia.basescan.org']
                        },
                    ],
                 });
            } catch(error) {
                console.log(`Error switching chains ${error}`)
                return false
            }
        }
    }

}
export const disconnetWallet = async (sdk) => {
    try {
        if(sdk && typeof sdk.disconnet === 'function') {
            await sdk.disconnet();

        }
        return true;
    } catch (error){
        console.log(`Error disconnecting wallet : ${error}`)
        return false
    }
}