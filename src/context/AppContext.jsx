import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext();

const initialUsers = [];

const initialProducts = [];

const initialAssignments = [];

const initialMasterData = [];

const initialCards = [];

const initialBags = [];

const initialAuditLogs = [];

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('nobel_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleSetUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('nobel_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('nobel_user');
    }
  };

  const [users, setUsers] = useState(initialUsers);
  const [products, setProducts] = useState(initialProducts);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [masterData, setMasterData] = useState(initialMasterData);
  const [cards, setCards] = useState(initialCards);
  const [bags, setBags] = useState(initialBags);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);

  // Fetch all initial data from backend when user is logged in
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token) return;
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        const [
          usersRes, productsRes, assignmentsRes, 
          worklogsRes, cardsRes, bagsRes, auditRes
        ] = await Promise.all([
          axios.get('/api/auth/users', config).catch(() => ({ data: [] })),
          axios.get('/api/products', config).catch(() => ({ data: [] })),
          axios.get('/api/assignments', config).catch(() => ({ data: [] })),
          axios.get('/api/worklogs', config).catch(() => ({ data: [] })),
          axios.get('/api/cards', config).catch(() => ({ data: [] })),
          axios.get('/api/bags', config).catch(() => ({ data: [] })),
          axios.get('/api/audit', config).catch(() => ({ data: [] }))
        ]);

        setUsers(usersRes.data);
        setProducts(productsRes.data);
        setAssignments(assignmentsRes.data);
        setMasterData(worklogsRes.data);
        setCards(cardsRes.data);
        setBags(bagsRes.data);
        setAuditLogs(auditRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, [user?.token]);

  // Helper to add audit log
  const addAuditLog = (action, product, shift, timeSlot, oldData, newData) => {
    if (!user) return;
    const newLog = {
      id: `AUD${Date.now()}`,
      action,
      userName: user.name,
      role: user.role,
      product,
      shift,
      timeSlot,
      oldData,
      newData,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      user, setUser: handleSetUser,
      users, setUsers,
      products, setProducts,
      assignments, setAssignments,
      masterData, setMasterData,
      cards, setCards,
      bags, setBags,
      auditLogs, addAuditLog
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
