import { useState } from 'react';
import { trpc } from '../trpc-client';
import { Button } from '@pt-app/shared-ui';
import { X, Plug } from 'lucide-react';
import { EmrType } from '@pt-app/shared-models';
import { assertNever } from '@pt-app/react-utils';

interface IntegrationCardData {
  name: string;
  description: string;
  emrType: EmrType;
  available: boolean;
}

interface EnableIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: IntegrationCardData;
  clinicId: string;
}

export default function EnableIntegrationModal({
  isOpen,
  onClose,
  integration,
  clinicId,
}: EnableIntegrationModalProps) {
  const [isEnabling, setIsEnabling] = useState(false);
  const utils = trpc.useUtils();

  const createIntegration = trpc.emrIntegration.create.useMutation({
    onSuccess: () => {
      utils.emrIntegration.getByClinic.invalidate({ clinicId });
      onClose();
    },
  });

  const handleEnable = async () => {
    setIsEnabling(true);
    try {
      // Build the config based on the EMR type using exhaustive switch
      const config = (() => {
        switch (integration.emrType) {
          case EmrType.PROMPT:
            return { emrType: EmrType.PROMPT as const, authConfig: {} };
          case EmrType.WEBPT:
            return {
              emrType: EmrType.WEBPT as const,
              authConfig: { apiKey: '', apiSecret: '' },
            };
          case EmrType.CLINICIENT:
            return {
              emrType: EmrType.CLINICIENT as const,
              authConfig: { username: '', apiToken: '', organizationId: '' },
            };
          default:
            return assertNever(integration.emrType);
        }
      })();

      await createIntegration.mutateAsync({
        clinicId,
        config,
      });
    } catch (error) {
      console.error('Failed to enable integration:', error);
    } finally {
      setIsEnabling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Plug className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Enable {integration.name}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isEnabling}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Once enabled, PT AI will automatically detect when you're using {integration.name} and sync patient and visit information.
          </p>

          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">What will happen:</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Patient data will be synced from {integration.name}</li>
              <li>Visit information will be automatically imported</li>
              <li>You'll be able to access EMR data in the side panel</li>
            </ul>
          </div>

          {createIntegration.error && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
              Failed to enable integration. Please try again.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isEnabling}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEnable}
            disabled={isEnabling}
          >
            {isEnabling ? 'Enabling...' : 'Enable Integration'}
          </Button>
        </div>
      </div>
    </div>
  );
}
