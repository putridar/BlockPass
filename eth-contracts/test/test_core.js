const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');


var Event = artifacts.require("../contracts/Event.sol");
var Ticket = artifacts.require("../contracts/Ticket.sol");
var SecondaryMarket = artifacts.require("../contracts/SecondaryMarket.sol");

contract('Core', function (accounts) {
    before(async () => {
        eventInstance = await Event.deployed();
        ticketInstance = await Ticket.deployed();
        secondaryMarketInstance = await SecondaryMarket.deployed(ticketInstance.address, 10);
    });

    console.log("-- Testing core functions --");

    organizer = accounts[1];
    buyer1 = accounts[2];
    buyer2 = accounts[3];

    it("Create New Event", async () => {
        truffleAssert.reverts(
            eventInstance.createEvent("", 100, { from: organizer }),
            "Event title cannot not be empty!"
        );

        truffleAssert.reverts(
            eventInstance.createEvent("Katy Perry's Concert", 0, { from: organizer }),
            "Maximum ticket supply must be more than 0!"
        );

        await eventInstance.createEvent("Katy Perry's Concert", 1000, { from: organizer });

        let eventTitle = await eventInstance.getEventTitle(0);
        assert.strictEqual(eventTitle, "Katy Perry's Concert", "The event title does not match!");
    });

    it("Activate Event", async () => {
        let activate = await eventInstance.activateEvent(0, { from: organizer });
        truffleAssert.eventEmitted(activate, "eventActivated");

        let eventIsActive = await eventInstance.eventIsActive(0);
        assert.strictEqual(eventIsActive, true, "Event is not activated!");
    });

    it("Issue New Ticket", async () => {
        let currSupply = await eventInstance.getSupply(0);
        let issue = await ticketInstance.issueTickets(0, 10, { from: buyer1 });
        truffleAssert.eventEmitted(issue, "ticketIssued");

        let eventSupply = await eventInstance.getSupply(0);
        assert.strictEqual(eventSupply.toNumber(), currSupply.toNumber() + 10, "Tickets are not issued!");
    });

    it("Transfer Ticket", async () => {
        await truffleAssert.reverts(
            ticketInstance.transfer(0, buyer1, { from: buyer1 }),
            "Cannot transfer ticket to yourself!"
        );
        let transfer2 = await ticketInstance.transfer(0, buyer2, { from: buyer1 });
        truffleAssert.eventEmitted(transfer2, "ticketTransfered");
        let owner = await ticketInstance.getTicketOwner(0, { from: buyer2 });
        assert.strictEqual(owner, buyer2, "Ticket is not transfered!");
    });

    it("Check Ticket can only be transfered once", async () => {
        await truffleAssert.reverts(
            ticketInstance.transfer(0, buyer1, { from: buyer2 }), 
            "This ticket's ownership has been changed once before!"
        );
    });

    it("List Ticket on Secondary Market", async () => {
        await truffleAssert.reverts(
            secondaryMarketInstance.list(1, 100, { from: buyer2 }),
            "Ticket is not owned by this owner"
        );
        await truffleAssert.reverts(
            secondaryMarketInstance.list(0, 100, { from: buyer2 }),
            "This ticket cannot be sold due to the limit on changes of ownership!"
        );
        await secondaryMarketInstance.list(1, 100, { from: buyer1 });
        let listingPrice = await secondaryMarketInstance.listings(1);

        assert.equal(listingPrice, 100, "Ticket was not listed at the expected price");

    });

    it("Buy Ticket from Secondary Market", async () => {

    });
});