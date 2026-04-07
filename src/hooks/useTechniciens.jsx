import { useState, useEffect } from 'react';
import { technicienService } from '../services/api';

const useTechniciens = () => {
  const [techniciens, setTechniciens] = useState([]);
  const [statsGlobales, setStatsGlobales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]  = useState(null);

  useEffect(() => {
    Promise.all([
      technicienService.getAll(),
      technicienService.getStatsGlobales(),
    ])
      .then(([listRes, statsRes]) => {
        setTechniciens(listRes.data);
        setStatsGlobales(statsRes.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { techniciens, statsGlobales, loading, error };
};

export default useTechniciens;