import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="flex justify-center items-center py-4 bg-[#F7F9FC] text-slate-600 text-xs">
      © danysoftdev (
      <a href="https://danysoftdev.com" target="_blank" rel="noopener noreferrer" className="text-[#734DFD] hover:underline">
        danysoftdev.com
      </a>
      )
    </footer>
  );
};
