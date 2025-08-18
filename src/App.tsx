import React, { useState } from 'react';
import ThreeScene from './components/ThreeScene';
import PanelContainer, { PanelKey } from './components/PanelContainer';

export default function App() {
  const [open, setOpen] = useState<PanelKey[]>([]);

  const toggle = (key: PanelKey) => {
    setOpen(prev => prev.includes(key) ? prev.filter(k => k!==key) : [...prev, key]);
  };

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="logo"><img src="./public/icons/logo.png" alt="" /></div>
      </header>
      <div className="workspace">
        <ThreeScene onIconClick={toggle} activePanels={open} />
        <PanelContainer openPanels={open} onClose={(k)=> setOpen(prev=>prev.filter(x=>x!==k))} />
      </div>
      <footer className="footer">Prototype — Quake3 Dashboard</footer>
    </div>
  );
}
