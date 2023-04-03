const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');


var Event = artifacts.require("../contracts/Event.sol");
var BlockTier = artifacts.require("../contracts/BlockTier.sol");
var Ticket = artifacts.require("../contracts/Ticket.sol");
var SecondaryMarket = artifacts.require("../contracts/SecondaryMarket.sol");

contract('Core', function (accounts) {
    before(async () => {
        eventInstance = await Event.deployed();
        blockTierInstance = await BlockTier.deployed();
        ticketInstance = await Ticket.deployed();
        secondaryMarketInstance = await SecondaryMarket.deployed();
    });

    console.log("-- Testing core functions --");

    organizer = accounts[1];
    buyer1 = accounts[2];
    buyer2 = accounts[3];
    buyer3 = accounts[4];
    buyer4 = accounts[5];
    oneEth = 1000000000000000000;

    it("Create New Event", async () => {
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

        await eventInstance.createEvent("Katy Perry's Concert", 1000, 2, expiry, { from: organizer });

        let eventTitle1 = await eventInstance.getEventTitle(0);
        assert.strictEqual(eventTitle1, "Katy Perry's Concert", "The event title does not match!");

        await eventInstance.createEvent("BTS Concert", 1000, 2, expiry, { from: organizer });

        let eventTitle2 = await eventInstance.getEventTitle(1);
        assert.strictEqual(eventTitle2, "BTS Concert", "The event title does not match!");
    });

    it("Activate Event", async () => {
        let activate = await eventInstance.activateEvent(0, { from: organizer });
        truffleAssert.eventEmitted(activate, "eventActivated");

        let eventIsActive = await eventInstance.eventIsActive(0);
        assert.strictEqual(eventIsActive, true, "Event is not activated!");
    });

    it("Issue New Ticket", async () => {
        let currSupply = await eventInstance.getSupply(0);

        truffleAssert.reverts(
            ticketInstance.issueTickets(100, 2, { from: buyer1 }),
            "Event does not exists!"
        );

        truffleAssert.reverts(
            ticketInstance.issueTickets(1, 2, { from: buyer1 }),
            "Event is not active or has expired!"
        );

        truffleAssert.reverts(
            ticketInstance.issueTickets(0, 2, { from: buyer1, value: 1 * oneEth }),
            "Insufficient funds to buy this ticket!"
        )

        let issue = await ticketInstance.issueTickets(0, 2, { from: buyer1, value: 4 * oneEth });
        truffleAssert.eventEmitted(issue, "ticketIssued");

        let eventSupply = await eventInstance.getSupply(0);
        assert.strictEqual(eventSupply.toNumber(), currSupply.toNumber() + 2, "Tickets are not issued!");
    });

    it("Issue Ticket beyond base limit", async () => {
        truffleAssert.reverts(
            ticketInstance.issueTickets(0, 2, { from: buyer1, value: 4 * oneEth }), 
            "This user has hit their ticket issuance limit!"
        );
    });

    it("Check BlockTier loyalty program", async () => {
        let initialAdditionalIssuanceLimit = await blockTierInstance.getAdditionalIssuanceLimit(buyer4);
        assert.strictEqual(initialAdditionalIssuanceLimit.words[0], 0, "The tiers are not initialized correctly!");

        const now = new Date();
        const expiry = Math.floor(now.getTime() / 1000) + 100000;
        await eventInstance.createEvent("Burner Event 1", 1000, 2, expiry, { from: organizer });
        await eventInstance.activateEvent(2, { from: organizer });

        await eventInstance.createEvent("Burner Event 2", 1000, 2, expiry, { from: organizer });
        await eventInstance.activateEvent(3, { from: organizer });

        await eventInstance.createEvent("Burner Event 3", 1000, 2, expiry, { from: organizer });
        await eventInstance.activateEvent(4, { from: organizer });

        await eventInstance.createEvent("Burner Event 4", 1000, 2, expiry, { from: organizer });
        await eventInstance.activateEvent(5, { from: organizer });

        await ticketInstance.issueTickets(2, 2, { from: buyer4, value: 4 * oneEth });
        await ticketInstance.issueTickets(3, 2, { from: buyer4, value: 4 * oneEth });
        await ticketInstance.issueTickets(4, 2, { from: buyer4, value: 4 * oneEth });
        await ticketInstance.issueTickets(5, 2, { from: buyer4, value: 4 * oneEth });

        let finalAdditionalIssuanceLimit = await blockTierInstance.getAdditionalIssuanceLimit(buyer4);
        assert.strictEqual(finalAdditionalIssuanceLimit.words[0], 2, "The tiers are not upgraded correctly!");
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
            secondaryMarketInstance.list(1, 2, { from: buyer2 }),
            "Ticket is not owned by this owner"
        );
        await truffleAssert.reverts(
            secondaryMarketInstance.list(0, 2, { from: buyer2 }),
            "This ticket cannot be sold due to the limit on changes of ownership!"
        );
        await secondaryMarketInstance.list(1, 2, { from: buyer1 });
        let listingPrice = await secondaryMarketInstance.checkPrice(1);
        assert.equal(listingPrice.words[0], 3, "Ticket was not listed at the expected price");

    });

    //TODO: Check ETH balances of admin, buyer1, and buyer2, if possible
    it("Buy Ticket from Secondary Market", async () => {
        await truffleAssert.reverts(
            secondaryMarketInstance.buy(0, {from: buyer3, value: oneEth }),
            "Ticket has not been listed!"
        );

        await truffleAssert.reverts(
            secondaryMarketInstance.buy(1, {from: buyer1, value: oneEth }),
            "You cannot buy your own ticket!"
        );

        await truffleAssert.reverts(
            secondaryMarketInstance.buy(1, {from: buyer2, value: oneEth }),
            "You do not have sufficient funds!"
        );

        await secondaryMarketInstance.buy(1, { from: buyer2, value: 3 * oneEth });
        let newOwner = await ticketInstance.getTicketOwner(1)
        assert.equal(newOwner, buyer2, "Ticket ownership has not changed!");
    });
});