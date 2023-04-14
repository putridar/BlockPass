const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider("http://localhost:7545"); // Change to the correct RPC endpoint
const web3 = new Web3(provider);


var Event = artifacts.require("../contracts/Event.sol");
var Ticket = artifacts.require("../contracts/Ticket.sol");

/* 
    Tests the core functionalities of BlockPass, including
    1. Event creation by organizer
    2. Event activation by organizer
    3. Ticket purchase by user
    4. Ticket transfer from one user to another
*/
contract('Core Functionalities', function (accounts) {
    before(async () => {
        eventInstance = await Event.deployed();
        ticketInstance = await Ticket.deployed();
    });

    organizer = accounts[1];
    user1 = accounts[2];
    user2 = accounts[3];
    oneEth = 1000000000000000000;

    it("Create new events", async () => {
        const now = new Date();
        const expiry = Math.floor(now.getTime() / 1000) + 100000;

        truffleAssert.reverts(
            eventInstance.createEvent("", 100, 2, expiry, { from: organizer }),
            "Event title cannot not be empty!"
        );

        truffleAssert.reverts(
            eventInstance.createEvent("Katy Perry's Concert", 0, 2, expiry, { from: organizer }),
            "Maximum ticket supply must be more than 0!"
        );

        truffleAssert.reverts(
            eventInstance.createEvent("Katy Perry's Concert", 1000, 2, Math.floor(now.getTime() / 1000) - 10000, { from: organizer }),
            "Cannot create an expired event"
        );

        // Create event #1: "Katy Perry's Concert"
        await eventInstance.createEvent("Katy Perry's Concert", 1000, 2, expiry, { from: organizer });

        let eventTitle1 = await eventInstance.getEventTitle(0);
        assert.strictEqual(eventTitle1, "Katy Perry's Concert", "The event title does not match!");
        
        // Create event #2: "BTS Concert"
        await eventInstance.createEvent("BTS Concert", 1000, 2, expiry, { from: organizer });

        let eventTitle2 = await eventInstance.getEventTitle(1);
        assert.strictEqual(eventTitle2, "BTS Concert", "The event title does not match!");
    });

    it("Activate an event", async () => {
        // Activate Katy Perry's Concert
        let activate = await eventInstance.activateEvent(0, { from: organizer });
        truffleAssert.eventEmitted(activate, "eventActivated");

        let eventIsActive = await eventInstance.eventIsActive(0);
        assert.strictEqual(eventIsActive, true, "Event is not activated!");
    });

    it("Issue new Ticket", async () => {
        let currSupply = await eventInstance.getSupply(0);

        truffleAssert.reverts(
            ticketInstance.issueTickets(100, 2, 0, { from: user1 }),
            "Event does not exists!"
        );

        truffleAssert.reverts(
            ticketInstance.issueTickets(1, 2, 0, { from: user1 }),
            "Event is not active or has expired!"
        );

        truffleAssert.reverts(
            ticketInstance.issueTickets(0, 2, 0, { from: user1, value: 1 * oneEth }),
            "Insufficient funds to buy this ticket!"
        )
        
        // User 1 buys 2 tickets for Katy Perry's Concert, priced at 2 ETH each
        let issue = await ticketInstance.issueTickets(0, 2, 0, { from: user1, value: 4 * oneEth });
        truffleAssert.eventEmitted(issue, "ticketIssued");
        
        // Checks that the supply of tickets for the event has been correctly deducted
        let eventSupply = await eventInstance.getSupply(0);
        assert.strictEqual(eventSupply.toNumber(), currSupply.toNumber() + 2, "Tickets are not issued!");

        let tickets = await ticketInstance.getOwnedTickets(user1);
        assert.equal(tickets[0], 0, "Ticket is not issued!")
    });

    it("Attempt to issue Ticket beyond base limit fails", async () => {
        // To minimize scalping, each user can only buy 2 tickets for each event (limit is set when deploying Ticket.sol)
        truffleAssert.reverts(
            ticketInstance.issueTickets(0, 2, 0, { from: user1, value: 4 * oneEth }), 
            "This user has hit their ticket issuance limit!"
        );
    });

    it("Transfer Ticket to another user", async () => {
        await truffleAssert.reverts(
            ticketInstance.transfer(0, user1, { from: user1 }),
            "Cannot transfer ticket to yourself!"
        );

        let transfer = await ticketInstance.transfer(0, user2, { from: user1 });
        truffleAssert.eventEmitted(transfer, "ticketTransfered");

        let owner = await ticketInstance.getTicketOwner(0, { from: user2 });
        assert.strictEqual(owner, user2, "Ticket is not transfered!");
    });

    it("Attempt to transfer a ticket that has previously changed hands fails", async () => {
        await truffleAssert.reverts(
            ticketInstance.transfer(0, user1, { from: user2 }), 
            "This ticket's ownership has been changed once before!"
        );
    });
});