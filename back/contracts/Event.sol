pragma solidity ^0.5.0;

contract Event {
    enum eventState {inactive, active, expired}

    struct eventStruct {
        uint256 eventId;
        string title;
        address organizer;
        uint256 maxTicketSupply;
        uint256 currTicketSupply;
        eventState currState;
    }

    event activated (uint256 eventId);
    event expired (uint256 eventId);

    uint256 numEvent = 0;
    mapping(uint256 => eventStruct) public events;

     modifier organizerOnly(uint256 eventId) {
        require(events[eventId].organizer == msg.sender);
        _;
    }

    modifier validEvent(uint256 eventId) {
        require(eventId < numEvent);
        _;
    }

    function add(
        string memory title,
        uint256 maxTicketSupply
    ) public returns(uint256) {
        require(keccak256(abi.encodePacked(title)) != keccak256(abi.encodePacked("")), "Event title cannot not be empty!"); //Workaround for string comparison
        require(maxTicketSupply > 0, "Maximum ticket supply must be more than 0!");

        eventStruct memory newEvent = eventStruct(
            numEvent,
            title,
            msg.sender,
            maxTicketSupply,
            0,
            eventState.inactive
        );

        events[numEvent] = newEvent;
        numEvent++;
        return newEvent.eventId;
    }

    function activateEvent(uint256 eventId) public organizerOnly(eventId) validEvent(eventId) {
        events[eventId].currState = eventState.active;
    }

    function expireEvent(uint256 eventId) public organizerOnly(eventId) validEvent(eventId) {
        events[eventId].currState = eventState.expired;
    }
}