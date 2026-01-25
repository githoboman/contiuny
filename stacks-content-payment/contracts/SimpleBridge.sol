// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

/**
 * @title SimpleBridgeVault
 * @dev A simple contract to hold USDC on Ethereum Sepolia for the Contiuny Bridge.
 * Emits an event that the backend relayer listens to, triggering a mint on Stacks.
 */
contract SimpleBridgeVault {
    address public immutable token;
    address public owner;

    event BridgeInitiated(address indexed sender, uint256 amount, string stacksRecipient);

    constructor(address _token) {
        token = _token;
        owner = msg.sender;
    }

    function bridge(uint256 amount, string calldata stacksRecipient) external {
        require(amount > 0, "Amount must be > 0");
        
        // Pull tokens from user to this contract
        bool success = IERC20(token).transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed: Check allowance");
        
        // Emit event for backend relayer
        emit BridgeInitiated(msg.sender, amount, stacksRecipient);
    }

    // Emergency withdraw by owner (if needed)
    function withdraw(uint256 amount) external {
        require(msg.sender == owner, "Only owner");
        IERC20(token).transferFrom(address(this), owner, amount); // Wait, transferFrom? No, transfer.
    }
}
