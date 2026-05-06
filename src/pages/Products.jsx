import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Trash2, X, ArrowUp, ArrowDown, Settings2, GripVertical } from 'lucide-react';
import axios from 'axios';

export default function Products() {
  const { products, setProducts, user } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    processes: ['Production', 'Filtering']
  });

  const handleOpenModal = () => {
    setFormData({ name: '', processes: ['Production', 'Filtering'] });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddProcess = () => {
    setFormData({ ...formData, processes: [...formData.processes, 'New Process'] });
  };

  const handleProcessChange = (index, value) => {
    const newProcesses = [...formData.processes];
    newProcesses[index] = value;
    setFormData({ ...formData, processes: newProcesses });
  };

  const handleRemoveProcess = (index) => {
    const newProcesses = formData.processes.filter((_, i) => i !== index);
    setFormData({ ...formData, processes: newProcesses });
  };

  const handleMoveProcess = (index, direction) => {
    if (direction === 'up' && index > 0) {
      const newProcesses = [...formData.processes];
      [newProcesses[index - 1], newProcesses[index]] = [newProcesses[index], newProcesses[index - 1]];
      setFormData({ ...formData, processes: newProcesses });
    } else if (direction === 'down' && index < formData.processes.length - 1) {
      const newProcesses = [...formData.processes];
      [newProcesses[index + 1], newProcesses[index]] = [newProcesses[index], newProcesses[index + 1]];
      setFormData({ ...formData, processes: newProcesses });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const res = await axios.post('/api/products', formData, config);
      setProducts([...products, res.data]);
      handleCloseModal();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this product?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user?.token}` } };
        await axios.delete(`/api/products/${id}`, config);
        setProducts(products.filter(p => p._id !== id && p.id !== id));
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting product');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <button 
          onClick={handleOpenModal}
          className="bg-accent hover:bg-accent/90 text-background px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-card border border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-700 transition-all duration-300 group">
            <div className="p-6 border-b border-gray-800 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">{product.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{product.processes.length} Processes</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setViewingProduct(product)} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700">
                  <Settings2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(product._id || product.id)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/20">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 bg-gray-900/30">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {product.processes.map((proc, i) => (
                  <div key={i} className="flex items-center shrink-0">
                    <div className="px-3 py-1.5 rounded-lg bg-gray-800 text-xs text-gray-300 border border-gray-700 whitespace-nowrap">
                      {proc}
                    </div>
                    {i < product.processes.length - 1 && (
                      <div className="w-4 h-px bg-gray-700 mx-1"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-800 shrink-0">
              <h2 className="text-xl font-bold text-white">Add New Product</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Product Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all" placeholder="e.g. Alloy Wheel A1" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-400">Process Builder</label>
                    <button type="button" onClick={handleAddProcess} className="text-accent hover:text-accent/80 text-sm font-medium flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add Process
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.processes.map((proc, index) => (
                      <div key={index} className="flex items-center gap-3 bg-background border border-gray-800 p-2 rounded-xl group transition-colors hover:border-gray-700">
                        <div className="text-gray-600 cursor-move p-2"><GripVertical className="w-5 h-5" /></div>
                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">{index + 1}</div>
                        <input 
                          type="text" 
                          value={proc} 
                          onChange={(e) => handleProcessChange(index, e.target.value)} 
                          className="flex-1 bg-transparent border-none text-white focus:ring-0 outline-none px-2"
                        />
                        <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity pr-2">
                          <button type="button" onClick={() => handleMoveProcess(index, 'up')} disabled={index === 0} className="p-1.5 hover:bg-gray-800 rounded-md text-gray-400 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                          <button type="button" onClick={() => handleMoveProcess(index, 'down')} disabled={index === formData.processes.length - 1} className="p-1.5 hover:bg-gray-800 rounded-md text-gray-400 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                          <div className="w-px h-4 bg-gray-700 mx-1"></div>
                          <button type="button" onClick={() => handleRemoveProcess(index)} className="p-1.5 hover:bg-red-500/20 rounded-md text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-800 shrink-0 flex justify-end gap-3 bg-card mt-auto">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors font-medium">Cancel</button>
                <button type="submit" className="bg-accent hover:bg-accent/90 text-background px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-accent/20">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Product Modal (Timeline) */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-gray-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-white">{viewingProduct.name}</h2>
                <p className="text-sm text-gray-400 mt-1">Process Flow</p>
              </div>
              <button onClick={() => setViewingProduct(null)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-12 overflow-x-auto">
              <div className="flex items-center min-w-max">
                {viewingProduct.processes.map((proc, index) => (
                  <div key={index} className="flex items-center">
                    {/* Process Node */}
                    <div className="relative group">
                      <div className="w-16 h-16 rounded-2xl bg-gray-800 border-2 border-gray-700 flex items-center justify-center shadow-lg group-hover:border-accent transition-colors z-10 relative">
                        <span className="text-xl font-bold text-gray-400 group-hover:text-accent transition-colors">{index + 1}</span>
                      </div>
                      <div className="absolute top-20 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                        <p className="text-sm font-medium text-white">{proc}</p>
                      </div>
                    </div>
                    
                    {/* Connector line */}
                    {index < viewingProduct.processes.length - 1 && (
                      <div className="w-24 h-1 bg-gray-800 mx-2 rounded-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600 animate-pulse"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-800 flex justify-end bg-gray-900/50 mt-16">
              <button onClick={() => setViewingProduct(null)} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl font-medium transition-all">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
