// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract StakingToken is ERC20, Ownable {
    error StakingToken__MustBeMoreThanZero();

    constructor() ERC20("StakingToken", "STK") Ownable(msg.sender) {}

    function mint(address to_, uint256 amount_) external onlyOwner {
        if (amount_ == 0) revert StakingToken__MustBeMoreThanZero();
        _mint(to_, amount_);
    }

    function burn(address from_, uint256 amount_) external onlyOwner {
        if (amount_ == 0) revert StakingToken__MustBeMoreThanZero();
        _burn(from_, amount_);
    }
}
