import { ChainId, DAI_ADDRESS, USDC_ADDRESS, WETH9_ADDRESS } from "@sushiswap/core-sdk";
import { task, types } from "hardhat/config";

import type { MasterDeployer } from "../types";

task("cpp-verify", "Constant Product Pool verify")
  .addOptionalParam(
    "token0",
    "Token A",
    WETH9_ADDRESS[ChainId.OPTIMISM], // kovan weth
    types.string
  )
  .addOptionalParam(
    "token1",
    "Token B",
    DAI_ADDRESS[ChainId.OPTIMISM], // kovan dai
    types.string
  )
  .addOptionalParam("fee", "Fee tier", 30, types.int)
  .addOptionalParam("twap", "Twap enabled", true, types.boolean)
  .setAction(async function ({ token0, token1, fee, twap }, { ethers, run }) {
    console.log(`Verify cpp tokenA: ${token0} tokenB: ${token1} fee: ${fee} twap: ${twap}`);

    const masterDeployer = await ethers.getContract<MasterDeployer>("MasterDeployer");

    const address = await run("cpp-address", { token0, token1, fee, twap });

    console.log(`Verify cpp ${address}`);

    const deployData = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "uint256", "bool"],
      [...[token0, token1].sort(), fee, twap]
    );

    await run("verify:verify", {
      address,
      constructorArguments: [],
    });
  });
