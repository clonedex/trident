import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  ethers,
  run,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const { address, newlyDeployed } = await deploy("ConstantProductPoolFactoryHelper", {
    from: deployer,
    deterministicDeployment: false,
    log: true,
  });
};

export default deployFunction;

deployFunction.tags = ["ConstantProductPoolFactoryHelper"];
