import Web3 from 'web3';

const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:8545');

const getWalletAddress = async () => {
    let walletAddress = await web3.eth.requestAccounts();
    walletAddress = walletAddress[0];

    return walletAddress;
}

const getWalletBalance = async (walletAddress) => {
    const balance = await web3.eth.getBalance(walletAddress);
    return balance;
}

export { getWalletAddress, getWalletBalance };