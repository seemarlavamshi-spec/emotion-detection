import React, { useState, useEffect } from 'react';
import { ShieldAlert, Phone, Heart, MapPin, ExternalLink, LifeBuoy, UserPlus, Trash2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Contact {
  id: string;
  name: string;
  phone: string;
}

const resources = [
  {
    title: "National Helpline",
    description: "Available 24/7 for immediate support and guidance.",
    phone: "988",
    color: "bg-rose-500"
  },
  {
    title: "Crisis Text Line",
    description: "Text HOME to 741741 to connect with a crisis counselor.",
    phone: "741741",
    color: "bg-blue-500"
  },
  {
    title: "The Trevor Project",
    description: "Crisis intervention and suicide prevention for LGBTQ youth.",
    phone: "1-866-488-7386",
    color: "bg-orange-500"
  }
];

export default function CrisisHelp() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('emergency_contacts');
    if (saved) {
      try {
        setContacts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse contacts', e);
      }
    }
  }, []);

  const saveContacts = (updated: Contact[]) => {
    setContacts(updated);
    localStorage.setItem('emergency_contacts', JSON.stringify(updated));
  };

  const handleAdd = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    
    if (editingId) {
      const updated = contacts.map(c => 
        c.id === editingId ? { ...c, name: newName, phone: newPhone } : c
      );
      saveContacts(updated);
      setEditingId(null);
    } else {
      const newContact: Contact = {
        id: Date.now().toString(),
        name: newName,
        phone: newPhone
      };
      saveContacts([...contacts, newContact]);
    }
    
    setNewName('');
    setNewPhone('');
    setIsAdding(false);
  };

  const startEdit = (contact: Contact) => {
    setNewName(contact.name);
    setNewPhone(contact.phone);
    setEditingId(contact.id);
    setIsAdding(true);
  };

  const removeContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    saveContacts(updated);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <header className="text-center space-y-4 mb-12">
        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-[2rem] border border-rose-500/20 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(244,63,94,0.1)]">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-4xl font-bold text-white tracking-tight">System::Emergency</h2>
        <p className="text-slate-500 max-w-lg mx-auto text-sm font-mono uppercase tracking-[0.15em] leading-relaxed italic italic">
          CRITICAL: If you are in immediate danger, contact emergency services immediately.
        </p>
      </header>

      {/* Primary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resources.map((res, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-brand-card p-6 rounded-3xl border border-slate-800 shadow-xl hover:border-slate-700 transition-all group"
          >
            <div className={`w-12 h-12 ${res.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-current/20`}>
              <Phone size={24} />
            </div>
            <h3 className="font-bold text-white text-lg mb-2">{res.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-8 italic italic">
              {res.description}
            </p>
            <a 
              href={`tel:${res.phone}`}
              className="w-full bg-slate-800 text-slate-300 py-3 rounded-xl font-mono text-[10px] tracking-widest uppercase text-center block hover:bg-rose-600 hover:text-white transition-all border border-slate-700"
            >
              Initialize_{res.phone}
            </a>
          </motion.div>
        ))}
      </div>

      {/* Safety Plan Builder */}
      <div className="bg-[#0F1420] p-12 rounded-[3.5rem] border border-slate-800 shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="w-14 h-14 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent rounded-2xl flex items-center justify-center">
              <LifeBuoy size={32} />
            </div>
            <h3 className="text-3xl font-bold text-white leading-tight">protocol::safety_plan</h3>
            <p className="text-slate-400 text-lg leading-relaxed italic italic">
              A personalized list of coping strategies and sources of support for high-stress cycles.
            </p>
            <button className="bg-brand-accent text-brand-bg px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-accent/20 hover:scale-105 transition-all">
              Initialize Builder
            </button>
          </div>
          
          <div className="space-y-3">
            {[
              { icon: Heart, label: "Coping_Cycle" },
              { icon: MapPin, label: "Safe_Zones" },
              { icon: Phone, label: "Support_Link" },
              { icon: ExternalLink, label: "Clinical_Terminal" }
            ].map((item, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 group cursor-pointer hover:border-brand-accent/50 transition-all">
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-brand-accent transition-all">
                  <item.icon size={18} />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-white">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personal Contacts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-primary/10 border border-brand-primary/20 rounded-lg flex items-center justify-center text-brand-primary">
              <ShieldCheck size={18} />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight leading-none">Personal_Registry</h3>
          </div>
          <button 
            onClick={() => {
              setIsAdding(!isAdding);
              if (isAdding) setEditingId(null);
              if (!isAdding) { setNewName(''); setNewPhone(''); }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-mono uppercase tracking-widest text-slate-400 hover:border-brand-accent hover:text-white transition-all"
          >
            <UserPlus size={14} />
            {isAdding ? "Cancel_Entry" : "Add_Node"}
          </button>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-brand-card border border-slate-800 rounded-2xl p-6 shadow-2xl relative z-10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block ml-1">Node_Identity</label>
                  <input 
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter name..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-brand-accent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block ml-1">Comms_Link</label>
                  <input 
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Enter phone number..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-brand-accent transition-colors"
                  />
                </div>
              </div>
              <button 
                onClick={handleAdd}
                className="w-full mt-6 bg-brand-primary text-white py-3 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-brand-primary/20"
              >
                {editingId ? "UPDATE_DATA_PACKET" : "COMMIT_DATA"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contacts.length === 0 ? (
            <div className="col-span-full border border-dashed border-slate-800 rounded-2xl p-12 text-center">
              <p className="text-xs font-mono text-slate-600 uppercase tracking-widest italic italic">No personal nodes registered in system.</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <motion.div
                key={contact.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-brand-card border border-slate-800 rounded-2xl p-5 flex items-center justify-between group hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-brand-accent uppercase font-bold text-xs">
                    {contact.name.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{contact.name}</h4>
                    <p className="text-[10px] font-mono text-brand-accent tracking-tighter mt-0.5">{contact.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => startEdit(contact)}
                    className="p-2 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg hover:text-brand-accent hover:border-brand-accent transition-all"
                  >
                    <UserPlus size={16} />
                  </button>
                  <a 
                    href={`tel:${contact.phone}`}
                    className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-inner"
                  >
                    <Phone size={16} />
                  </a>
                  <button 
                    onClick={() => removeContact(contact.id)}
                    className="p-2 bg-rose-500/5 text-rose-500/50 border border-rose-500/10 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <p className="text-center text-slate-700 text-[10px] font-mono uppercase tracking-[0.3em] pb-8">
        Diagnostic: Connection to support is stable and secure.
      </p>
    </div>
  );
}
