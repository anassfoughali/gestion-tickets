import {useState , useEffect} from 'react';
import { dashboardService } from '../services/api';

const useDashboard = () => {
    const [stats, setStats] = useState(null);
    const[loading, setLoading] = useState(true);
    const [error , setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        //chargement des donnees via REST
        dashboardService.getStats()
        .then((res) => {
            setStats(res.data);
            setLastUpdated(new Date ());
            setLoading(false);
        })
        .catch((err) => {
            setError(err.message);
            setLoading(false);
        });

        //stram SSE pour mise a jour automatique
        const unsubscribe = dashboardService.subscribeToStats(
            (data) => {
                setStats(data);
                setLastUpdated(new Date());
            },
            (err) => {
                console.error('SSE error', err);
            }
        );

        // cleanup - fermation du connexion SSE
        return () => unsubscribe ();

    }, []);
    return {stats , loading , error , lastUpdated};
};

export default useDashboard;