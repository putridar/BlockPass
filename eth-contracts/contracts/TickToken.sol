pragma solidity ^0.5.0;

//import "./ERC20.sol";

contract TickToken {
    //ERC20 erc20Contract;
    address owner;

    mapping(address => uint256) public balances; //The balances for all users

    constructor() public {
        //ERC20 e = new ERC20();
        //erc20Contract = e;
        owner = msg.sender;
    }
    /**
    * @dev Function to give TickToken to the recipient for a given amount.
    * @param recipient address of the recipient that wants to buy the token.
    * @param amt uint256 amount indicating the amount of token that needs to be created.
    * @return A uint256 representing the amount of token bought by the msg.sender.
    */
    function mintToken(address recipient, uint256 amt) public returns (uint256) {
        // erc20Contract.mint(recipient, amt);
        balances[recipient] = balances[recipient] + amt;
        return amt;
    }
    /**
    * @dev Function to check the account balance of the msg.sender
    * @param ad address of the recipient that wants to check their token balance.
    * @return A uint256 representing the amount of token owned by the msg.sender.
    */
    function checkCredit(address ad) public view returns (uint256) {
        //uint256 credit = erc20Contract.balanceOf(ad);
        uint256 credit = balances[ad];
        return credit;
    }
    /**
    * @dev Function to transfer the credit from the owner to the recipient.
    * @param sender address of the sender that will send the tokens.
    * @param recipient address of the recipient that will gain tokens.
    * @param amt uint256 amount of token to transfer.
    */
    function transferCredit(address sender, address recipient, uint256 amt) public {
        // Transfers from tx.origin to receipient
        // erc20Contract.transfer(recipient, amt);
        uint256 senderBalance = balances[sender];
        uint256 recipientBalance = balances[recipient];

        senderBalance -= amt;
        recipientBalance += amt;

        balances[sender] = senderBalance;
        balances[recipient] = recipientBalance;
    }
}
