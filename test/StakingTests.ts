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

      describe("StakingToken Contract", () => {
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
            stakingToken.burn(deployer, 123)
          ).to.be.revertedWithCustomError(
            stakingToken,
            "OwnableUnauthorizedAccount"
          );
        });
      });

      describe("Staking Contract", () => {
        it("constructor() initializes correctly", async () => {
          assert(
            await staking.s_stakingToken(),
            await stakingToken.getAddress()
          );
          assert(
            await staking.s_priceFeed(),
            await ethPriceFeedMock.getAddress()
          );
        });

        it("stakeETH() Reverts if period less than minimum", async () => {
          await expect(staking.stakeETH(1)).to.be.revertedWithCustomError(
            staking,
            "Staking__StakingPeriodTooShort"
          );
        });

        it("stakeETH() Reverts if msg.value is 0", async () => {
          const MINIMUM = await staking.MINIMUM_STAKING_PERIOD();
          console.log(MINIMUM);
          await expect(
            staking.stakeETH(Number(MINIMUM) + 1)
          ).to.be.revertedWithCustomError(
            staking,
            "Staking__MustBeMoreThanZero"
          );
        });
      });
    });

