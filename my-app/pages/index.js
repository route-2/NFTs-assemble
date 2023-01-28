import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {
  const[walletConnected,setwalletConnected] = useState(false)
  const[presaleStarted,setpresaleStarted] = useState(false)
  const[presaleEnded,setpresaleEnded] = useState(false)
  const[loading,setLoading] = useState(false)
  const[isOwner,setisOwnder] = useState(false)
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  const web3modalRef = useRef()

  const presaleMint = async () =>
    {
      try {
        const signer = await getProviderOrSigner(true);
      const contract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      const tx = await contract.mint({ 
        value: utils.parseEther("0.1"),
      });
      setLoading(true);

      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a Dev!");

        
      } catch (error) {
        console.log(error)
        
      }
      
    }
    const publicMint = async () =>
    {
      try {

        const signer = await getProviderOrSigner(true);
      const contract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      const tx = await contract.mint(
        {
          value: utils.parseEther("0.1"),
        }
      );
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a Dev!");
      }
      catch (error) {
        console.log(error)

      }
      
    }

    const connectWallet = async() => {
      try{
        await getProviderOrSigner();
      setwalletConnected(true);


      }
      catch(error){
        console.log(error)
      }
    }

    const startPresale = async() => {
      try{
        const signer = await getProviderOrSigner(true);
      const contract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      const tx = await contract.startPresale();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      
      await checkIfpresaleStarted()
      }
      catch(error){
        console.log(error)
      }
    }

    const checkIfpresaleStarted = async () => {
      try{

        const provider = await getProviderOrSigner(true)
        const contract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

        const _presaleStarted = await contract.presaleStarted();

        if(!_presaleStarted)
        {
          await getOwner();

        }
        setpresaleStarted(_presaleStarted);
        return _presaleStarted;
  

      }
      catch(error){
        console.log(error)
        return false
      }

    }
const checkIfpresaleEnded = async() => {
  try{
    const provider = await getProviderOrSigner(true)
    const contract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

    const _presaleEnded = await contract.presaleEnded();
    //_presaleEnded timestamp is less than the current time
    const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
if(hasEnded)
{
  setpresaleEnded(true);
  
}
else{
  setpresaleEnded(false);
}


    return hasEnded;
  }
  catch(error){
    console.log(error)
    return false
  }
}


    const getOwner = async() => {
      try{
        const provider = await getProviderOrSigner(true)
        const contract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
        const _owner = await contract.owner();
        const signer = await getProviderOrSigner(true);
        const signerAddress = await signer.getAddress();
        if(address.toLowerCase() === _owner.toLowerCase())
        {

        setisOwnder(true)
        };
        return _owner;
      }
      catch(error){
        console.log(error)
        return false
      }
    }

    const getTokenIdMinted = async() => {
      try { 
      const provider = await getProviderOrSigner(true)

      const contract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const _tokenIdMinted = await contract.tokenIds();
      setTokenIdsMinted(_tokenIdMinted.toString());
      return _tokenIdMinted;
      }
      catch(error){
        console.log(error)
        return false
      }


    }
    const getProviderOrSigner = async (needSigner = false) => {
 
      const provider = await web3modalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);
  
      // If user is not connected to the Goerli network, let them know and throw an error
      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 5) {
        window.alert("Change the network to Goerli");
        throw new Error("Change network to Goerli");
      }
  
      if (needSigner) {
        const signer = web3Provider.getSigner();
        return signer;
      }
      return web3Provider;
    };

    useEffect(() => {
      web3modalRef.current = new Web3Modal({
        network: "goerli",
        cacheProvider: true,
      });

      
      
      const _presaleStarted = checkIfpresaleStarted();
      if (_presaleStarted) {
        checkIfpresaleEnded();
      }

      getTokenIdMinted();

      // Set an interval which gets called every 5 seconds to check presale has ended
      const presaleEndedInterval = setInterval(async function () {
        const _presaleStarted = await checkIfpresaleStarted();
        if (_presaleStarted) {
          const _presaleEnded = await checkIfpresaleEnded();
          if (_presaleEnded) {
            clearInterval(presaleEndedInterval);
          }
        }
      }, 5 * 1000);

      // set an interval to get the number of token Ids minted every 5 seconds
      setInterval(async function () {
        await getTokenIdMinted();
      }, 5 * 1000);


    },[walletConnected])
  
    const renderButton = () => {
      // If wallet is not connected, return a button which allows them to connect their wllet
      if (!walletConnected) {
        return (
          <button onClick={connectWallet} className={styles.button}>
            Connect your wallet
          </button>
        );
      }
  
      // If we are currently waiting for something, return a loading button
      if (loading) {
        return <button className={styles.button}>Loading...</button>;
      }
  
      // If connected user is the owner, and presale hasnt started yet, allow them to start the presale
      if (isOwner && !presaleStarted) {
        return (
          <button className={styles.button} onClick={startPresale}>
            Start Presale!
          </button>
        );
      }
  
      // If connected user is not the owner but presale hasn't started yet, tell them that
      if (!presaleStarted) {
        return (
          <div>
            <div className={styles.description}>Presale hasnt started!</div>
          </div>
        );
      }
  
      // If presale started, but hasn't ended yet, allow for minting during the presale period
      if (presaleStarted && !presaleEnded) {
        return (
          <div>
            <div className={styles.description}>
              Presale has started!!! If your address is whitelisted, Mint a 
              Dev 🥳
            </div>
            <button className={styles.button} onClick={presaleMint}>
              Presale Mint 🚀
            </button>
          </div>
        );
      }
  
      // If presale started and has ended, its time for public minting
      if (presaleStarted && presaleEnded) {
        return (
          <button className={styles.button} onClick={publicMint}>
            Public Mint 🚀
          </button>
        );
      }
    };
  


  return (

    
    <>
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/20 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by route-2
      </footer>
    </div>


    </>
  )
}