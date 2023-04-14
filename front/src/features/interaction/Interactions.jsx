import React, { useState, useEffect } from "react";
import { createEvent, getAllEvents, getEventInfo, populateData } from "../../utils/web3-utils/web3-client";
import { Link } from 'react-router-dom';

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
        console.log(data)
        let array = [];
        for (const element of data) {
            const datum = await getEventInfo(element);
            array.push(datum);
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
        await createEvent(form.title, form.maxTicketSupply, form.standardPrice, form.date);
    }

    return (
        <div className="mx-20">
            <form onSubmit={addEvent} >
                <input className="p-2 border-2 border-black" onChange={handleChange} type="text" placeholder="title" name="title" />
                <input className="p-2 border-2 border-black" onChange={handleChange} type="text" placeholder="Max Ticket Supply" name="maxTicketSupply" />
                <input className="p-2 border-2 border-black"onChange={handleChange} type="text" placeholder="Standard Price" name="standardPrice" />
                <input className="p-2 border-2 border-black" onChange={handleChange} type="date" name="date" />
                <button className="p-2 border-2 border-black" type="submit">Add new event</button>
            </form>
            <div>
                <button className="p-2 border-2 border-black" onClick={populateData}>Populate Data</button>
            </div>
            <div>
                <Link to="/buyticketofficial">
                <button className="p-2 border-2 border-black">Go To Official Market</button>
                </Link>
            </div>
            <div>
                <Link to="/market">
                <button className="p-2 border-2 border-black">Go To Secondary Market</button>
                </Link>
            </div>
            <div>Event List</div>
            <table>
                <thead className="border-b-2 border-black">
                    <tr>
                        <th className="px-5">Event ID</th>
                        <th className="px-5">Event Title</th>
                        <th className="px-5">Event Date</th>
                        <th className="px-5">Standard Price</th>
                    </tr>
                </thead>
                <tbody className="text-center">
                    {
                        eventIds.map((details, id) => {
                            return (
                                <tr key={id}>
                                    <td>{details[0]}</td>
                                    <td>{details[1]}</td>
                                    <td>{details[2]}</td>
                                    <td>{details[3]}</td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        </div>
    );
}

export default Interaction;