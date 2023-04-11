import React, { useState, useEffect } from "react";
import { createEvent, getAllEvents, getEventInfo } from "../../utils/web3-utils/web3-client";

function Interaction() {
    const [form, setForm] = useState({});
    const [eventIds, setEventIds] = useState([]);

    useEffect(() => {
        try {
            fetchAllEventIds();
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

    const addEvent = async (e) => {
        e.preventDefault();
        console.log("Hello");
        await createEvent(form.title, form.maxTicketSupply, form.standardPrice, form.date);
    }

    {/*
    const buyTicket = async (e) => {
        console.log("Pressed");
        e.preventDefault();
        await buyTicketFromOrganizer(form.eventId, form.ticketQty);
    }
    */}

    {/*
    const getTicket = async (e) => {
        e.preventDefault();
        await getTicketOwner(form.ticketId);
    }
    */}

    return (
        <div>
            <form onSubmit={addEvent} >
                <input className="p-2 border-2 border-black" onChange={handleChange} type="text" placeholder="title" name="title" />
                <input className="p-2 border-2 border-black" onChange={handleChange} type="text" placeholder="Max Ticket Supply" name="maxTicketSupply" />
                <input className="p-2 border-2 border-black"onChange={handleChange} type="text" placeholder="Standard Price" name="standardPrice" />
                <input className="p-2 border-2 border-black" onChange={handleChange} type="date" name="date" />
                <button className="p-2 border-2 border-black" type="submit">Add new event</button>
            </form>
            <div>Event List</div>
            {
                eventIds.map((details, id) => {
                    return (
                        <div key={id}>
                            <div>
                                {details[0]}
                            </div>
                            <div>
                                {details[1]}
                            </div>
                            <div>
                                    {details[2]}
                            </div>
                        </div>
                    );
                })
            }
            {/*
            <form onSubmit={buyTicket} >
                <input className="p-2 border-2 border-black" onChange={handleChange} type="number" placeholder="Event ID" name="eventId" />
                <input className="p-2 border-2 border-black" onChange={handleChange} type="number" placeholder="Ticket Qty (Max 2)" name="ticketQty" />
                <button className="p-2 border-2 border-black" type="submit">Buy Ticket</button>
            </form>
            */}
            {/*
            <form onSubmit={getTicket} >
                <input className="p-2 border-2 border-black" onChange={handleChange} type="number" placeholder="Ticket ID" name="ticketId" />
                <button className="p-2 border-2 border-black" type="submit">Get Owner</button>
            </form>
            */}
        </div>
    );
}

export default Interaction;