import './Popup.css';
import { useState } from 'react';
import PGenerator from "./components/PG/PasswordGenerator";

export const Popup = () => {
  return (
    <div className="popup">
      <div className="flex space-x-2 mb-4">
        <PGenerator />
      </div>
    </div>
  );
};

export default Popup;
