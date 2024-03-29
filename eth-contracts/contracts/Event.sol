pragma solidity ^0.5.0;

/*
    This contract allows organizers to create and activate
    events. 
    
    Flow:
    1. Create new event
    2. Activate event

    The event automatically expires once its expiry date has passed.
*/
contract Event {
    address admin = msg.sender;

    enum eventState { inactive, active, expired }

    struct eventStruct {
        uint256 eventId;
        string title;
        address organizer;
        uint256 maxTicketSupply; // Max amount of ticket that can be issued
        uint256 currTicketSupply; // Current amount of ticket that has been issued
        uint256 standardPrice; // in ETH
        eventState currState;
        uint256 expiry; // Represents the expiry date of the event (e.g., the date once a multi-day concert ends)
    }

    // An event has been activated
    event eventActivated (uint256 eventId);

    // An event has expired
    event eventExpired (uint256 eventId);

    uint256 numEvents = 0;
    mapping(uint256 => eventStruct) public events;

    uint256[] allEvents;

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
        if (events[eventId].expiry > now) {
            events[eventId].currState = eventState.expired;
            emit eventExpired(eventId);
        }
        require(
            events[eventId].currState == eventState.active,
            "This ticket has expired!"
        );
        _;
    }

    function createEvent(
        string memory title,
        uint256 maxTicketSupply,
        uint256 standardPrice,
        uint256 date
    ) public returns(uint256) {
        require(keccak256(abi.encodePacked(title)) != keccak256(abi.encodePacked("")), "Event title cannot not be empty!"); //Workaround for string comparison
        require(maxTicketSupply > 0, "Maximum ticket supply must be more than 0!");
        require(date > now, "Cannot create an expired event");
        eventStruct memory newEvent = eventStruct(
            numEvents,
            title,
            msg.sender,
            maxTicketSupply,
            0,
            standardPrice,
            eventState.inactive,
            date
        );

        events[numEvents] = newEvent;
        allEvents.push(numEvents);
        numEvents++;
        return newEvent.eventId;
    }

    function getOrganizer(uint256 eventId) public view validEvent(eventId) returns(address) {
        return events[eventId].organizer;
    }
    
    function addSupply(uint256 eventId, uint256 quantity) public validEvent(eventId) {
        require(events[eventId].currTicketSupply + quantity <= events[eventId].maxTicketSupply, "The requested amount of ticket exceeds the available supply!");
        events[eventId].currTicketSupply = events[eventId].currTicketSupply + quantity;
    }

    function getSupply(uint256 eventId) public view validEvent(eventId) returns(uint256) {
        return events[eventId].currTicketSupply;
    }

    function eventIsValid(uint256 eventId) public view returns(bool) {
        return(eventId < numEvents);
    }

    function eventIsActive(uint256 eventId) public view returns(bool) {
        return(events[eventId].currState == eventState.active && events[eventId].expiry > now);
    }

    function activateEvent(uint256 eventId) public organizerOnly(eventId) validEvent(eventId) inactiveEvent(eventId) {
        events[eventId].currState = eventState.active;
        emit eventActivated(eventId);
    }

    function getExpiry(uint256 eventId) public view validEvent(eventId) returns (uint256) {
        return events[eventId].expiry;
    }

    function getEventTitle(uint256 eventId) public view validEvent(eventId) returns(string memory) {
        return events[eventId].title;
    }

    function getStandardPrice(uint256 eventId) public view validEvent(eventId) returns(uint256) {
        return events[eventId].standardPrice;
    }

    function getAllEvents() public view returns (uint256[] memory) {
        return allEvents;
    }
}