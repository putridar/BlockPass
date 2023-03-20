pragma solidity ^0.5.0;

import "./Ticket.sol";

/*
SECONDARY MARKET
1. Listed price is ask price + fee
2. Fee is sent to admin
3. All prices are denoted in ETH, except for msg.value

//TODO: Multiple quantity listings?
*/
contract SecondaryMarket {
    Ticket ticketContract;
    uint256 fee = 0; // in ETH
    address admin = msg.sender;
    uint256 oneEth = 1000000000000000000;

    constructor(Ticket ticketContractIn, uint256 feeIn) public {
        ticketContract = ticketContractIn;
        fee = feeIn;
    }

    event marketTransaction(uint256 ticketId);

    mapping (uint256 => uint256) public listings;

    modifier ownerOnly(uint256 ticketId) {
        require(ticketContract.getTicketOwner(ticketId) == msg.sender, "Ticket is not owned by this owner");
        _;
    }

    modifier isListed(uint256 ticketId) {
        require(listings[ticketId] != 0, "Ticket has not been listed!");
        _;
    }
    
    // Ask price in ETH
    function list(uint256 ticketId, uint256 askPrice) public ownerOnly(ticketId) {
        require(ticketContract.checkOwnershipChangeValidity(ticketId), "This ticket cannot be sold due to the limit on changes of ownership!");
        require(askPrice > 0, "Asking price must be non-negative!");
        listings[ticketId] = askPrice;
    }

    function unlist(uint256 ticketId) public ownerOnly(ticketId) isListed(ticketId) {
        delete listings[ticketId];
    }

    // Price is asking price + commission fee
    function checkPrice(uint256 ticketId) public view isListed(ticketId) returns (uint256) {
        return listings[ticketId] + fee;
    }

    //TODO: Debug, smth wrong with payables
    function buy(uint256 ticketId) public payable isListed(ticketId) {
        require(ticketContract.getTicketOwner(ticketId) != msg.sender, "You cannot buy your own ticket!");
        require(msg.value / oneEth >= listings[ticketId] + fee, "You do not have sufficient funds!");

        address payable recipient = address(uint160(ticketContract.getTicketOwner(ticketId)));
        recipient.transfer(listings[ticketId] * oneEth);

        address payable adminRecipient = address(uint160(admin));
        adminRecipient.transfer(fee * oneEth);

        ticketContract.marketTransfer(ticketId, msg.sender);

        delete listings[ticketId];
    }

    function getFee() public view returns (uint256) {
        return fee;
    }
}