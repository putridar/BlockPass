const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider("http://localhost:7545"); // Change to the correct RPC endpoint
const web3 = new Web3(provider);

var Event = artifacts.require("../contracts/Event.sol");
var BlockTier = artifacts.require("../contracts/BlockTier.sol");
var Ticket = artifacts.require("../contracts/Ticket.sol");
var TickToken = artifacts.require("../contracts/TickToken");

contract('Loyalty Programs', function (accounts) {
    before(async () => {
        eventInstance = await Event.deployed();
        tickToken = await TickToken.deployed();
        blockTierInstance = await BlockTier.deployed();
        ticketInstance = await Ticket.deployed();
    });

    organizer = accounts[1];
    user1 = accounts[2];
    user2 = accounts[3];
    oneEth = 1000000000000000000;

    it("BlockTier initializes every user at the first tier (Bronze)", async () => {
        let initialAdditionalIssuanceLimit = await blockTierInstance.getAdditionalIssuanceLimit(user1);
        assert.strictEqual(initialAdditionalIssuanceLimit.words[0], 0, "The tiers are not initialized correctly!");
    });

    it("After a user purchases 8 tickets, the max amount of ticket that user can buy is increased by 2 ", async () => {
        let initialAdditionalIssuanceLimit = await blockTierInstance.getAdditionalIssuanceLimit(user1);
        assert.strictEqual(initialAdditionalIssuanceLimit.words[0], 0, "The tiers are not initialized correctly!");

        const now = new Date();
        const expiry = Math.floor(now.getTime() / 1000) + 100000;

        await eventInstance.createEvent("Burner Event 1", 1000, 2, expiry, { from: organizer });
        await eventInstance.activateEvent(0, { from: organizer });

        await eventInstance.createEvent("Burner Event 2", 1000, 2, expiry, { from: organizer });
        await eventInstance.activateEvent(1, { from: organizer });

        await eventInstance.createEvent("Burner Event 3", 1000, 2, expiry, { from: organizer });
        await eventInstance.activateEvent(2, { from: organizer });

        await eventInstance.createEvent("Burner Event 4", 1000, 2, expiry, { from: organizer });
        await eventInstance.activateEvent(3, { from: organizer });

        await ticketInstance.issueTickets(0, 2, 0, { from: user1, value: 4 * oneEth });

        truffleAssert.reverts(
            ticketInstance.issueTickets(0, 2, 0, { from: user1, value: 4 * oneEth }), 
            "This user has hit their ticket issuance limit!"
        );

        await ticketInstance.issueTickets(1, 2, 0, { from: user1, value: 4 * oneEth });
        await ticketInstance.issueTickets(2, 2, 0, { from: user1, value: 4 * oneEth });
        await ticketInstance.issueTickets(3, 2, 0, { from: user1, value: 4 * oneEth });

        let finalAdditionalIssuanceLimit = await blockTierInstance.getAdditionalIssuanceLimit(user1);
        assert.strictEqual(finalAdditionalIssuanceLimit.words[0], 2, "The tiers are not upgraded correctly!");

        await ticketInstance.issueTickets(0, 2, 0, { from: user1, value: 4 * oneEth });
    });

    it("For every ticket purchased, the user receives 1 TickToken", async () => {
        await ticketInstance.issueTickets(0, 2, 0, { from: user2, value: 4 * oneEth });

        let token = await ticketInstance.getToken(user2)
        assert.equal(token, 2, "Incorrect token update");
    });

    it("User can redeem TickTokens to get discounts when purchasing tickets", async () => {
        await truffleAssert.reverts(
            ticketInstance.issueTickets(0, 1, 100, {from: user2, value: 2 * oneEth} ),
            "User does not have sufficient token"
        );

        let buy = await ticketInstance.issueTickets(1, 1, 2, {from: user2, value: 2 * oneEth} );
        truffleAssert.eventEmitted(buy, "ticketIssued");
        truffleAssert.eventEmitted(buy, "tokenRedeemed");
        
        // Every ticket purchased will provide the user with 1 token, regardless if that ticket was purchased with or without discounts
        const credit = await tickToken.checkCredit(user2);
        assert.equal(credit.toNumber(), 1, "Incorrect token deducted");
    });
});