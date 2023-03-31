pragma solidity ^0.5.0;

import "./ERC20.sol";

contract TickToken {
    ERC20 erc20Contract;
    address owner;

    constructor() public {
        ERC20 e = new ERC20();
        erc20Contract = e;
        owner = msg.sender;
    }
    /**
    * @dev Function to give TickToken to the recipient for a given amount
    * @param recipient address of the recipient that wants to buy the DT
    * @param weiAmt uint256 amount indicating the amount of wei that was passed
    * @return A uint256 representing the amount of DT bought by the msg.sender.
    */
    function mintToken(address recipient, uint256 amt) public returns (uint256) {
        erc20Contract.mint(recipient, amt);
        return amt;
    }
    /**
    * @dev Function to check the amount of DT the msg.sender has
    * @param ad address of the recipient that wants to check their DT
    * @return A uint256 representing the amount of DT owned by the msg.sender.
    */
    function checkCredit(address ad) public view returns (uint256) {
        uint256 credit = erc20Contract.balanceOf(ad);
        return credit;
    }
    /**
    * @dev Function to transfer the credit from the owner to the recipient
    * @param recipient address of the recipient that will gain in DT
    * @param amt uint256 aount of DT to transfer
    */
    function transferCredit(address recipient, uint256 amt) public {
        // Transfers from tx.origin to receipient
        erc20Contract.transfer(recipient, amt);
    }
}
