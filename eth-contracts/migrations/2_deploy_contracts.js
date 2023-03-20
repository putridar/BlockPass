const Event = artifacts.require("Event");
const Ticket = artifacts.require("Ticket");
const SecondaryMarket = artifacts.require("SecondaryMarket");

module.exports = (deployer, network, accounts) => {
  deployer
  .deploy(Event)
  .then(function() {
    return deployer.deploy(Ticket, Event.address);
  })
  .then(function() {
    return deployer.deploy(SecondaryMarket, Ticket.address, 10);
  });
};