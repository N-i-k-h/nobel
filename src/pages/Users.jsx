import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import axios from 'axios';

export default function Users() {
  const { users, setUsers, user } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'operator'
  });

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'operator' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      if (editingUser) {
        const res = await axios.put(`/api/auth/users/${editingUser._id || editingUser.id}`, formData, config);
        setUsers(users.map(u => (u._id === editingUser._id || u.id === editingUser.id) ? res.data : u));
      } else {
        const res = await axios.post('/api/auth/register', formData, config);
        setUsers([...users, res.data]);
      }
      handleCloseModal();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving user');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/auth/users/${id}`);
        setUsers(users.filter(u => u._id !== id && u.id !== id));
      } catch (error) {
        alert('Error deleting user');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Users Management</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-accent hover:bg-accent/90 text-background px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]"
        >
          <Plus className="w-5 h-5" /> Add User
        </button>
      </div>

      <div className="bg-card border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/30 text-gray-400 text-sm border-b border-gray-800">
                <th className="py-4 px-6 font-medium">Name</th>
                <th className="py-4 px-6 font-medium">Email</th>
                <th className="py-4 px-6 font-medium">Role</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id || u.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="py-4 px-6 text-white font-medium">{u.name}</td>
                  <td className="py-4 px-6 text-gray-400">{u.email}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${u.role === 'admin' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => handleOpenModal(u)} className="text-gray-400 hover:text-white transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(u._id || u.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <input required={!editingUser} type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all appearance-none">
                  <option value="operator">Operator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors font-medium">Cancel</button>
                <button type="submit" className="bg-accent hover:bg-accent/90 text-background px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-accent/20">{editingUser ? 'Save Changes' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
