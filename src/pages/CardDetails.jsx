import { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, X, Printer, Download, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function CardDetails() {
  const { cards, setCards, masterData, products } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingCard, setViewingCard] = useState(null);
  const cardRef = useRef(null);

  const [formData, setFormData] = useState({
    applyDate: '',
    cardNumber: Math.floor(1000 + Math.random() * 9000).toString(),
    partNo: '',
    date: format(new Date(), 'dd/MM/yy'),
    productId: ''
  });

  const handleOpenModal = () => {
    setFormData({
      applyDate: '',
      cardNumber: Math.floor(1000 + Math.random() * 9000).toString(),
      partNo: '',
      date: format(new Date(), 'dd/MM/yy'),
      productId: ''
    });
    setIsModalOpen(true);
  };

  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      setFormData({
        ...formData,
        productId,
        partNo: product.id === 1 ? '921/292' : (product.id === 2 ? 'E-88/V8' : 'SA-001')
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const product = products.find(p => p.id === parseInt(formData.productId));
    setCards([...cards, { ...formData, productName: product?.name, id: Date.now() }]);
    setIsModalOpen(false);
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
            key={card.id} 
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
                <p className="text-xs text-black/70 font-bold uppercase tracking-tighter">P/N: {card.partNo}</p>
              </div>
              <div className="text-right">
                <span className="text-red-600 font-mono font-black text-xl leading-none opacity-80">{card.cardNumber}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-[10px] font-bold text-black/50 border-t border-black/10 pt-4">
              <span>Date: {card.date}</span>
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
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Card Number</label>
                  <input required type="text" value={formData.cardNumber} onChange={e => setFormData({...formData, cardNumber: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Date (DD/MM/YY)</label>
                  <input required type="text" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Part No.</label>
                <input required type="text" value={formData.partNo} onChange={e => setFormData({...formData, partNo: e.target.value})} className="w-full bg-background border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:border-accent outline-none" />
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
                  <span>P/N: <span className="font-mono text-lg">{viewingCard.partNo}</span></span>
                  <span>Date: <span className="font-mono text-lg">{viewingCard.date}</span></span>
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
                  {[1, 2, 3, 4, 5, 6, 7].map((_, idx) => (
                    <tr key={idx} className="h-7">
                      <td className="border-2 border-black px-2">{idx === 0 ? 'P.D.C' : (idx === 1 ? 'Trimming' : '')}</td>
                      <td className="border-2 border-black px-2">{idx === 0 ? 'Chethan' : ''}</td>
                    </tr>
                  ))}
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
