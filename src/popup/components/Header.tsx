/**
 * Header component for the popup
 */

import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-icon">
          <Shield size={24} />
        </div>
        <div className="header-text">
          <h1 className="header-title">Prompt Monitor</h1>
          <p className="header-subtitle">Email Detection & Security</p>
        </div>
        <div className="header-status">
          <AlertTriangle size={16} className="status-icon" />
        </div>
      </div>
    </header>
  );
};

export default Header;
