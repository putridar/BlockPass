const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider("http://localhost:7545"); // Change to the correct RPC endpoint
const web3 = new Web3(provider);

var Event = artifacts.require("../contracts/Event.sol");
var Ticket = artifacts.require("../contracts/Ticket.sol");
var SecondaryMarket = artifacts.require("../contracts/SecondaryMarket.sol");

contract('Loyalty Programs', function (accounts) {
    before(async () => {
        eventInstance = await Event.deployed();
        ticketToken = await TicketToken.deployed();
        blockTierInstance = await BlockTier.deployed();
        ticketInstance = await Ticket.deployed();
        secondaryMarketInstance = await SecondaryMarket.deployed();
    });

    organizer = accounts[1];
    buyer1 = accounts[2];
    buyer2 = accounts[3];
    buyer3 = accounts[4];
    buyer4 = accounts[5];
    oneEth = 1000000000000000000;

    it("Test A", async () => {
        
    });
});