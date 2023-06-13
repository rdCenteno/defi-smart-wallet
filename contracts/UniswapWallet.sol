// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "./interfaces/IRouter.sol";
import "./interfaces/IERC20.sol";
import "./libraries/TransferHelper.sol";

contract UniswapWallet {

    event Withdraw(uint256 amount, address owner);
    event WithdrawToken(address token, uint256 amount, address owner);
    event SwapTokensForETH(address indexed from, address indexed to, uint256 amountIn, uint256 amountOut);
    event SwapETHForTokens(address indexed from, address indexed to, uint256 amountIn, uint256 amountOut);
    event SwapTokensForTokens(address indexed from, address indexed to, uint256 amountIn, uint256 amountOut);
    
    address payable public owner;
    IRouter public routerContract;

    constructor(IRouter _router) {
        owner = payable(msg.sender);
        routerContract = _router;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    function withdraw(uint _amount) external onlyOwner {
        TransferHelper.safeTransferETH(owner, _amount);
        emit Withdraw(_amount, owner);
    }

    function withdrawToken(address _token, uint _value) external onlyOwner {
        TransferHelper.safeTransfer(_token, owner, _value);
        emit WithdrawToken(_token, _value, owner);
    }

    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        uint deadline
    ) external payable returns (uint[] memory amounts) {
        require(amountOutMin > 0, "UniswapWallet: INSUFFICIENT_AMOUNT_OUT");
        require(msg.value > 0, "UniswapWallet: INSUFFICIENT_VALUE");
        uint[] memory result = routerContract.swapExactETHForTokens{value: msg.value}(amountOutMin, path, address(this), deadline);
        emit SwapETHForTokens(msg.sender, address(this), msg.value, result[result.length - 1]);
        return result;
    }

    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        uint deadline
    ) external returns (uint[] memory amounts) {
        require(amountOutMin > 0, "UniswapWallet: INSUFFICIENT_AMOUNT_OUT");
        require(amountIn > 0, "UniswapWallet: INSUFFICIENT_AMOUNT_IN");
        TransferHelper.safeTransferFrom(path[0], msg.sender, address(this), amountIn);
        IERC20 tokenContract = IERC20(address(path[0]));
        tokenContract.approve(address(routerContract), amountIn);
        uint[] memory result = routerContract.swapExactTokensForETH(amountIn, amountOutMin, path, address(this), deadline);
        emit SwapTokensForETH(msg.sender, address(this), amountIn, result[result.length - 1]);
        return result;
    }

    receive() external payable {}
}
