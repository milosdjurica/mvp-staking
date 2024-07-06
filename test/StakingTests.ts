import { network, deployments, ethers } from "hardhat";
import { assert } from "chai";

import { developmentChains } from "../utils/helperConfig";
import { MockV3Aggregator, Staking, StakingToken } from "../typechain-types";

const isDevelopmentChain = developmentChains.includes(network.name);

!isDevelopmentChain
  ? describe.skip
  : describe("Staking Unit Tests", () => {
      let ethPriceFeedMock: MockV3Aggregator;
      let stakingToken: StakingToken;
      let staking: Staking;

      beforeEach(async () => {
        await deployments.fixture(["all"]);

        ethPriceFeedMock = await ethers.getContract("MockV3Aggregator");
        stakingToken = await ethers.getContract("StakingToken");
        staking = await ethers.getContract("Staking");
      });

      describe("StakingToken", () => {
        it("Initializes correctly", async () => {
          const ST_NAME = await stakingToken.name();
          const ST_SYMBOL = await stakingToken.symbol();
          const OWNER = await stakingToken.owner();
          assert.equal(ST_NAME, "StakingToken");
          assert.equal(ST_SYMBOL, "STK");
          assert.equal(OWNER, await staking.getAddress());
        });
      });
    });

