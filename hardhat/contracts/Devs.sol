// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";





contract Devs is ERC721Enumerable,Ownable {

    string _baseTokenURI;

    uint256 public _price = 0.01 ether;

    bool public _paused;

    uint256 public _maxMint = 20;

    uint256 public  tokenIds;

    IWhitelist  whitelist;

    bool public presaleStarted;
    uint256 public presaleEnded;

    
}