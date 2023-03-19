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
        secondaryMarketInstance = await SecondaryMarket.deployed();
    });

    console.log("-- Testing core functions --");

    organizer = accounts[1];
    buyer1 = accounts[2];

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

    });

    it("Transfer Ticket", async () => {

    });

    it("List Ticket on Secondary Market", async () => {

    });

    it("Buy Ticket from Secondary Market", async () => {

    });
});