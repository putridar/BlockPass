import React, { useState } from 'react';
import Web3 from 'web3';
import abi from './contractABI.json';

function MyForm() {

    async function testAddData(data) {
        const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:7545');
        const contractAddress = '0xDA0bab807633f07f013f94DD0E6A4F96F8742B53'; // replace with actual contract address
        const contractInstance = new web3.eth.Contract(abi, contractAddress);
        const accounts = await web3.eth.getAccounts();
        // const formData = { name: "John Doe", age: 30, email: "johndoe@example.com" };
        const result = await contractInstance.methods.setData(data).send({ from: accounts[0] });
        console.log(await contractInstance.methods.getData());
        console.log(result);
    };

    const [formData, setFormData] = useState({});

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.target;
        /* const formData = {
            name: form.name.value,
            email: form.email.value,
        };*/
        console.log(10);

        // test the functionality to send the data
        testAddData(10);

        // Call the Solidity smart contract function to store the data
        // using the web3.js library and the user's provided data from
        // the formData state.
    };

    return (
        <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input type="text" name="name" id="name" onChange={handleInputChange} />

        <label htmlFor="email">Email:</label>
        <input type="email" name="email" id="email" onChange={handleInputChange} />

        <button type="submit">Submit</button>
        </form>
    );
}

export default MyForm;
