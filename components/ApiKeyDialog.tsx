/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { KeyRound, ExternalLink } from 'lucide-react';

interface ApiKeyDialogProps {
  onContinue: () => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onContinue }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4 animate-fade-in">
      <div className="glass-panel bg-zinc-900/95 border border-zinc-700 rounded-2xl shadow-2xl max-w-lg w-full p-8 flex flex-col items-center text-center">
        <div className="bg-indigo-600/20 p-4 rounded-full mb-6">
          <KeyRound className="w-12 h-12 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">AI режимът не е конфигуриран</h2>
        <p className="text-zinc-300 mb-4 text-sm">
          Сървърът няма валиден Gemini API ключ (или лимитът е изчерпан).
          Приложението продължава да работи с вградения <strong>локален композитор</strong>.
        </p>
        <p className="text-zinc-400 mb-6 text-sm">
          За да включиш AI генерирането: вземи безплатен ключ от{' '}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline font-medium inline-flex items-center gap-1"
          >
            Google AI Studio <ExternalLink className="w-3 h-3" />
          </a>{' '}
          и го добави във Vercel: <span className="font-mono text-xs bg-zinc-800 px-1.5 py-0.5 rounded">Settings → Environment Variables → GEMINI_API_KEY</span>, после Redeploy.
        </p>
        <button
          onClick={onContinue}
          className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
        >
          Разбрах, продължи в локален режим
        </button>
      </div>
    </div>
  );
};

export default ApiKeyDialog;
