pragma solidity ^0.5.0;

import "./Event.sol";
import "./BlockTier.sol";

contract Ticket {
    Event eventContract;
    BlockTier blockTierContract;
    uint256 baseIssuanceLimit;
    address admin = msg.sender;
    uint256 fee = 0; // Ticket purchase commission fee in ETH

    // Market address for verification
    address market = address(0);

    enum ticketState {
        active,
        expired
    }

    struct ticket {
        uint256 ticketId;
        uint256 eventId;
        address owner;
        ticketState currState;
        uint256 numberOfOwnershipChanges;
        uint256 expiry;
    }

    constructor(Event eventContractIn, BlockTier blockTierContractIn, uint256 baseIssuanceLimitIn, uint256 feeIn) public {
        eventContract = eventContractIn;
        blockTierContract = blockTierContractIn;
        baseIssuanceLimit = baseIssuanceLimitIn;
        fee = feeIn;
    }
    
    event ticketIssued(uint256 ticketId);
    event ticketExpired(uint256 ticketId);
    event ticketTransfered(uint256 ticketId);

    uint256 numTickets = 0;
    uint256 limitOfOwnershipChange = 1;
    mapping(uint256 => ticket) public tickets;
    mapping(uint256 => mapping(address => uint256)) ticketsIssued; // Event ID => User ID => Number of tickets issued

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
        if (eventContract.getExpiry(tickets[ticketId].eventId) < now) {
            tickets[ticketId].currState = ticketState.expired;
            emit ticketExpired(ticketId);
        }
        require(
            tickets[ticketId].currState == ticketState.active,
            "This ticket has expired!"
        );
        _;
    }

    function issueTickets(
        uint256 eventId,
        uint256 quantity
    ) public payable returns (uint256[] memory) {
        require(eventContract.eventIsValid(eventId), "Event does not exists!");
        require(eventContract.eventIsActive(eventId), "Event is not active or has expired!");
        require(checkTicketsIssued(eventId, msg.sender, quantity), "This user has hit their ticket issuance limit!");

        uint256 standardPrice = eventContract.getStandardPrice(eventId);
        uint256 totalPrice = standardPrice * quantity;

        require(msg.value >= (totalPrice + fee) * oneEth, "Insufficient funds to buy this ticket!");

        // Add supply first to "reserve" the tickets; minimize potential shenanigans if multiple users buy tickets at the same time
        eventContract.addSupply(eventId, quantity);

        // Records additional tickets that have been issued for this user
        ticketsIssued[eventId][msg.sender]+= quantity;
        blockTierContract.addTicketsBought(msg.sender, quantity);

        address payable recipient = address(uint160(eventContract.getOrganizer(eventId)));
        recipient.transfer(totalPrice * oneEth);

        // Ticket commission
        address payable adminRecipient = address(uint160(admin));
        adminRecipient.transfer(fee * oneEth);

        uint256[] memory res = new uint256[](quantity);

        for(uint i = 0; i < quantity; i++) {
            ticket memory newTicket = ticket(
                numTickets,
                eventId,
                msg.sender,
                ticketState.active,
                0,
                eventContract.getExpiry(eventId)
            );

            tickets[numTickets] = newTicket;
            res[i] = numTickets;
            numTickets++;
        }
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
        tickets[ticketId].currState = ticketState.expired;
        emit ticketExpired(ticketId);
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

    // Sets the market address
    function setMarket(address marketIn) public {
        market = marketIn;
    }

    function checkTicketsIssued(uint256 eventId, address purchaser, uint256 quantity) public view returns (bool) {
        uint256 currentQuantity = ticketsIssued[eventId][purchaser];
        uint256 additionalLimit = blockTierContract.getAdditionalIssuanceLimit(purchaser);

        if (currentQuantity + quantity > baseIssuanceLimit + additionalLimit) {
            return false;
        }

        return true;
    }
}
