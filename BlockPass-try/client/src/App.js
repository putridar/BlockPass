import logo from './logo.svg';
//import Form from './EventForm.js';
import './App.css';
//import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import Event from './contracts/Event.json';

const ethers = require("ethers")
const EventContractAddress = "0x1cBb96FE8932b01c8311d726DBd1Bdc1d7717174";
const emptyAddress = '0x0000000000000000000000000000000000000000';
const numEvent = 0;

function App() {

  const [account, setAccount] = useState('');

  async function initializeProvider() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(EventContractAddress, Event.abi, signer);
  }

  async function requestAccount() {
    const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(account[0]);
  }

  async function addEvent(event) {
    event.preventDefault();
    if (typeof window.ethereum !== 'undefined') {
      const contract = await initializeProvider();
      try {
        const myBid = await contract.add("Taylor Swift", 1000);
        const num = contract.getNumEvent();
        console.log("Success, num event is ", num);
      } catch (e) {
        console.log('error adding event: ', e);
      }
    }
  }

  async function getNumEvent() {
    const contract = await initializeProvider();
    try {
      console.log("Before: ", numEvent);
      numEvent = contract;
      console.log("After: ", numEvent);
    } catch (e) {
      console.log("error getNumEvent: ", e);
    }
    
  }

  useEffect(() => {
   requestAccount();
  }, []);

  return (
    <div
       style={{
         textAlign: 'center',
         marginTop: '20px',
         paddingBottom: '10px',
         border: '1px solid black'
       }}>
       <p>Connected Account: {account}</p>
       <p>Curr Num Event: {numEvent}</p>
       
      <form onSubmit={addEvent}>
      <label htmlFor="name">Name:</label>
        <input type="text" name="name" id="name"/>
        <button type="submit">Submit</button>
      </form>
     </div>
  );
}

export default App;
