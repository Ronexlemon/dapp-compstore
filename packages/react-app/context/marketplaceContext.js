import { useCelo } from "@celo/react-celo";
import { newKitFromWeb3 } from "@celo/contractkit";
import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";
import { createContext } from "react";
import {
  ComputerMarketplaceAbi,
  ComputerMarketplaceContract,
  erc20Abi,
} from "./constants";

// Function to create contract when the seller or creator is passed in

//Create marketplace context
export const MarketplaceContext = createContext();

let provider;
let products = [];
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
const celoContractAddress = "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9";

export const MarketplaceProvider = ({ children }) => {
  const { address } = useCelo();

  const fetchContract = (signerOrProvider) =>
    new ethers.Contract(
      ComputerMarketplaceContract,
      ComputerMarketplaceAbi,
      signerOrProvider
    );

  const getProducts = async function () {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://alfajores-forno.celo-testnet.org"
    );
    const contract = fetchContract(provider);

    const _productsLength = await contract.getProductsLength();
    const _products = [];

    for (let i = 0; i < _productsLength; i++) {
      let _product = new Promise(async (resolve, reject) => {
        let p = await contract.readProduct(i);
        resolve({
          index: i,
          owner: p[0],
          computer_title: p[1],
          image_url: p[2],
          computer_specs: p[3],
          store_location: p[4],
          price: p[5],
          sold: p[6],
        });
      });
      _products.push(_product);
    }
    products = await Promise.all(_products);
    return products;
  };

  

  //define constants
 
 

  //define functions
  async function approvePrice(price) {
     if (!window.ethereum) {
       alert("Please install MetaMask to use this feature.");
       return;
     }

     await window.ethereum.enable();
     const provider = new ethers.providers.Web3Provider(window.ethereum);
     const signer = provider.getSigner();
     const celoContract = new ethers.Contract(
       celoContractAddress,
       erc20Abi,
       signer
     );

     const result = await celoContract.approve(
       ComputerMarketplaceContract, price,
       {
         from: await signer.getAddress(),
       }
     );
     return result;
  }

  async function buyProduct(index, price) {

     const contract = fetchContract(provider);

    try {
      const tx = await contract.buyProduct(index, {
        value: ethers.utils.formatEther(price.toString()),
      });
      await tx.wait();
      return true;
    } catch (error) {
      throw new Error(`Purchase failed: ${error.message}`);
    }
  }

  // define event handler
  async function handleClick(e) {
    if (!e.target.classList.contains("buyBtn")) return;

    const index = e.target.getAttribute("data-index");
    const product = products[index];

     if (!window.ethereum) {
       alert("Please install MetaMask to use this feature.");
       return;
     }

     await window.ethereum.enable();
     const provider = new ethers.providers.Web3Provider(window.ethereum);
     const signer = provider.getSigner();
     const contract = fetchContract(provider);

     const celoContract = new ethers.Contract(
       celoContractAddress,
       erc20Abi,
       signer
     );

    // prompt user to approve payment
    alert(`⌛ Waiting for payment approval for "${product.computer_title}"...`);
    try {
      await approvePrice(product.price);
    } catch (error) {
      alert(`⚠️ ${error.message}`);
      return;
    }

    // prompt user to confirm purchase
    const confirmMsg = `Are you sure you want to buy "${product.computer_title}" for ${product.price} CELO?`;
    if (!confirm(confirmMsg)) return;

    // process purchase
    alert(`⌛ Processing purchase for "${product.computer_title}"...`);
    try {
      await buyProduct(index, product.price);
      alert(`🎉 You successfully bought "${product.computer_title}".`);
      getProducts();
    } catch (error) {
      alert(`⚠️ ${error.message}`);
    }
  }

  // ----------------------------------------------------------------------------------------------
  // async function approvePrice(price) {
  //      await window.ethereum.enable();
  //      const provider = new ethers.providers.Web3Provider(window.ethereum);
  //      const signer = provider.getSigner();
  //      const celoContract = new ethers.Contract(
  //        celoContractAddress,
  //        erc20Abi,
  //        signer
  //      );
  //      const result = await celoContract.approve(
  //        ComputerMarketplaceContract, price,
  //        {
  //          from: await signer.getAddress(),
  //        }
  //      );
  //      return result;
  // }

  // const handleClick = async (e) => {
  //   if (e.target.className.includes("buyBtn")) {
  //     console.log(e.target.id);
  //     const index = e.target.getAttribute("data-index");
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner();
  //     const contract = fetchContract(provider);

  //     const celoContract = new ethers.Contract(
  //       celoContractAddress,
  //       erc20Abi,
  //       signer
  //     );

  //     alert(`⌛ Waiting for payment approval...`);
  //     try {
  //       console.log(products[index]);
  //       await approvePrice(products[index].price);
  //     } catch (error) {
  //       alert(`⚠️ Approval failed: ${error}.`);
  //     }

  //     alert(`⌛ Awaiting payment for "${products[index].computer_title}"...`);
  //     try {
  //       const tx = await contract.buyProduct(index, {
  //         value: ethers.utils.parseEther(products[index].price.toString()),
  //         from: await signer.getAddress(),
  //       });
  //       await tx.wait();
  //       alert(
  //         `🎉 You successfully bought "${products[index].computer_title}".`
  //       );
  //       getProducts();
  //     } catch (error) {
  //       alert(`⚠️ Transaction failed: ${error}.`);
  //     }
  //   }
  // };

  // ----------------------------------------------------------------------------------------------


  // const handleClick = async (e) => {
  //   if (e.target.classList.contains("buyBtn")) {
  //     console.log("buyBtn Clicked");
  //     const index = e.target.getAttribute("data-index");
  //     alert("⌛ Waiting for payment approval...");
  //     try {
  //       await approvePrice(products[index].price);
  //     } catch (error) {
  //       alert(`⚠️ ${error}.`);
  //     }
  //     alert(
  //       `⌛ Awaiting payment for "${products[index].computer_title}"...`
  //     );
  //     try {

  //       const provider = new ethers.providers.Web3Provider(window.ethereum);
  //        const contract = fetchContract(provider);
  //       const signer = provider.getSigner();
  //       const contractWithSigner = contract.connect(signer);
  //       const tx = await contractWithSigner.buyProduct(index, {
  //         value: ethers.utils.parseEther(products[index].price.toString()),
  //       });
  //       await tx.wait();
  //       alert(
  //         `🎉 You successfully bought "${products[index].computer_title}".`
  //       );
  //       // update products and balance
  //       getProducts();

  //     } catch (error) {
  //       alert(`⚠️ ${error}.`);
  //     }
  //   }
  // };

  return (
    <MarketplaceContext.Provider
      value={{
        getProducts,
        fetchContract,
        approvePrice,
        handleClick,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};
