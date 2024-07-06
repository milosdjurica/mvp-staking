import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "hardhat-deploy";
import "hardhat-deploy-ethers";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
};

export default config;

