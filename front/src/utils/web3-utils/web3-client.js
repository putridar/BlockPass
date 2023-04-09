import Web3 from 'web3';
import TicketAbi from './abis/Ticket.json';
import EventAbi from './abis/Event.json';
import { ethers } from "ethers";

const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:7545');
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const ticket_address = "0x1632554B04d418B14987A3169a0775D160dA6935";
const event_address = "0xBEEBC3c59a712025c563FfdC82b25C729D7E79Ce";
const ticket_instance = new ethers.Contract(ticket_address, TicketAbi.abi, signer);
const event_instance = new ethers.Contract(event_address, EventAbi.abi, signer);

const createEvent = async (title, maxTicketSupply, standardPrice, date) => {
    try {
        const parsedDate = Date.parse(date);
        console.log(parsedDate)
        await event_instance.createEvent(title, parseInt(maxTicketSupply), parseInt(standardPrice), parsedDate);
    } catch (error) {
        console.error(error);
    }
}

const getAllEvents = async () => {
    const events = await event_instance.getAllEvents(); 
    return events.map((eventId) => Number(eventId._hex));
}

const getEventInfo = async (eventId) => {
    
    const eventTitle = await event_instance.getEventTitle(parseInt(eventId));
    console.log("HERE EVENT ID" , eventTitle)
    const expiredDate = await event_instance.getExpiry(eventId);
    
    
    const standardPrice = await event_instance.getStandardPrice(eventId);
    
    
    const res =  [eventTitle, Number(expiredDate._hex)/ 10000, Number(standardPrice._hex)];
    
    return res;
}

const getWalletAddress = async () => {
    let walletAddress = await web3.eth.requestAccounts();
    walletAddress = walletAddress[0];

    return walletAddress;
}

const getWalletBalance = async (walletAddress) => {
    const balance = await web3.eth.getBalance(walletAddress);
    return balance;
}

export { getWalletAddress, getWalletBalance, createEvent, getAllEvents, getEventInfo };