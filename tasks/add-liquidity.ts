import { BENTOBOX_ADDRESS, ChainId, USDC_ADDRESS, WETH9_ADDRESS } from "@clonedex/core-sdk";
import type { BentoBoxV1, BentoBoxV1__factory, ERC20Mock, TridentRouter } from "../types";
import { task, types } from "hardhat/config";

import { ethers } from "ethers";

const { BigNumber } = ethers;

task("add-liquidity", "Add liquidity")
  .addOptionalParam("token0", "Token A", WETH9_ADDRESS[ChainId.KOVAN], types.string)
  .addOptionalParam("token1", "Token B", USDC_ADDRESS[ChainId.KOVAN], types.string)
  .addOptionalParam("pool", "Pool", "0xb11d9FB782D0185e7D19C8127241398305B110Ed")
  .addOptionalParam("minLiquidity", "Minimum Liquidity", BigNumber.from(10).pow(0).toString(), types.string)
  .addOptionalParam("recipient", "Recipient", "0xd198B08Fb9bfd659065D3c15FbcE14e44Ab54D42", types.string) // dev default
  .setAction(
    async (
      {
        token0,
        token1,
        pool,
        minLiquidity,
        recipient,
      }: { token0: string; token1: string; pool?: string; minLiquidity: number; recipient: string },
      { ethers, run, getChainId, getNamedAccounts },
      runSuper
    ) => {
      const chainId = await getChainId();

      pool = pool || ((await run("cpp-address")) as string);

      const { deployer } = await getNamedAccounts();

      const router = await ethers.getContract<TridentRouter>("TridentRouter");

      const BentoBox = await ethers.getContractFactory<BentoBoxV1__factory>("BentoBoxV1");

      let bentoBox: BentoBoxV1;

      try {
        bentoBox = await ethers.getContract<BentoBoxV1>("BentoBoxV1");
      } catch (error) {
        bentoBox = BentoBox.attach(BENTOBOX_ADDRESS[chainId]);
      }

      const dev = await ethers.getNamedSigner("dev");

      const _token0 = await ethers.getContractAt<ERC20Mock>("ERC20Mock", token0);

      const _token1 = await ethers.getContractAt<ERC20Mock>("ERC20Mock", token1);

      let liquidityInput = [
        {
          token: _token0.address,
          native: true,
          amount: ethers.BigNumber.from(10).pow(18),
        },
        {
          token: _token1.address,
          native: true,
          amount: ethers.BigNumber.from(10).pow(18),
        },
      ];

      await run("whitelist");

      if ((await _token0.allowance(deployer, bentoBox.address)).lt(liquidityInput[0].amount)) {
        console.log("Approving token0");
        await run("erc20-approve", {
          token: liquidityInput[0].token,
          spender: bentoBox.address,
        });
        console.log("Approved token0");
      }

      if ((await _token1.allowance(deployer, bentoBox.address)).lt(liquidityInput[1].amount)) {
        console.log("Approving token1");
        await run("erc20-approve", {
          token: liquidityInput[1].token,
          spender: bentoBox.address,
        });
        console.log("Approved token1");
      }

      console.log("Depositing 1st token", [
        liquidityInput[0].token,
        dev.address,
        dev.address,
        0,
        liquidityInput[0].amount,
      ]);
      await bentoBox
        .connect(dev)
        .deposit(liquidityInput[0].token, dev.address, dev.address, liquidityInput[0].amount, 0)
        .then((tx) => tx.wait());

      console.log("Depositing 2nd token");
      await bentoBox
        .connect(dev)
        .deposit(liquidityInput[1].token, dev.address, dev.address, liquidityInput[1].amount, 0)
        .then((tx) => tx.wait());

      await bentoBox
        .connect(dev)
        .setMasterContractApproval(
          dev.address,
          router.address,
          true,
          "0",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        )
        .then((tx) => tx.wait());

      console.log("Set master contract approval");

      const data = ethers.utils.defaultAbiCoder.encode(["address"], [dev.address]);

      console.log(`Adding minimum of ${minLiquidity} liquidity to ${pool}`);

      await router
        .connect(dev)
        .addLiquidity(liquidityInput, pool, minLiquidity, data)
        .then((tx) => tx.wait());

      console.log("Added liquidity");
    }
  );
