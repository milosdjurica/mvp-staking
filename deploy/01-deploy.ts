import { Address, DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  developmentChains,
  SEPOLIA_PRICE_FEED_ADDRESS,
} from "../utils/helperConfig";
import { StakingToken } from "../typechain-types";
import { verify } from "../utils/verify";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, ethers, deployments, network } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  const IS_DEV_CHAIN = developmentChains.includes(network.name);

  let priceFeedAddress: Address;

  if (IS_DEV_CHAIN) {
    priceFeedAddress = await (
      await ethers.getContract("MockV3Aggregator")
    ).getAddress();
  } else {
    priceFeedAddress = SEPOLIA_PRICE_FEED_ADDRESS;
  }

  const stakingTokenDeploy = await deploy("StakingToken", {
    from: deployer,
    args: [],
    log: true,
  });

  const STAKING_CONSTRUCTOR_ARGS = [
    stakingTokenDeploy.address,
    priceFeedAddress!!!!!,
  ];

  const stakingDeploy = await deploy("Staking", {
    from: deployer,
    args: STAKING_CONSTRUCTOR_ARGS,
    log: true,
  });

  const stakingToken: StakingToken = await ethers.getContract(
    "StakingToken",
    deployer
  );

  if (!IS_DEV_CHAIN && process.env.ETHERSCAN_API_KEY) {
    log("Verifying contracts....");
    await verify(stakingTokenDeploy.address, []);
    await verify(stakingDeploy.address, STAKING_CONSTRUCTOR_ARGS);
  }
  stakingToken.transferOwnership(stakingDeploy.address);
};
export default func;
func.id = "01_deploy"; // id required to prevent re-execution
func.tags = ["all"];
