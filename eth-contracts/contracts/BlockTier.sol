pragma solidity ^0.5.0;

/* 
    BlockTier is one of two components that make up the loyalty program.
    In essence, based on the number of tickets he/she has bought,
    a user can increase the max number of tickets he/she can buy for any event. 

    By default, a user needs to buy 8 tickets to advance to the next "tier" and
    each tier increases the max number of ticket by 2.
    These two numbers are set when deploying the contract.
*/
contract BlockTier {
    address admin = msg.sender;

    event tierUpgrade(address user);

    enum tier {
        bronze,
        silver,
        gold,
        diamond
    }

    uint256 tierRange;
    uint256 additionalIssuanceCapacity;
    mapping(address => uint256) ticketsBought;
    mapping(address => tier) userTiers;

    constructor(uint256 tierRangeIn, uint256 additionalIssuanceCapacityIn) public {
        tierRange = tierRangeIn;
        additionalIssuanceCapacity = additionalIssuanceCapacityIn;
    }

    modifier adminOnly() {
        require(admin == msg.sender, "Only admins can run this function!");
        _;
    }

    function addTicketsBought(address user, uint256 quantity) public {
        ticketsBought[user] += quantity;

        if (ticketsBought[user] >= 3 * tierRange) {
            userTiers[user] = tier.diamond;
        } else if (ticketsBought[user] >= 2 * tierRange) {
            userTiers[user] = tier.gold;
        } else if (ticketsBought[user] >= tierRange) {
            userTiers[user] = tier.silver;
        }
    }

    function getAdditionalIssuanceLimit(address user) public view returns(uint256) {
        if (userTiers[user] == tier.diamond) {
            return 3 * additionalIssuanceCapacity;
        } else if (userTiers[user] == tier.gold) {
            return 2 * additionalIssuanceCapacity;
        } else if (userTiers[user] == tier.silver) {
            return additionalIssuanceCapacity;
        } else {
            return 0;
        }
    }
}