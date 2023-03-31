// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

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