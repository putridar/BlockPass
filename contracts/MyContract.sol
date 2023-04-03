pragma solidity >= 0.5.0;

// Example Solidity contract
contract MyContract {
  string public data;

  function setData(string memory _data) public {
    data = _data;
  }

  function getData() public view returns (uint256) {
    return 100;
  }
}