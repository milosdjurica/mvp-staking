import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  DECIMALS,
  developmentChains,
  ETH_USD_PRICE,
} from "../utils/helperConfig";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  if (developmentChains.includes(network.name)) {
    console.log("Local network detected! Deploying mocks...");

    const ethPriceFeedMock = await deploy("MockV3Aggregator", {
      from: deployer,
      args: [DECIMALS, ETH_USD_PRICE],
      log: true,
    });

    await deployments.save("EthPriceFeedMock", ethPriceFeedMock);

    log("MockV3Aggregator deployed!!!");
    log("===============================================================");
  }
};
export default func;
func.id = "00_deployMocks";
func.tags = ["mocks", "all"];
