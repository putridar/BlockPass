pragma solidity ^0.5.0;

import "./Event.sol";

contract Ticket {
    Event eventContract;
    address admin = msg.sender;

    enum ticketState { active, expired }

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
    
    mapping (uint256 => ticket) public tickets;
}