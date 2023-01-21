const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require("../constants/index");


async function main() {

 const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  // URL from where we can extract the metadata for a  Dev NFT
  const metadataURL = METADATA_URL;
  // A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  //so DevsContract here is a factory for instances of our Devs contract.
  
  const DevsContract = await ethers.getContractFactory("Devs");

  const deployedCryptoDevsContract = await DevsContract.deploy(
    metadataURL,
    whitelistContract
  );
  await deployedCryptoDevsContract.deployed();

  console.log("Devs contract deployed to:", deployedCryptoDevsContract.address);


}

main().then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});