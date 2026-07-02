/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useCallback, useState } from 'react';

// With the Vercel proxy the browser never needs a key.
// The dialog is shown only when the API reports a missing/invalid server key.
export const useApiKey = () => {
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  const validateApiKey = useCallback(async (): Promise<boolean> => true, []);

  const handleApiKeyDialogContinue = useCallback(async () => {
    setShowApiKeyDialog(false);
  }, []);

  return {
    showApiKeyDialog,
    setShowApiKeyDialog,
    validateApiKey,
    handleApiKeyDialogContinue,
  };
};
