const Event = artifacts.require("Event");
const BlockTier = artifacts.require("BlockTier");
const Ticket = artifacts.require("Ticket");
const SecondaryMarket = artifacts.require("SecondaryMarket");

module.exports = (deployer, network, accounts) => {
  deployer
  .deploy(Event)
  .then(function() {
    return deployer.deploy(BlockTier, 8, 2);
  })
  .then(function() {
    return deployer.deploy(Ticket, Event.address, BlockTier.address, 2);
  })
  .then(function() {
    return deployer.deploy(SecondaryMarket, Ticket.address, 1);
  });
};