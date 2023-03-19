pragma solidity ^0.5.0;

import "./Event.sol";

contract Ticket {
    Event eventContract;
    address admin = msg.sender;

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
    }

    constructor(Event eventContractIn) public {
        eventContract = eventContractIn;
    }
    
    event ticketIssued(uint256 ticketId);
    event ticketExpired(uint256 ticketId);
    event ticketTransfered(uint256 ticketId);

    uint256 numTickets = 0;
    uint256 limitOfOwnershipChange = 1;
    mapping(uint256 => ticket) public tickets;

    modifier adminOnly() {
        require(admin == msg.sender, "Only admins can run this function!");
        _;
    }

    modifier ownerOnly(uint256 ticketId) {
        require(tickets[ticketId].owner == msg.sender);
        _;
    }

    modifier marketTransferCheck(uint256 ticketId) {
        require(tickets[ticketId].owner == tx.origin);
        _;
    }

    modifier validTicket(uint256 ticketId) {
        require(ticketId < numTickets, "This ticket does not exists!");
        _;
    }

    modifier activeTicket(uint256 ticketId) {
        require(
            tickets[ticketId].currState == ticketState.active,
            "This ticket has expired!"
        );
        _;
    }

    function issueTickets(
        uint256 eventId,
        uint256 quantity
    ) public returns (uint256[] memory) {
        require(eventContract.eventIsValid(eventId), "Event does not exists!");
        require(eventContract.eventIsActive(eventId), "Event is not active!");

        eventContract.addSupply(eventId, quantity);

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

    function marketTransfer(uint256 ticketId, address receiver) public marketTransferCheck(ticketId) validTicket(ticketId) activeTicket(ticketId) {
        tickets[ticketId].numberOfOwnershipChanges += 1;
        tickets[ticketId].owner = receiver;
    }

    //TODO: adminOnly?
    function expireTicket(uint256 ticketId) public validTicket(ticketId) activeTicket(ticketId) {
        tickets[ticketId].currState = ticketState.expired;
        emit ticketExpired(ticketId);
    }

    function getTicketOwner(uint256 ticketId) public view validTicket(ticketId) returns (address) {
        return tickets[ticketId].owner;
    }

    function checkOwnershipChangeValidity(uint256 ticketId) public view validTicket(ticketId) returns (bool) {
        return tickets[ticketId].numberOfOwnershipChanges < limitOfOwnershipChange;
    }
}
