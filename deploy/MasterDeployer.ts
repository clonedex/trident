import { BENTOBOX_ADDRESS, ChainId, WNATIVE, WNATIVE_ADDRESS } from "@clonedex/core-sdk";

import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BentoBoxV1, WETH9 } from "../types";

const deployFunction: DeployFunction = async function ({
  ethers,
  deployments,
  getNamedAccounts,
  getChainId,
  run,
}: HardhatRuntimeEnvironment) {
  console.debug("Running MasterDeployer deploy script");
  const { deploy } = deployments;

  const barFee = 1667; // 1667/10000 ≈ 1/6

  const { deployer, barFeeTo } = await getNamedAccounts();

  const chainId = Number(await getChainId());

  const bentoBox = await ethers.getContractOrNull<BentoBoxV1>("BentoBoxV1");

  const wnative = await ethers.getContractOrNull<WETH9>("WETH9");

  if (!bentoBox && !(chainId in BENTOBOX_ADDRESS)) {
    throw Error(`No BENTOBOX on chain #${chainId}!`);
  }

  if (!wnative && !(chainId in WNATIVE_ADDRESS)) {
    throw Error(`No WNATIVE on chain #${chainId}!`);
  }

  const { address, newlyDeployed } = await deploy("MasterDeployer", {
    from: deployer,
    args: [barFee, barFeeTo, bentoBox ? bentoBox.address : BENTOBOX_ADDRESS[chainId]],
    deterministicDeployment: false,
    log: true,
  });
};

export default deployFunction;

deployFunction.dependencies = ["BentoBoxV1"];

deployFunction.tags = ["MasterDeployer"];
