// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {StakingToken} from "./StakingToken.sol";

contract Staking {
    StakingToken public s_stakingToken;
    AggregatorV3Interface public s_priceFeed;
}
