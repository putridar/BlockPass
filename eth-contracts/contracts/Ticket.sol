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

    event activated(uint256 ticketId);
    event expired(uint256 ticketId);

    uint256 numTickets = 0;
    mapping(uint256 => ticket) public tickets;

    modifier adminOnly() {
        require(admin == msg.sender, "Only admins can run this function!");
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
    ) public returns (uint256) {
        require(eventContract.eventIsValid(eventId), "Event does not exists!");
        require(eventContract.eventIsActive(eventId), "Event is not active!");
        
        eventContract.addSupply(eventId, quantity);

        for (uint i = 0; i < quantity; i++) {
            ticket memory newTicket = ticket(
                numTickets,
                eventId,
                msg.sender,
                ticketState.active,
                0
            );

            tickets[numTickets] = newTicket;
            numTickets++;
            return newTicket.ticketId;
        }
    }

    function expireTicket(uint256 ticketId) public validTicket(ticketId) activeTicket(ticketId) {
        tickets[ticketId].currState = ticketState.expired;
    }
}
