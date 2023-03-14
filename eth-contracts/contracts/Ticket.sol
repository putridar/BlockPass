pragma solidity ^0.5.0;

contract Ticket {
    enum ticketState { active, expired }

    struct ticket {
        uint256 ticketId;
        uint256 eventId;
        address owner;
        ticketState currState;
        uint256 numberOfOwnershipChanges;
    }

    
}