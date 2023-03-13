pragma solidity ^0.5.0;

contract Event {
    enum eventState {inactive, active, expired}

    struct eventStruct {
        uint256 eventId;
        string title;
        address organizer;
        uint256 maxTicketSupply;
        uint256 currTicketSupply;
    }

    event activated (uint256 eventId);
    event expired (uint256 eventId);

    uint256 numEvent = 0;
    mapping(uint256 => eventStruct) public events;

}