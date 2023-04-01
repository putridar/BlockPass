pragma solidity ^0.5.0;


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

    function transferCredit(address sender, address recipient, uint256 amt) public {
        uint256 senderBalance = balances[sender];
        uint256 recipientBalance = balances[recipient];

        senderBalance -= amt;
        recipientBalance += amt;

        balances[sender] = senderBalance;
        balances[recipient] = recipientBalance;
        emit tokenUsed(amt);
    }
}
