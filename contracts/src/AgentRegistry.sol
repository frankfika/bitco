// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentRegistry is ERC721, Ownable {
    struct AgentInfo {
        string name;
        string endpoint;
        string specialty;
    }

    uint256 private _nextTokenId;
    mapping(uint256 => AgentInfo) public agents;

    constructor() ERC721("BitMind Agent", "AGENT") Ownable(msg.sender) {}

    function mintAgent(
        address to,
        string calldata name,
        string calldata endpoint,
        string calldata specialty
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = ++_nextTokenId;
        _mint(to, tokenId);
        agents[tokenId] = AgentInfo(name, endpoint, specialty);
        return tokenId;
    }

    function getAgent(uint256 tokenId) external view returns (AgentInfo memory) {
        _requireOwned(tokenId);
        return agents[tokenId];
    }

    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }
}
