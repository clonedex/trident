// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;

/// @notice Interface for Trident exchange pool interactions.
interface IPool {
    event Swap(
        address indexed recipient,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    struct liquidityInput {
        address token;
        bool native;
        uint256 amountDesired;
        uint256 amountMin;
    }

    struct liquidityInputOptimal {
        address token;
        bool native;
        uint256 amount;
    }

    struct liquidityAmount {
        address token;
        uint256 amount;
    }

    function swapWithoutContext(
        address tokenIn,
        address tokenOut,
        address recipient,
        bool unwrapBento
    ) external returns (uint256 finalAmountOut);

    function swapWithContext(
        address tokenIn,
        address tokenOut,
        bytes calldata context,
        address recipient,
        bool unwrapBento,
        uint256 amountIn
    ) external returns (uint256 finalAmountOut);

    function getOptimalLiquidityInAmounts(liquidityInput[] calldata liquidityInputs)
        external
        returns (liquidityAmount[] memory liquidityOptimal);

    function mint(address recipient) external returns (uint256 liquidity);

    function burn(address recipient, bool unwrapBento) external returns (liquidityAmount[] memory withdrawnAmounts);

    function burnLiquiditySingle(
        address tokenOut,
        address recipient,
        bool unwrapBento
    ) external returns (uint256 amount);
}
