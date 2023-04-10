pragma solidity ^0.5.0;

import "./Ticket.sol";

/*
    The Secondary Market is a place to buy and sell tickets that have been bought.

    Key details:
    1. Listed price is ask price + commission fee
    2. Fee is sent directly to admin
    3. All prices are denoted in ETH, except for msg.value

    Flow:
    1. User lists a ticket he/she has bought, inputs asking price
    2. Another user buys the ticket directly using ETH
*/
contract SecondaryMarket {
    Ticket ticketContract;
    uint256 fee = 0; // Commission fee, in ETH
    address admin = msg.sender;
    uint256 numListings = 0;
    
    uint256 oneEth = 1000000000000000000;

    constructor(Ticket ticketContractIn, uint256 feeIn) public {
        ticketContract = ticketContractIn;
        fee = feeIn;

        ticketContract.setMarket(address(this));
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

    modifier isNotListed(uint256 ticketId) {
        require(listings[ticketId] == 0, "Ticket has been listed!");
        _;
    }
    
    // Ask price in ETH
    function list(uint256 ticketId, uint256 askPrice) public ownerOnly(ticketId) isNotListed(ticketId) {

        // Tickets that have changed hands more than once cannot be listed on the secondary market.
        require(ticketContract.checkOwnershipChangeValidity(ticketId), "This ticket cannot be sold due to the limit on changes of ownership!");
        
        require(askPrice > 0, "Asking price must be non-negative!");
        listings[ticketId] = askPrice;
        numListings++;
    }

    function unlist(uint256 ticketId) public ownerOnly(ticketId) isListed(ticketId) {
        delete listings[ticketId];
        numListings--;
    }

    // Price is asking price + commission fee
    function checkPrice(uint256 ticketId) public view isListed(ticketId) returns (uint256) {
        return listings[ticketId] + fee;
    }

    function buy(uint256 ticketId) public payable isListed(ticketId) {
        require(ticketContract.getTicketOwner(ticketId) != msg.sender, "You cannot buy your own ticket!");
        require(msg.value / oneEth >= listings[ticketId] + fee, "You do not have sufficient funds!");

        address payable recipient = address(uint160(ticketContract.getTicketOwner(ticketId)));
        recipient.transfer(listings[ticketId] * oneEth);
        
        address payable adminRecipient = address(uint160(admin));
        adminRecipient.transfer(fee * oneEth);
        
        ticketContract.marketTransfer(ticketId, msg.sender);

        delete listings[ticketId];
        numListings--;
    }

    function getFee() public view returns (uint256) {
        return fee;
    }

    // Return the ticket ID of all tickets currently being listed
    function getAllListings() public view returns(uint256[] memory) {
        uint256[] memory res = new uint256[](numListings);

        uint i = 0;
        uint currListingsFound = 0;

        while(currListingsFound < numListings) {
            if (listings[i] != 0) {
                res[currListingsFound] = i;
                currListingsFound++;
            }

            i++;
        }

        return res;
    }
}