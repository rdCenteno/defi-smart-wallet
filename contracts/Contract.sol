// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./libraries/TransferHelper.sol";

contract Contract {
    event Deposit(address indexed sender, uint amount, uint balance);
    event Withdraw(address owner, uint256 amount, uint balance);
    event ExecuteTransactions(address indexed executor, uint256 amount);

    address owner;

    modifier onlyOwner {
        require(owner == msg.sender, "Contract: caller is not the owner");
        _;
    }

    constructor(address _owner) {
        owner = _owner;
    }

    function executeTransactions(address[] memory _targets, bytes[] memory _data, uint256[] memory _values) external payable onlyOwner {
        require(_targets.length == _data.length, "Contract: invalid data parameters");
        for(uint i; i < _targets.length; i++) {
            (bool success, ) = _targets[i].call{value: _values[i]}(_data[i]);
            require(success, "Contract: tx failed");
        }
        emit ExecuteTransactions(msg.sender, _targets.length);
    }

    function withdraw(uint _amount) external onlyOwner {
        TransferHelper.safeTransferETH(owner, _amount);
        emit Withdraw(owner, _amount, address(this).balance);
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }
}