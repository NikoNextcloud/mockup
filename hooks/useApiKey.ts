/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useCallback, useEffect, useState } from 'react';
import { hasApiKey } from '../services/apiKey';

export const useApiKey = () => {
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  const validateApiKey = useCallback(async (): Promise<boolean> => {
    // Always allow proceeding — the app has a full local canvas fallback.
    // Show the dialog once if no key is stored yet.
    return true;
  }, []);

  // On first visit (no key stored and not dismissed before), show the dialog
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('gemini_key_dialog_dismissed');
      if (!hasApiKey() && !dismissed) {
        setShowApiKeyDialog(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleApiKeyDialogContinue = useCallback(async () => {
    setShowApiKeyDialog(false);
    try {
      localStorage.setItem('gemini_key_dialog_dismissed', '1');
    } catch {
      // ignore
    }
  }, []);

  return {
    showApiKeyDialog,
    setShowApiKeyDialog,
    validateApiKey,
    handleApiKeyDialogContinue,
  };
};
