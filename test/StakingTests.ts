import { network, deployments, ethers } from "hardhat";
import { assert, expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

import { developmentChains } from "../utils/helperConfig";
import { MockV3Aggregator, Staking, StakingToken } from "../typechain-types";

const isDevelopmentChain = developmentChains.includes(network.name);

!isDevelopmentChain
  ? describe.skip
  : describe("Staking Unit Tests", () => {
      let accounts: HardhatEthersSigner[];
      let deployer: HardhatEthersSigner;

      let ethPriceFeedMock: MockV3Aggregator;
      let stakingToken: StakingToken;
      let staking: Staking;

      beforeEach(async () => {
        await deployments.fixture(["all"]);

        accounts = await ethers.getSigners();
        deployer = accounts[0];

        ethPriceFeedMock = await ethers.getContract("MockV3Aggregator");
        stakingToken = await ethers.getContract("StakingToken");
        staking = await ethers.getContract("Staking");

        stakingToken.transferOwnership(staking);
      });

      describe("StakingToken", () => {
        it("constructor() Initializes correctly", async () => {
          const ST_NAME = await stakingToken.name();
          const ST_SYMBOL = await stakingToken.symbol();
          const OWNER = await stakingToken.owner();
          assert.equal(ST_NAME, "StakingToken");
          assert.equal(ST_SYMBOL, "STK");
          assert.equal(OWNER, await staking.getAddress());
        });

        it("mint() Reverts when not using Owner account", async () => {
          await expect(
            stakingToken.mint(deployer, 123)
          ).to.be.revertedWithCustomError(
            stakingToken,
            "OwnableUnauthorizedAccount"
          );
        });

        it("burn() Reverts when not using Owner account", async () => {
          await expect(
            stakingToken.burn(deployer, 0)
          ).to.be.revertedWithCustomError(
            stakingToken,
            "OwnableUnauthorizedAccount"
          );
        });
      });
    });

