pragma solidity ^0.5.0;

import "./Ticket.sol";

contract SecondaryMarket {
    Ticket ticketContract;
    address admin = msg.sender;

    constructor(Ticket ticketContractIn) public {
        ticketContract = ticketContractIn;
    }

    event marketTransaction(uint256 ticketId);

    // WIP
}