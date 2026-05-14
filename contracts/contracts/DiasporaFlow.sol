// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DiasporaFlow is Ownable, ReentrancyGuard {
    IERC20 public immutable cUSD;

    uint256 public constant FEE_BPS = 30; // 0.3%
    uint256 public constant BPS_DENOMINATOR = 10000;
}
