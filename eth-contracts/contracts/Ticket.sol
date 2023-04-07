pragma solidity ^0.5.0;

import "./Event.sol";
import "./TickToken.sol";
import "./BlockTier.sol";

contract Ticket {
    Event eventContract;
    BlockTier blockTierContract;
    TickToken tokenContract;
    uint256 baseIssuanceLimit;
    address admin = msg.sender;

    // Market address for verification
    address market = address(0);

    enum ticketState {
        active,
        used,
        forfeited
    }

    enum userTier {
        bronze,
        silver,
        gold,
        diamond
    }

    struct ticket {
        uint256 ticketId;
        uint256 eventId;
        address owner;
        ticketState currState;
        uint256 numberOfOwnershipChanges;
        uint256 expiry;
    }

    constructor(Event eventContractIn, BlockTier blockTierContractIn, TickToken tokenContractIn, uint256 baseIssuanceLimitIn) public {
        eventContract = eventContractIn;
        blockTierContract = blockTierContractIn;
        tokenContract = tokenContractIn;
        baseIssuanceLimit = baseIssuanceLimitIn;
    }
    
    event ticketIssued(uint256 ticketId);
    event ticketUsed(uint256 ticketId);
    event ticketForfeited(uint256 ticketId);
    event ticketTransfered(uint256 ticketId);
    event tokenRedeemed(uint256 token);
    event debug(string str);

    uint256 numTickets = 0;
    uint256 numDiscounts = 0;
    uint256 limitOfOwnershipChange = 1;
    uint256 baseDiscount = 200;
    mapping(uint256 => ticket) public tickets;
    mapping(uint256 => mapping(address => uint256)) ticketsIssued; // Event ID => User ID => Number of tickets issued

    mapping(address => uint256) public noOfTransactions; //Tracking how many transactions each user made
    mapping(address => userTier) public userTiers; //Tracking each user's tier
    mapping(uint256 => uint256) public maxMintLimit; //Maximum ticket minting limit for each tier || NEED TO INITIALIZE!!!

    uint256 oneEth = 1000000000000000000;

    modifier adminOnly() {
        require(admin == msg.sender, "Only admins can run this function!");
        _;
    }

    modifier ownerOnly(uint256 ticketId) {
        require(tickets[ticketId].owner == msg.sender);
        _;
    }

    modifier marketTransferCheck() {
        require(market == msg.sender);
        _;
    }

    modifier validTicket(uint256 ticketId) {
        require(ticketId < numTickets, "This ticket does not exists!");
        _;
    }

    modifier activeTicket(uint256 ticketId) {
        if (eventContract.getExpiry(tickets[ticketId].eventId) < now && tickets[ticketId].currState == ticketState.active) {
            tickets[ticketId].currState = ticketState.forfeited;
            emit ticketForfeited(ticketId);
        }
        require(
            tickets[ticketId].currState == ticketState.active,
            "This ticket has been used or forfeited!"
        );
        _;
    }

    function issueTickets(
        uint256 eventId,
        uint256 quantity,
        bool redeem,
        uint256 tokenToBeRedeemed
    ) public payable returns (uint256[] memory) {
        require(eventContract.eventIsValid(eventId), "Event does not exists!");
        require(eventContract.eventIsActive(eventId), "Event is not active or has expired!");
        require(!redeem || (redeem && tokenToBeRedeemed != 0), "Token to be redeemed cannot be 0");
        require(!redeem || (redeem && (tokenContract.checkCredit(msg.sender) >= tokenToBeRedeemed)), "User does not have sufficient token");
        require(checkTicketsIssued(eventId, msg.sender, quantity), "This user has hit their ticket issuance limit!");
        emit debug("require");
        uint256 standardPrice = eventContract.getStandardPrice(eventId);
        uint256 totalPrice = standardPrice * quantity;
        emit debug("standard");
        require(msg.value >= totalPrice * oneEth, "Insufficient funds to buy this ticket!");

        // Add supply first to "reserve" the tickets; minimize potential shenanigans if multiple users buy tickets at the same time
        eventContract.addSupply(eventId, quantity);
        emit debug("add supply");
        // Records additional tickets that have been issued for this user
        ticketsIssued[eventId][msg.sender]+= quantity;
        blockTierContract.addTicketsBought(msg.sender, quantity);
        emit debug("add ticketbought");
        address payable recipient = address(uint160(eventContract.getOrganizer(eventId)));
        uint256 price = totalPrice * oneEth;
        if (redeem) {
            price = price * (1 - (tokenToBeRedeemed/baseDiscount));
            tokenContract.transferCredit(msg.sender, recipient, tokenToBeRedeemed);
            emit tokenRedeemed(tokenToBeRedeemed);
        }
        recipient.transfer(price);
        emit debug("transfer");
        //Commission fee for ticket sales?

        uint256[] memory res = new uint256[](quantity);

        for(uint i = 0; i < quantity; i++) {
            ticket memory newTicket = ticket(
                numTickets,
                eventId,
                msg.sender,
                ticketState.active,
                0,
                eventContract.getExpiry(eventId)
            );

            tickets[numTickets] = newTicket;
            res[i] = numTickets;
            numTickets++;
        }

        // Update the #transactions of the user
        uint256 totalTransactions = noOfTransactions[msg.sender] + quantity;
        noOfTransactions[msg.sender] = totalTransactions;
        emit debug("update");
        // Give tokens (part of loyalty program)
        tokenContract.mintToken(msg.sender, quantity);

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

    function useTicket(uint256 ticketId) public validTicket(ticketId) activeTicket(ticketId) {
        tickets[ticketId].currState = ticketState.used;
        emit ticketUsed(ticketId);
    }

    function marketTransfer(uint256 ticketId, address receiver) public marketTransferCheck() validTicket(ticketId) activeTicket(ticketId) {
        tickets[ticketId].numberOfOwnershipChanges += 1;
        tickets[ticketId].owner = receiver;
    }

    function getTicketOwner(uint256 ticketId) public view validTicket(ticketId) returns (address) {
        return tickets[ticketId].owner;
    }

    function checkOwnershipChangeValidity(uint256 ticketId) public view validTicket(ticketId) returns (bool) {
        return tickets[ticketId].numberOfOwnershipChanges < limitOfOwnershipChange;
    }

    // Sets the market address
    function setMarket(address marketIn) public {
        market = marketIn;
    }

    function getToken(address user) public view returns (uint256) {
        return tokenContract.checkCredit(user);
    }
    
    function checkTicketsIssued(uint256 eventId, address purchaser, uint256 quantity) public view returns (bool) {
        uint256 currentQuantity = ticketsIssued[eventId][purchaser];
        uint256 additionalLimit = blockTierContract.getAdditionalIssuanceLimit(purchaser);

        if (currentQuantity + quantity > baseIssuanceLimit + additionalLimit) {
            return false;
        }

        return true;
    }
}
