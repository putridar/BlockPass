import React, { useState } from 'react';
import Web3 from 'web3';
import { useWeb3React } from '@web3-react/core';
import MyContract from './MyContract.json';
import './Form.css'
import './Header.css'

function MyForm() {

    /*
    async function testAddData(newData) {
        const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:7545');
        const contractAddress = '0xDA0bab807633f07f013f94DD0E6A4F96F8742B53'; // replace with actual contract address
        const contractInstance = new web3.eth.Contract(abi, contractAddress);
        const accounts = await web3.eth.getAccounts();
        // const formData = { name: "John Doe", age: 30, name: "johndoe@example.com" };
        console.log(await contractInstance.methods.getData().call());
        const result = await contractInstance.methods.setData(newData).send({ from: accounts[1] });
        const getdata = await contractInstance.methods.getData().send({ from: accounts[1] });
        console.log(getdata);
        console.log(result);
    };
    */

    const [formData, setFormData] = useState({});

    const handleInputChange = (event) => {
        setFormData(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const data = {
            eventName: form.eventName.value,
            organizerName: form.organizerName.value,
            stdPrice: form.ticketPrice.value,
            eventDate: form.eventDate.value

        }

        // Call the Solidity smart contract function to store the data
        // using the web3.js library and the user's provided data from
        // the formData state.

        const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:7545'); // abstract to another file and export
        const abi = MyContract.abi;

        const contractInstance = new web3.eth.Contract(abi, '0x58e7abA53C6d3CA9c99E64519199A7500CfF9611');
        const tx = await contractInstance.methods.setData(data).send({ from: '0x6DDb8b3218D54FD37211637265bF66E81d18c1F5', gas: 500000 });

        console.log('Transaction hash:', tx.transactionHash);
        console.log('Data sent:', data);

        const dataGet = await contractInstance.methods.getData();
        console.log('Data Retrieved', dataGet);
        
    };

    return (
        <div>
            <div class="header">
                BlockPass Ticketing System
            </div>
            <form className="form" onSubmit={handleSubmit}>
                <label htmlFor="name">Event Name:</label>
                <input type="text" name="Event Name" id="eventName" placeholder='Born Pink' onChange={handleInputChange} />

                <label htmlFor="name">Organizer Name:</label>
                <input type="text" name="Organizer Name" id="organizerName" placeholder='FX Entr' onChange={handleInputChange} />

                <label htmlFor="price">Standard Ticket Price (ETH)</label>
                <input type="number" name="Ticket Price" id="ticketPrice" onChange={handleInputChange} />

                <label htmlFor="data">Event Date</label>
                <input type="date" name="Event Date" id="eventDate" placeholder='2023-05-05' onChange={handleInputChange} />

            <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default MyForm;
