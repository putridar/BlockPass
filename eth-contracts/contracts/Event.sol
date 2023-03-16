pragma solidity ^0.5.0;

contract Event {
    address admin = msg.sender;

    enum eventState { inactive, active, expired }

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

    uint256 numEvents = 0;
    mapping(uint256 => eventStruct) public events;

    modifier adminOnly() {
        require(admin == msg.sender, "Only admins can run this function!");
        _;
    }

    modifier organizerOnly(uint256 eventId) {
        require(events[eventId].organizer == msg.sender);
        _;
    }

    modifier validEvent(uint256 eventId) {
        require(eventId < numEvents);
        _;
    }

    modifier inactiveEvent(uint256 eventId) {
        require(events[eventId].currState == eventState.inactive, "This event has been activated or has expired!");
        _;
    }

    modifier activeEvent(uint256 eventId) {
        require(events[eventId].currState == eventState.active, "This event has not been activated or has expired!");
        _;
    }

    function createEvent(
        string memory title,
        uint256 maxTicketSupply
    ) public returns(uint256) {
        require(keccak256(abi.encodePacked(title)) != keccak256(abi.encodePacked("")), "Event title cannot not be empty!"); //Workaround for string comparison
        require(maxTicketSupply > 0, "Maximum ticket supply must be more than 0!");

        eventStruct memory newEvent = eventStruct(
            numEvents,
            title,
            msg.sender,
            maxTicketSupply,
            0,
            eventState.inactive
        );

        events[numEvents] = newEvent;
        numEvents++;
        return newEvent.eventId;
    }
    
    function addSupply(uint256 eventId, uint256 quantity) public validEvent(eventId) {
        require(events[eventId].currTicketSupply + quantity <= events[eventId].maxTicketSupply, "The requested amount of ticket exceeds the available supply!");
        events[eventId].currTicketSupply = events[eventId].currTicketSupply + quantity;
    }

    function eventIsValid(uint256 eventId) public view returns(bool) {
        return(eventId < numEvents);
    }

    function eventIsActive(uint256 eventId) public view returns(bool) {
        return(events[eventId].currState == eventState.active);
    }

    function activateEvent(uint256 eventId) public organizerOnly(eventId) validEvent(eventId) inactiveEvent(eventId) {
        events[eventId].currState = eventState.active;
    }

    function expireEvent(uint256 eventId) public organizerOnly(eventId) validEvent(eventId) activeEvent(eventId) {
        events[eventId].currState = eventState.expired;
    }
}