pragma solidity ^0.5.0;

/* 
    TickToken is one of two components that make up the loyalty program.
    A token is rewarded to users for every ticket they buy.
    Users can redeem tokens to get discounts for ticket purchases.

    The default exchange rate for a TickToken is 0.005; see the Ticket.sol contract for more details.

    A TickToken has an unidirectional flow - it can be created and given through
    ticket purchases, but it cannot be exchanged directly into ETH.
*/
contract TickToken {
    address owner;

    mapping(address => uint256) public balances;
    event tokenUsed(uint256 amt);

    constructor() public {
        owner = msg.sender;
    }

    function mintToken(address recipient, uint256 amt) public returns (uint256) {
        balances[recipient] = balances[recipient] + amt;
        return amt;
    }

    function checkCredit(address ad) public view returns (uint256) {
        uint256 credit = balances[ad];
        return credit;
    }

    function useToken(address sender, uint256 amt) public {
        uint256 senderBalance = balances[sender];
        senderBalance -= amt;
        balances[sender] = senderBalance;
        emit tokenUsed(amt);
    }
}
