// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {StakingToken} from "./StakingToken.sol";

contract Staking {
    error Staking__StakingPeriodTooShort();
    error Staking__MustBeMoreThanZero();

    event Staked(address indexed userAddress, uint256 indexed amountStaked, uint256 indexed stakingPeriod);

    uint256 public constant MINIMUM_STAKING_PERIOD = 180 days;

    StakingToken public s_stakingToken;
    AggregatorV3Interface public s_priceFeed;

    mapping(address => uint256) public s_stakedAmount;
    mapping(address => uint256) public s_stakingEndTime;

    constructor(address stakingTokenAddress_, address priceFeedAddress_) {
        s_stakingToken = StakingToken(stakingTokenAddress_);
        s_priceFeed = AggregatorV3Interface(priceFeedAddress_);
    }

    function stakeETH(uint256 stakingPeriod_) external payable {
        if (stakingPeriod_ < MINIMUM_STAKING_PERIOD) revert Staking__StakingPeriodTooShort();
        if (msg.value == 0) revert Staking__MustBeMoreThanZero();

        uint256 tokenAmount = _getTokenAmount(msg.value);

        s_stakedAmount[msg.sender] += msg.value;
        s_stakingEndTime[msg.sender] = block.timestamp + stakingPeriod_;

        s_stakingToken.mint(msg.sender, tokenAmount);
        emit Staked(msg.sender, msg.value, stakingPeriod_);
    }

    function unStakeETH() external {}

    function _getTokenAmount(uint256 amount_) internal view returns (uint256) {
        (, int256 price,,,) = s_priceFeed.latestRoundData();

        uint256 ethPriceUSD = uint256(price) * 1e10;
        return (amount_ * ethPriceUSD) / 1e18;
    }
}
