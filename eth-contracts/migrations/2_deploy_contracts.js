const Event = artifacts.require("Event");
const BlockTier = artifacts.require("BlockTier");
const Ticket = artifacts.require("Ticket");
const SecondaryMarket = artifacts.require("SecondaryMarket");

module.exports = (deployer, network, accounts) => {
  deployer
  .deploy(Event)
  .then(function() {
    return deployer.deploy(BlockTier, 8, 2); 
    // Each tier has a range of 8 - e.g., all users are initially in Bronze tier, after they bought 8 tickets they are upgraded to Silver
    // Each new tier has an additional mint limit of 2 - e.g., Bronze can mint an 2 ADDITIONAL tickets, Silver can mint an 4 ADDITIONAL tickets
  })
  .then(function() {
    return deployer.deploy(Ticket, Event.address, BlockTier.address, 2);
  })
  .then(function() {
    return deployer.deploy(SecondaryMarket, Ticket.address, 1);
  });
};