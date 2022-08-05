import { ChainId, WETH9_ADDRESS, USDC_ADDRESS, WNATIVE_ADDRESS } from "@clonedex/core-sdk";
import { task, types } from "hardhat/config";
import { ConstantProductPoolFactory, MasterDeployer } from "../types";

task("cpp-deploy", "Constant Product Pool deploy")
  .addOptionalParam(
    "token0",
    "Token A",
    WNATIVE_ADDRESS[ChainId.MATIC], // kovan weth
    types.string
  )
  .addOptionalParam(
    "token1",
    "Token B",
    USDC_ADDRESS[ChainId.MATIC], // kovan dai
    types.string
  )
  .addOptionalParam("fee", "Fee tier", 30, types.int)
  .addOptionalParam("twap", "Twap enabled", true, types.boolean)
  .addOptionalParam("verify", "Verify", true, types.boolean)
  .setAction(async function ({ token0, token1, fee, twap, verify }, { ethers, run }) {
    const masterDeployer = await ethers.getContract<MasterDeployer>("MasterDeployer");

    const constantProductPoolFactory = await ethers.getContract<ConstantProductPoolFactory>(
      "ConstantProductPoolFactory"
    );

    const deployData = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "uint256", "bool"],
      [...[token0, token1].sort(), fee, twap]
    );

    console.log([...[token0, token1].sort(), fee, twap], {
      factory: constantProductPoolFactory.address,
      deployData,
    });

    // console.log("1", [...[token0, token1].sort(), fee, twap]);
    const contractTransaction = await masterDeployer.deployPool(constantProductPoolFactory.address, deployData);
    // console.log("2");
    if (!verify) return;

    const contractReceipt = await contractTransaction.wait(5);

    const { events } = contractReceipt;
  });
