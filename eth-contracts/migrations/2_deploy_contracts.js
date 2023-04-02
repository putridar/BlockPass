const Event = artifacts.require("Event");
const Ticket = artifacts.require("Ticket");
const SecondaryMarket = artifacts.require("SecondaryMarket");
const TicketToken = artifacts.require("TickToken");

module.exports = (deployer, network, accounts) => {
  deployer
  .deploy(Event)
  .then(function() {
    return deployer.deploy(TicketToken);
  })
  .then(function() {
    return deployer.deploy(Ticket, Event.address, TicketToken.address);
  })
  .then(function() {
    return deployer.deploy(SecondaryMarket, Ticket.address, 1);
  });
};