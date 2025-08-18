import React from 'react';
import { motion } from 'framer-motion';

interface PanelProps {
  title: string;
  text: string;
}

export default function UIPanel({ title, text }: PanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'linear-gradient(135deg, #1c1c1c, #3a3a3a)',
        color: '#fff',
        border: '2px solid #ff2b00',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '10px',
        width: '300px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <h3 style={{ color: '#ffcc00', marginBottom: '10px' }}>{title}</h3>
      <p>{text}</p>
    </motion.div>
  );
}
