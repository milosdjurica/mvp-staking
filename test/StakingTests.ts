import { network, deployments, ethers } from "hardhat";
import { assert, expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

import {
  AMOUNT_TO_STAKE,
  developmentChains,
  ETH_USD_PRICE,
  MINIMUM_STAKING_PERIOD,
  PRECISION_18,
} from "../utils/helperConfig";
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
          await expect(
            staking.stakeETH(MINIMUM_STAKING_PERIOD + 1)
          ).to.be.revertedWithCustomError(
            staking,
            "Staking__AmountMustBeMoreThanZero"
          );
        });

        it("stakeETH() Stakes successfully and changes state variables", async () => {
          await staking.stakeETH(MINIMUM_STAKING_PERIOD + 1, {
            value: AMOUNT_TO_STAKE,
          });

          const stakedAmount = await staking.s_stakedAmount(deployer);
          const stakingEndTime = await staking.s_stakingEndTime(deployer);
          const latestBlockTimeStamp = (await ethers.provider.getBlock(
            "latest"
          ))!!!!!.timestamp;

          assert.equal(AMOUNT_TO_STAKE, stakedAmount);
          assert.equal(
            stakingEndTime,
            BigInt(MINIMUM_STAKING_PERIOD + 1 + latestBlockTimeStamp)
          );
        });

        it("stakeETH() Stakes successfully and mints and emits event", async () => {
          await expect(
            staking.stakeETH(MINIMUM_STAKING_PERIOD + 1, {
              value: AMOUNT_TO_STAKE,
            })
          )
            .to.emit(staking, "Staked")
            .withArgs(
              deployer.address,
              AMOUNT_TO_STAKE,
              MINIMUM_STAKING_PERIOD + 1
            );

          const tokensOwned = await stakingToken.balanceOf(deployer);
          assert.equal(Number(tokensOwned) / 1e18, ETH_USD_PRICE);
        });

        it("unstakeETH() Reverts if NotEnoughTimePassed", async () => {
          const AMOUNT_TO_STAKE = ethers.parseEther("1");
          await staking.stakeETH(MINIMUM_STAKING_PERIOD + 1, {
            value: AMOUNT_TO_STAKE,
          });

          await expect(staking.unstakeETH()).to.be.revertedWithCustomError(
            staking,
            "Staking__NotEnoughTimePassed"
          );
        });

        it("unstakeETH() Reverts if user didn't previously staked", async () => {
          await expect(staking.unstakeETH()).to.be.revertedWithCustomError(
            staking,
            "Staking__AmountMustBeMoreThanZero"
          );
        });

        it("unstakeETH() Unstakes successfully", async () => {
          const deployerBalanceBefore = await ethers.provider.getBalance(
            deployer
          );

          await staking.stakeETH(MINIMUM_STAKING_PERIOD + 1, {
            value: AMOUNT_TO_STAKE,
          });

          await ethers.provider.send("evm_increaseTime", [
            MINIMUM_STAKING_PERIOD + 2,
          ]);
          await ethers.provider.send("evm_mine", []);

          await expect(staking.unstakeETH())
            .to.emit(staking, "Unstaked")
            .withArgs(deployer);

          const stakedAmount = await staking.s_stakedAmount(deployer);
          const stakingEndTime = await staking.s_stakingEndTime(deployer);
          const tokensOwned = await stakingToken.balanceOf(deployer);

          assert.equal(stakedAmount, BigInt(0));
          assert.equal(stakingEndTime, BigInt(0));
          assert.equal(tokensOwned, BigInt(0));

          const deployerBalanceAfter = await ethers.provider.getBalance(
            deployer
          );
          expect(deployerBalanceAfter).to.be.closeTo(
            deployerBalanceBefore,
            ethers.parseEther("0.0001") // Gas used
          );
        });
      });
    });
