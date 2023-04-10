import React, { useState } from "react";
import { sellTicketMarket } from "../../utils/web3-utils/web3-client";
import { Link } from 'react-router-dom';

function MarketSell() {
    const [form, setForm] = useState({});
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name] : e.target.value,
        });
    }

    const listTicket = async (e) => {
        e.preventDefault();
        console.log("Ticket ID:", parseInt(form.ticketId));
        console.log("Asking price:", parseInt(form.askingPrice));
        try {
            await sellTicketMarket(parseInt(form.ticketId), parseInt(form.askingPrice));
            setMessage("Successfully listed ticket.");
          } catch (error) {
            setMessage("Failed to buy ticket, error: " + error.data.message);
        }
    }

  return (
    <div>
    <h1>Which Ticket do you want to sell?</h1>
    <form onSubmit={listTicket} >
        <label> Ticket ID:
            <input className="p-2 border-2 border-black" onChange={handleChange} type="text" placeholder="Ticket Id" name="ticketId" />
        </label>
        <br />
        <label> Asking Price:
            <input className="p-2 border-2 border-black" onChange={handleChange} type="text" placeholder="Asking Price" name="askingPrice" />
        </label>
        <br />
        <button className="p-2 border-2 border-black" type="submit">List Ticket</button>
    </form>
    <div>
        <Link to="/market">
        <button className="p-2 border-2 border-black">Back To Secondary Market</button>
        </Link>
    </div>
    <div>{message && <p>{message}</p>}</div>
    
    </div>
    
  );
}

export default MarketSell;