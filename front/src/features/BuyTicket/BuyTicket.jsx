import React, { useState, useEffect } from "react";
import {getAllEvents, getEventInfo, buyTicketFromOrganizer} from "../../utils/web3-utils/web3-client";
import { Link } from 'react-router-dom';

function BuyTicket() {
    const [form, setForm] = useState({});
    const [eventIds, setEventIds] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        try {
            fetchAllEventIds();
            console.log("fetchAllEventIds");
        } catch (error) {
            console.error(error);
        }
    }, [])
    
    const fetchAllEventIds = async () => {
        const data = await getAllEvents();
        let array = [];
        
        for (const element of data) {
            try {
                
                const datum = await getEventInfo(element);
                array.push(datum);
                console.log("HERE PLEAASE", datum)
            } catch (error) {
                
            }
        } 
        setEventIds(array);
    } 

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name] : e.target.value,
        });
    }

    const buyTicket = async (e) => {
        e.preventDefault();
        console.log("Event ID:", parseInt(form.eventId));
        console.log("Quantity:", parseInt(form.qty)); 
        try {
            await buyTicketFromOrganizer(parseInt(form.eventId), parseInt(form.qty), false, 0);
            setMessage("Successfully bought ticket.");
          } catch (error) {
            setMessage("Failed to buy ticket, error: " + error.data.message);
        }
    }
  return (
    <div>
        <h1>Welcome to BlockPass Market</h1>
        <p>Which event ticket would you like to buy today?</p>
        <form onSubmit={buyTicket} >
            <label> Event ID:
                <input className="p-2 border-2 border-black" onChange={handleChange} type="text" placeholder="Event Id" name="eventId" />
            </label>
            <br />
            <label> Quantity:
                <input className="p-2 border-2 border-black" onChange={handleChange} type="number" placeholder="Quantity (Max: 2)" name="qty" />
            </label>
            <br />
            <label> Buying Price:
                <input className="p-2 border-2 border-black" onChange={handleChange} type="text" placeholder="Buying Price" name="buyingPrice" />
            </label>
            <br />
            <button className="p-2 border-2 border-black" type="submit">Buy Ticket</button>
        </form>
        <br></br>
            <div>{message && <p>{message}</p>}</div>
            <br></br>
            <div><h1>Available Event List</h1></div>
            <br></br>
            {
                eventIds.map((details, id) => {
                    return (
                        <div key={id}>
                            <div>
                                Event Id: {details[0]}
                            </div>
                            <div>
                                Event Name: {details[1]}
                            </div>
                            <div>
                                Event Date: {details[2]}
                            </div>
                            <div>
                                Standard Price: {details[3]}
                            </div>
                        </div>
                    );
                })
            }
        <div>
            <Link to="/home">
            <button className="p-2 border-2 border-black">Back To Home</button>
            </Link>
        </div>
    </div>
  );
}

export default BuyTicket;