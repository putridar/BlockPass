import React, { useState, useEffect } from "react";
import { getListedTickets, getListedTicketInfo, buyTicketMarket } from "../../utils/web3-utils/web3-client";
import { Link } from 'react-router-dom';

function Interaction() {
    const [form, setForm] = useState({});
    const [ticketIds, setTicketIds] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        try {
            fetchAllListedIds();
            console.log("fetchAllListedIds");
        } catch (error) {
            console.error(error);
        }
    }, [])
    
    const fetchAllListedIds = async () => {
        console.log("fetAllListedIds called");
        const data = await getListedTickets();
        console.log("data is ", data);
        let array = [];
        
        for (const element of data) {
            console.log("for loop data");
            try {
                const datum = await getListedTicketInfo(element);
                array.push(datum);
                console.log("Log this", datum)
            } catch (error) {
                console.log(error.message)
            }
        } 
        setTicketIds(array);
    } 

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name] : e.target.value,
        });
    }

    const buyTicket = async (e) => {
        e.preventDefault();
        console.log("Ticket ID:", parseInt(form.ticketId));
        console.log("Offered price:", parseInt(form.offeredPrice)); 
        try {
            await buyTicketMarket(parseInt(form.ticketId), parseInt(form.offeredPrice));
            setMessage("Successfully bought ticket.");
          } catch (error) {
            setMessage("Failed to buy ticket, error: " + error.data.message);
        }
    }

    return (
        <div>
            <h1>Which Ticket do you want to buy?</h1> <br></br>
            <form onSubmit={buyTicket} >
                <label> Ticket ID:
                    <input className="p-2 border-2 border-black" onChange={handleChange} type="text" placeholder="Ticket Id" name="ticketId" />
                </label>
                <br />
                <label> Offered Price:
                    <input className="p-2 border-2 border-black" onChange={handleChange} type="text" placeholder="Offered Price" name="offeredPrice" />
                </label>
                <br />
                <button className="p-2 border-2 border-black" type="submit">Buy Ticket</button>
            </form>
            <br></br>
            <div>{message && <p>{message}</p>}</div>
            <br></br>
            <div><h1>Available Ticket List</h1></div>
            <br></br>
            {
                ticketIds.map((details, id) => {
                    return (
                        <div key={id} style={{ border: "1px solid black", padding: "10px" }}>
                            <div>
                                Ticket Id: {details[0]}
                            </div>
                            <div>
                                Event: {details[1]}
                            </div>
                            <div>
                                Expired Date: {details[2]}
                            </div>
                            <div>
                                Standard Price: {details[3]}
                            </div>
                            <div>
                                Asking Price: {details[4]}
                            </div>
                        </div>
                    );
                })
            }
             <br></br>
            <div>
                <Link to="/market">
                <button className="p-2 border-2 border-black">Back To Secondary Market</button>
                </Link>
            </div>
        </div>
    );
}

export default Interaction;