// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {StakingToken} from "./StakingToken.sol";

contract Staking {
    error Staking__StakingPeriodTooShort();
    error Staking__MustBeMoreThanZero();

    uint256 public constant MINIMUM_STAKING_PERIOD = 180 days;

    StakingToken public s_stakingToken;
    AggregatorV3Interface public s_priceFeed;

    constructor(address stakingTokenAddress_, address priceFeedAddress_) {
        s_stakingToken = StakingToken(stakingTokenAddress_);
        s_priceFeed = AggregatorV3Interface(priceFeedAddress_);
    }

    function stakeETH(uint256 stakingPeriod_) external payable {
        if (stakingPeriod_ < MINIMUM_STAKING_PERIOD) revert Staking__StakingPeriodTooShort();
        if (msg.value == 0) revert Staking__MustBeMoreThanZero();
    }

    function unStakeETH() external {}
}
