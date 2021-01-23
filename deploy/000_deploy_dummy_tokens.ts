import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

import BN from "bn.js";
import initConfig from "../initialization.json";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const [deployer] = await ethers.getSigners();
  const { deployments, getUnnamedAccounts } = hre;
  const { deploy, execute } = deployments;
  if (hre.network.live) {
    return;
  }

  for (const token of initConfig.tokens) {
    const deploymentName = `${token.symbol}ERC20`;
    const deploymentResult = await deploy(deploymentName, {
      contract: "SimpleERC20",
      from: deployer.address,
      args: [token.name, token.symbol, token.decimals],
      log: true,
      deterministicDeployment: true,
    });
    if (deploymentResult.newlyDeployed) {
      await execute(deploymentName, { from: deployer.address }, "initializeOwner");
    }

    await execute(
      deploymentName,
      { from: deployer.address },
      "mint",
      deployer.address,
      new BN(10).pow(new BN(27)).toString()
    );
  }
};

export default func;
