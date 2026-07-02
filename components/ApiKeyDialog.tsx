/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { KeyRound, ExternalLink, X } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, clearStoredApiKey } from '../services/apiKey';

interface ApiKeyDialogProps {
  onContinue: () => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onContinue }) => {
  const [keyInput, setKeyInput] = useState(getStoredApiKey() || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const trimmed = keyInput.trim();
    if (trimmed.length < 10) return;
    setStoredApiKey(trimmed);
    setSaved(true);
    setTimeout(onContinue, 400);
  };

  const handleSkip = () => {
    clearStoredApiKey();
    onContinue();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4 animate-fade-in">
      <div className="glass-panel bg-zinc-900/95 border border-zinc-700 rounded-2xl shadow-2xl max-w-lg w-full p-8 flex flex-col items-center relative">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="bg-indigo-600/20 p-4 rounded-full mb-6">
          <KeyRound className="w-12 h-12 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3 text-center">Gemini API ключ (безплатен)</h2>
        <p className="text-zinc-300 mb-4 text-sm text-center">
          С безплатен ключ от Google AI Studio получаваш AI генериране на мокъпи, лога и маркетингови описания.
          Ключът се пази <strong>само в твоя браузър</strong> (localStorage) — не се изпраща никъде другаде.
        </p>
        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-indigo-400 hover:underline font-medium mb-5 text-sm"
        >
          Вземи безплатен ключ от AI Studio <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="AIza..."
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white font-mono text-sm mb-4 focus:outline-none focus:border-indigo-500 placeholder-zinc-500"
          autoFocus
        />
        <button
          onClick={handleSave}
          disabled={keyInput.trim().length < 10}
          className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20 mb-3"
        >
          {saved ? '✓ Запазено' : 'Запази ключа'}
        </button>
        <button
          onClick={handleSkip}
          className="text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
        >
          Продължи без ключ (локален режим)
        </button>
      </div>
    </div>
  );
};

export default ApiKeyDialog;
