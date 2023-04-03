pragma solidity ^0.5.0;

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
    mapping(address => tier) userTiers;

    modifier adminOnly() {
        require(admin == msg.sender, "Only admins can run this function!");
        _;
    }

    constructor(uint256 tierRangeIn, uint256 additionalIssuanceCapacityIn) public {
        tierRange = tierRangeIn;
        additionalIssuanceCapacity = additionalIssuanceCapacityIn;
    }
}