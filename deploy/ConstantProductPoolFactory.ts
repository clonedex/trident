import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployFunction: DeployFunction = async function ({
  deployments,
  getNamedAccounts,
  ethers,
  run,
  getChainId,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  const masterDeployer = await ethers.getContract("MasterDeployer");

  const { address, newlyDeployed } = await deploy("ConstantProductPoolFactory", {
    from: deployer,
    deterministicDeployment: false,
    args: [masterDeployer.address],
    log: true,
  });

  if (!(await masterDeployer.whitelistedFactories(address))) {
    console.debug("Add ConstantProductPoolFactory to MasterDeployer whitelist");
    await (await masterDeployer.addToWhitelist(address)).wait();
  }
};

export default deployFunction;

deployFunction.dependencies = ["MasterDeployer"];

deployFunction.tags = ["ConstantProductPoolFactory"];
