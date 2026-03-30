import {useState , useEffect} from 'react';
import {ticketsService} from '../services/api';

const useTickets = () => {
    const [tickets , setTickets] = useState([]);
    const [parJour , setParJour] = useState([]);
    const [loading , setLoading] = useState(true);
    const [error , setError] = useState(null);

    useEffect (() => {
        Promise.all([
            ticketsService.getAll(),
            ticketsService.getStatsParJour(),
        ])
        .then(([ticketsRes , parJourRes]) => {
            setTickets(ticketsRes.data);
            setParJour(parJourRes.data);
            setLoading(false);
        })
        .catch((err) => {
            setError(err.message);
            setLoading(false);
        });
    }, []);
    return { tickets , parJour , loading , error };
};

export default useTickets;