const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider("http://localhost:7545"); // Change to the correct RPC endpoint
const web3 = new Web3(provider);

var Event = artifacts.require("../contracts/Event.sol");
var Ticket = artifacts.require("../contracts/Ticket.sol");
var SecondaryMarket = artifacts.require("../contracts/SecondaryMarket.sol");

contract('Secondary Market', function (accounts) {
    before(async () => {
        eventInstance = await Event.deployed();
        ticketInstance = await Ticket.deployed();
        secondaryMarketInstance = await SecondaryMarket.deployed();
    });

    organizer = accounts[1];
    user1 = accounts[2];
    user2 = accounts[3];
    oneEth = 1000000000000000000;

    it("List a purchased ticket on the Secondary Market", async () => {
        const now = new Date();
        const expiry = Math.floor(now.getTime() / 1000) + 100000;

        await eventInstance.createEvent("Burner Event 1", 1000, 2, expiry, { from: organizer });
        await eventInstance.activateEvent(0, { from: organizer });

        await ticketInstance.issueTickets(0, 2, 0, { from: user1, value: 4 * oneEth });

        await truffleAssert.reverts(
            secondaryMarketInstance.list(0, 3, { from: user2 }),
            "Ticket is not owned by this owner"
        );

        await secondaryMarketInstance.list(0, 3, { from: user1 });
        
        // Listing price includes commission fee
        let listingPrice = await secondaryMarketInstance.checkPrice(0);
        assert.equal(listingPrice.words[0], 4, "Ticket was not listed at the expected price");
    });

    it("Buy a ticket from the secondary market", async () => {
        await truffleAssert.reverts(
            secondaryMarketInstance.buy(1, {from: user2, value: oneEth }),
            "Ticket has not been listed!"
        );

        await truffleAssert.reverts(
            secondaryMarketInstance.buy(0, {from: user1, value: oneEth }),
            "You cannot buy your own ticket!"
        );

        await truffleAssert.reverts(
            secondaryMarketInstance.buy(0, {from: user2, value: oneEth }),
            "You do not have sufficient funds!"
        );

        await secondaryMarketInstance.buy(0, { from: user2, value: 4 * oneEth });

        let newOwner = await ticketInstance.getTicketOwner(0)
        assert.equal(newOwner, user2, "Ticket ownership has not changed!");
    });

    it("Attempt to re-list a secondhand ticket bought from another user in the secondary market fails", async () => {
        await truffleAssert.reverts(
            secondaryMarketInstance.list(0, 3, { from: user2 }),
            "This ticket cannot be sold due to the limit on changes of ownership!"
        );
    });
});