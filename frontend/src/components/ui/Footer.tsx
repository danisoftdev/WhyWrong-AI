import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="flex justify-center items-center py-4 text-xs text-slate-600 dark:text-slate-400">
      © <a href="https://danysoftdev.com" target="_blank" rel="noopener noreferrer" className="text-[#734DFD] hover:underline">
        danysoftdev.com
      </a>
    </footer>
  );
};
