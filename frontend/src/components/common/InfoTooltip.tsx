import React, { useState } from 'react';
import './InfoTooltip.css';

interface InfoTooltipProps {
  title: string;
  content: string | React.ReactNode;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ title, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="info-tooltip-wrapper">
      <button
        className="info-tooltip-trigger"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        aria-label={`Informacion sobre ${title}`}
      >
        i
      </button>
      {isOpen && (
        <div className="info-tooltip-content">
          <div className="info-tooltip-header">{title}</div>
          <div className="info-tooltip-body">{content}</div>
        </div>
      )}
    </div>
  );
};
