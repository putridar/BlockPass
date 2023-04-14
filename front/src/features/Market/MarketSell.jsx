import React, { useState, useEffect } from "react";
import { getOwnedTickets, getTicketInfo, sellTicketMarket } from "../../utils/web3-utils/web3-client";
import { Link } from 'react-router-dom';
import { useUser } from "../../context/auth-context";

function MarketSell() {
    const [form, setForm] = useState({});
    const [message, setMessage] = useState("");
    const [myTickets, setMyTickets] = useState([]);
    const user = useUser();

    useEffect(() => {
        (async () => {
            const data = await getOwnedTickets();
            const arr = [];
            for (const datum of data) {
                const ticketId = parseInt(datum._hex);
                console.log(ticketId)
                try {
                    
                    const ticketInfo = await getTicketInfo(ticketId);
                    arr.push(ticketInfo)
                } catch (error) {
                    
                }
            }
            console.log(arr)
            setMyTickets(arr);
            
        })();
    }, [])
    

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
    <div className="mx-20">
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
                            myTickets.map((details, id) => {
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