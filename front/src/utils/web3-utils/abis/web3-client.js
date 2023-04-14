import Web3 from 'web3';
import TicketAbi from './abis/Ticket.json';
import EventAbi from './abis/Event.json';
import MarketAbi from './abis/SecondaryMarket.json';
import { ethers } from "ethers";

const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:7545');
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const ticket_address = process.env.REACT_APP_TICKET_ADDRESS;
const event_address = process.env.REACT_APP_EVENT_ADDRESS;
const market_address= process.env.REACT_APP_MARKET_ADDRESS;
const ticket_instance = new ethers.Contract(ticket_address, TicketAbi.abi, signer);
const event_instance = new ethers.Contract(event_address, EventAbi.abi, signer);
const market_instance = new ethers.Contract(market_address, MarketAbi.abi, signer);

const oneEth = BigInt(1000000000000000000);

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
    const expiredDate = await event_instance.getExpiry(eventId);
    
    var dateFormat= new Date(parseInt(expiredDate));
    const date = dateFormat.getDate() + "/" + dateFormat.getMonth() + "/" + dateFormat.getFullYear(); 
    const standardPrice = await event_instance.getStandardPrice(eventId);
    const res =  [eventId, eventTitle, date, Number(standardPrice._hex)];
    
    return res;
}

const getTicketInfo = async (ticketId) => {
    
    const eventId = await ticket_instance.getEventId(ticketId);
    const eventTitle = await event_instance.getEventTitle(eventId);
    const expiredDate = await event_instance.getExpiry(eventId);    

    var dateFormat= new Date(parseInt(expiredDate));
    const date = dateFormat.getDate() + "/" + dateFormat.getMonth() + "/" + dateFormat.getFullYear(); 
    const standardPrice = await event_instance.getStandardPrice(eventId);
    const askingPrice = await market_instance.checkPrice(ticketId);
    
    const res =  [ticketId, eventTitle, date, Number(standardPrice._hex), Number(askingPrice._hex)];
    
    return res;
}

const getOwnedTickets = async (walletAddress) => {
    const tickets = await ticket_instance.getOwnedTickets();

    return tickets;
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

const getListedTickets = async () => {
    const listed = await market_instance.getAllListings();
    console.log("listed is ", listed);
    return listed.map((ticketId) => Number(ticketId.toNumber()));
}


const buyTicketMarket = async (ticketId, offeredPrice) => {
    await market_instance.buy(ticketId, {value: oneEth * BigInt(offeredPrice)});
    console.log("Buy Ticket ", ticketId, "from Market");
}

const sellTicketMarket = async (ticketId, askingPrice) => {
    await market_instance.list(ticketId, askingPrice);
    console.log("List Ticket ", ticketId, "to Market");
}

const buyTicketFromOrganizer = async (eventId, ticketQty, buyingPrice) => {

    // console.log("Hello"); 

    const isActive = await event_instance.eventIsActive(parseInt(eventId))

    if (!isActive) {
        await event_instance.activateEvent(parseInt(eventId));
    }

    await ticket_instance.issueTickets(eventId, ticketQty, 0);

    // console.log("Buy Ticket ", eventId, "from Organizer");
}

const populateData = async () => {
    try {
        console.log("Populate Data");
        // const today = new Date();
        // const parsedDate = Date.parse(today);
        // console.log("creating event");
        // await event_instance.createEvent("Maroon 5", parseInt(100), parseInt(1), parsedDate);
        // await event_instance.createEvent("HONNE", parseInt(100), parseInt(1), parsedDate);
        // await event_instance.createEvent("The Weeknd", parseInt(100), parseInt(1), parsedDate);
        // console.log("event created");
        // console.log("activating events");
        // await event_instance.activateEvent(0);
        // console.log(event_instance.eventIsActive(0));
        // await event_instance.activateEvent(1);
        // console.log(event_instance.eventIsActive(1));
        // await event_instance.activateEvent(2);
        // console.log(event_instance.eventIsActive(2));
        // console.log("events activated");
        // console.log("buying tickets");
        // await ticket_instance.issueTickets(0, 2, 0, { value: oneEth*BigInt(3)});
        // console.log("tickets bought");

    } catch (error) {
        console.error(error);
    }
}

export { getWalletAddress, getWalletBalance, createEvent, getAllEvents, getEventInfo, populateData, getListedTickets, getTicketInfo, buyTicketMarket, sellTicketMarket, buyTicketFromOrganizer, getOwnedTickets };