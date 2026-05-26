import { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, X, Printer, Download, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';

export default function CardDetails() {
  const { cards, setCards, masterData, products, assignments, user } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingCard, setViewingCard] = useState(null);
  const cardRef = useRef(null);

  const [selectedDates, setSelectedDates] = useState([format(new Date(), 'yyyy-MM-dd')]);
  const [formData, setFormData] = useState({
    applyDate: '',
    cardNumber: Math.floor(1000 + Math.random() * 9000).toString(),
    date: '',
    productId: ''
  });

  const handleOpenModal = () => {
    setFormData({
      applyDate: '',
      cardNumber: Math.floor(1000 + Math.random() * 9000).toString(),
      date: '',
      productId: ''
    });
    setSelectedDates([format(new Date(), 'yyyy-MM-dd')]);
    setIsModalOpen(true);
  };

  const handleProductChange = (productId) => {
    setFormData({
      ...formData,
      productId
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const product = products.find(p => (p._id || p.id).toString() === formData.productId.toString());
      const body = {
        date: selectedDates.join(', '),
        productName: product?.name,
        processes: []
      };
      const res = await axios.post('/api/cards', body, config);
      setCards([...cards, { ...res.data, id: res.data._id || res.data.id }]);
      setIsModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error generating route card');
    }
  };

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: '#facc15' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', [150, 100]);
    pdf.addImage(imgData, 'PNG', 0, 0, 150, 100);
    pdf.save(`RouteCard_${viewingCard.cardNumber}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Route Cards</h1>
        <button 
          onClick={handleOpenModal}
          className="bg-accent hover:bg-accent/90 text-background px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]"
        >
          <Plus className="w-5 h-5" /> Generate Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div 
            key={card.id || card._id} 
            className="bg-[#facc15] border-2 border-black/20 rounded-lg p-6 hover:shadow-2xl transition-all duration-300 group cursor-pointer relative overflow-hidden" 
            onClick={() => setViewingCard(card)}
          >
            <div className="flex items-center justify-between mb-4 border-b border-black/10 pb-2">
              <span className="flex items-center text-black font-black uppercase text-xs">
                N<Settings className="w-3 h-3 mx-[0.5px] stroke-[3]" />BEL
              </span>
              <span className="text-[10px] font-bold text-black/60 uppercase">Route Card</span>
            </div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-black mb-1">{card.productName || 'General Product'}</h3>
              </div>
              <div className="text-right">
                <span className="text-red-600 font-mono font-black text-xl leading-none opacity-80">{card.cardNumber}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-[10px] font-bold text-black/50 border-t border-black/10 pt-4">
              <span>Date: {(() => {
                const formatDateForDisplay = (dateStr) => {
                  if (!dateStr) return '';
                  return dateStr.split(',').map(d => {
                    const trimmed = d.trim();
                    if (trimmed.match(/^\d{4}-\d{2}-\d{2}$/)) {
                      const [y, m, day_val] = trimmed.split('-');
                      return `${day_val}/${m}/${y.substring(2)}`;
                    }
                    return trimmed;
                  }).join(', ');
                };
                return formatDateForDisplay(card.date);
              })()}</span>
              <span className="uppercase">Sup. Sign Required</span>
            </div>
          </div>
        ))}
      </div>

      {/* Generate Card Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Generate Route Card</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Select Product</label>
                <select 
                  required 
                  value={formData.productId} 
                  onChange={e => handleProductChange(e.target.value)}
                  className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none appearance-none"
                >
                  <option value="">-- Select Product --</option>
                  {products.map(p => (
                    <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Card Number</label>
                <input required type="text" value={formData.cardNumber} onChange={e => setFormData({...formData, cardNumber: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">Dates (DD/MM/YY)</label>
                {selectedDates.map((date, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input 
                      required 
                      type="date" 
                      value={date} 
                      onChange={e => {
                        const newDates = [...selectedDates];
                        newDates[idx] = e.target.value;
                        setSelectedDates(newDates);
                      }} 
                      className="flex-1 bg-background border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none" 
                    />
                    {selectedDates.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => setSelectedDates(selectedDates.filter((_, i) => i !== idx))} 
                        className="text-red-400 hover:text-red-300 p-2 hover:bg-gray-800 rounded-xl transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={() => setSelectedDates([...selectedDates, format(new Date(), 'dd/MM/yy')])}
                  className="text-accent hover:text-accent/80 text-sm font-semibold flex items-center gap-1 mt-1 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Date
                </button>
              </div>

              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-800 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-colors font-medium">Cancel</button>
                <button type="submit" className="bg-accent hover:bg-accent/90 text-background px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-accent/20">Generate Card</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Card UI - Yellow Physical Card Style */}
      {viewingCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          <div className="flex gap-4 mb-6">
            <button onClick={handlePrint} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={handleDownloadPDF} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button onClick={() => setViewingCard(null)} className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-4 py-2 rounded-xl flex items-center gap-2 transition-all">
              <X className="w-4 h-4" /> Close
            </button>
          </div>

          <div 
            ref={cardRef}
            className="bg-[#facc15] w-[600px] h-[400px] shadow-2xl p-6 text-black border-2 border-black flex flex-col justify-between print:m-0 print:shadow-none"
          >
            <div>
              <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-4">
                <div className="flex flex-col">
                  <span className="flex items-center text-3xl font-black tracking-tighter uppercase leading-none">
                    N<Settings className="w-6 h-6 mx-[1px] stroke-[3]" />BEL
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Live Lighter Live Stronger</span>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-black uppercase underline decoration-2 underline-offset-4">Route Card</h2>
                </div>
                <div className="flex flex-col text-right font-bold text-sm">
                  <span>Date: <span className="font-mono text-lg">{(() => {
                    const formatDateForDisplay = (dateStr) => {
                      if (!dateStr) return '';
                      return dateStr.split(',').map(d => {
                        const trimmed = d.trim();
                        if (trimmed.match(/^\d{4}-\d{2}-\d{2}$/)) {
                          const [y, m, day_val] = trimmed.split('-');
                          return `${day_val}/${m}/${y.substring(2)}`;
                        }
                        return trimmed;
                      }).join(', ');
                    };
                    return formatDateForDisplay(viewingCard.date);
                  })()}</span></span>
                </div>
              </div>

              <table className="w-full border-collapse border-2 border-black text-xs font-bold uppercase">
                <thead>
                  <tr className="bg-black/5">
                    <th className="border-2 border-black p-2 w-1/2">Process</th>
                    <th className="border-2 border-black p-2 w-1/2">Operator</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const normalizeDate = (dateStr) => {
                      if (!dateStr) return '';
                      if (dateStr.includes('/')) {
                        const parts = dateStr.split('/');
                        if (parts.length === 3) {
                          let day = parts[0].padStart(2, '0');
                          let month = parts[1].padStart(2, '0');
                          let year = parts[2];
                          if (year.length === 2) year = `20${year}`;
                          return `${year}-${month}-${day}`;
                        }
                      }
                      return dateStr;
                    };

                    const cardDatesNormalized = (viewingCard.date || '')
                      .split(',')
                      .map(d => normalizeDate(d.trim()))
                      .filter(Boolean);

                    const matchingWorkLogs = masterData.filter(wl => {
                      const wlDateNormalized = normalizeDate(wl.date);
                      const dateMatches = cardDatesNormalized.length === 0 || cardDatesNormalized.includes(wlDateNormalized);
                      return dateMatches && wl.product === viewingCard.productName;
                    });

                    const cardRows = matchingWorkLogs.map(wl => {
                      const assocAssignment = assignments.find(a => (a._id || a.id)?.toString() === wl.assignment?.toString());
                      return {
                        process: assocAssignment?.process || 'Production',
                        operator: wl.operator
                      };
                    });

                    const rowsToRender = [...cardRows];
                    while (rowsToRender.length < 7) {
                      rowsToRender.push({ process: '', operator: '' });
                    }

                    return rowsToRender.map((row, idx) => (
                      <tr key={idx} className="h-7">
                        <td className="border-2 border-black px-2">{row.process}</td>
                        <td className="border-2 border-black px-2">{row.operator}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            <div className="relative">
              {/* Stamped Card Number */}
              <div className="absolute right-32 -top-12 transform -rotate-12 select-none pointer-events-none">
                <span className="text-red-600/60 font-mono font-black text-6xl leading-none tracking-tighter">
                  {viewingCard.cardNumber}
                </span>
              </div>

              <div className="flex justify-between items-end mt-4 font-bold text-xs uppercase">
                <div className="flex flex-col gap-1">
                  <span>Sup. Sign: _________________</span>
                </div>
                <div className="flex flex-col gap-1 text-center">
                  <span>No.</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span>Date: _________________</span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-white/40 text-xs mt-6 uppercase tracking-widest font-medium">Physical Route Card Simulation • Industrial Workflow System</p>
        </div>
      )}
    </div>
  );
}
