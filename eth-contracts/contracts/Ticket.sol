pragma solidity ^0.5.0;

import "./Event.sol";
import "./TickToken.sol";
import "./BlockTier.sol";

/* 
    This contract encapsulates the full ticket lifecycle.

    Flow:
    1. User waits until an event has been created and activated
    2. User buys the ticket for that event using the issueTicket() function, initially the state of the ticket is 'active'
    3. User presents the ticket at the venue, after which the ticket's state will be set to 'used'
    4. If the user does not attend the event, the ticket will be set as 'forfeited'

    There is a max number of ticket that any user can buy. This is set to 2 by default. The number can be increased through the
    BlockTier loyalty program. Users can also redeem TickTokens to get discounts for their ticket purchases.

    A ticket can only change its ownership once - regardless of whether it changes through a direct ticket transfer or through
    a transaction in the secondary market.
*/
contract Ticket {
    Event eventContract;
    BlockTier blockTierContract;
    TickToken tokenContract;
    uint256 baseIssuanceLimit;
    address admin = msg.sender;

    // Market address for verification
    address market = address(0);

    enum ticketState {
        active,
        used,
        forfeited
    }

    struct ticket {
        uint256 ticketId;
        uint256 eventId;
        address owner;
        ticketState currState;
        uint256 numberOfOwnershipChanges;
    }

    constructor(Event eventContractIn, BlockTier blockTierContractIn, TickToken tokenContractIn, uint256 baseIssuanceLimitIn) public {
        eventContract = eventContractIn;
        blockTierContract = blockTierContractIn;
        tokenContract = tokenContractIn;
        baseIssuanceLimit = baseIssuanceLimitIn;
    }
    
    event ticketIssued(uint256 ticketId);
    event ticketUsed(uint256 ticketId);
    event ticketForfeited(uint256 ticketId);
    event ticketTransfered(uint256 ticketId);
    event tokenRedeemed(uint256 token);
    event debug(string str);

    uint256 numTickets = 0;
    uint256 numDiscounts = 0;
    uint256 limitOfOwnershipChange = 1;

    /* 
        The standard exchange rate for the TickTokens = 1/200 = 0.005 = 0.5%
        In other words, one TickToken can be redeemed for a 0.5% discount on any tickets purchase
    */
    uint256 baseDiscount = 200;

    mapping(uint256 => ticket) public tickets;
    mapping(uint256 => mapping(address => uint256)) ticketsIssued; // Event ID => User ID => Number of tickets issued

    mapping(address => uint256) public noOfTransactions; //Tracking how many transactions each user made
    mapping(uint256 => uint256) public maxMintLimit; //Maximum ticket minting limit for each tier || NEED TO INITIALIZE!!!

    uint256 oneEth = 1000000000000000000;

    modifier adminOnly() {
        require(admin == msg.sender, "Only admins can run this function!");
        _;
    }

    modifier ownerOnly(uint256 ticketId) {
        require(tickets[ticketId].owner == msg.sender);
        _;
    }

    modifier marketTransferCheck() {
        require(market == msg.sender);
        _;
    }

    modifier validTicket(uint256 ticketId) {
        require(ticketId < numTickets, "This ticket does not exists!");
        _;
    }

    modifier activeTicket(uint256 ticketId) {
        if (eventContract.getExpiry(tickets[ticketId].eventId) < now && tickets[ticketId].currState == ticketState.active) {
            tickets[ticketId].currState = ticketState.forfeited;
            emit ticketForfeited(ticketId);
        }
        require(
            tickets[ticketId].currState == ticketState.active,
            "This ticket has been used or forfeited!"
        );
        _;
    }

    function issueTickets(
        uint256 eventId,
        uint256 quantity,
        uint256 tokenToBeRedeemed
    ) public payable returns (uint256[] memory) {
        require(eventContract.eventIsValid(eventId), "Event does not exists!");
        require(eventContract.eventIsActive(eventId), "Event is not active or has expired!");
        //require(tokenToBeRedeemed != 0, "Token to be redeemed cannot be 0");
        require(tokenContract.checkCredit(msg.sender) >= tokenToBeRedeemed, "User does not have sufficient token");
        require(checkTicketsIssued(eventId, msg.sender, quantity), "This user has hit their ticket issuance limit!");
        
        uint256 standardPrice = eventContract.getStandardPrice(eventId);
        uint256 totalPrice = standardPrice * quantity;
        
        require(msg.value >= totalPrice * oneEth * (1 - (tokenToBeRedeemed/baseDiscount)), "Insufficient funds to buy this ticket!");

        // Add supply first to "reserve" the tickets; minimize potential shenanigans if multiple users buy tickets at the same time
        eventContract.addSupply(eventId, quantity);
        
        // Records additional tickets that have been issued for this user
        ticketsIssued[eventId][msg.sender]+= quantity;
        blockTierContract.addTicketsBought(msg.sender, quantity);
        
        address payable recipient = address(uint160(eventContract.getOrganizer(eventId)));

        //trfPrice in wei
        uint256 trfPrice = totalPrice * oneEth;
        trfPrice = trfPrice * (1 - (tokenToBeRedeemed/baseDiscount));

        if (tokenToBeRedeemed > 0) {
             tokenContract.useToken(msg.sender, tokenToBeRedeemed);
            emit tokenRedeemed(tokenToBeRedeemed);
        }
        
        recipient.transfer(trfPrice);

        uint256[] memory res = new uint256[](quantity);

        for(uint i = 0; i < quantity; i++) {
            ticket memory newTicket = ticket(
                numTickets,
                eventId,
                msg.sender,
                ticketState.active,
                0
            );

            tickets[numTickets] = newTicket;
            res[i] = numTickets;
            numTickets++;
        }

        // Update the # of transactions for the user (for loyalty programs)
        uint256 totalTransactions = noOfTransactions[msg.sender] + quantity;
        noOfTransactions[msg.sender] = totalTransactions;
        
        // Give TickTokens (part of loyalty program)
        tokenContract.mintToken(msg.sender, quantity);

        emit ticketIssued(numTickets);
        // Returns array with ticket IDs of all the tickets that have been issued to the requester
        return res;
    }

    function transfer(uint256 ticketId, address receiver) public ownerOnly(ticketId) validTicket(ticketId) activeTicket(ticketId) {
        require(msg.sender != receiver, "Cannot transfer ticket to yourself!");
        require(tickets[ticketId].numberOfOwnershipChanges < limitOfOwnershipChange, "This ticket's ownership has been changed once before!");

        tickets[ticketId].numberOfOwnershipChanges += 1;
        tickets[ticketId].owner = receiver;
        emit ticketTransfered(ticketId);
    }

    function useTicket(uint256 ticketId) public validTicket(ticketId) activeTicket(ticketId) {
        tickets[ticketId].currState = ticketState.used;
        emit ticketUsed(ticketId);
    }

    function marketTransfer(uint256 ticketId, address receiver) public marketTransferCheck() validTicket(ticketId) activeTicket(ticketId) {
        tickets[ticketId].numberOfOwnershipChanges += 1;
        tickets[ticketId].owner = receiver;
    }

    function getTicketOwner(uint256 ticketId) public view validTicket(ticketId) returns (address) {
        return tickets[ticketId].owner;
    }

    function checkOwnershipChangeValidity(uint256 ticketId) public view validTicket(ticketId) returns (bool) {
        return tickets[ticketId].numberOfOwnershipChanges < limitOfOwnershipChange;
    }

    // Sets the address of the secondary market
    function setMarket(address marketIn) public {
        market = marketIn;
    }

    function getToken(address user) public view returns (uint256) {
        return tokenContract.checkCredit(user);
    }
    
    function checkTicketsIssued(uint256 eventId, address purchaser, uint256 quantity) public view returns (bool) {
        uint256 currentQuantity = ticketsIssued[eventId][purchaser];
        uint256 additionalLimit = blockTierContract.getAdditionalIssuanceLimit(purchaser);

        if (currentQuantity + quantity > baseIssuanceLimit + additionalLimit) {
            return false;
        }

        return true;
    }

    function getEventId(uint256 ticketId) public view validTicket(ticketId) returns (uint256) {
        return tickets[ticketId].eventId;
    }
}
