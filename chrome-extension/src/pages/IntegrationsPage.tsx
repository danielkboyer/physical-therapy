import { useState } from 'react';
import { trpc } from '../trpc-client';
import { Button, Card } from '@pt-app/shared-ui';
import { Plug, Check, Clock } from 'lucide-react';
import EnableIntegrationModal from '../components/EnableIntegrationModal';
import { EmrType } from '@pt-app/shared-models';

interface IntegrationsPageProps {
  clinicId: string;
}

interface IntegrationCardData {
  name: string;
  description: string;
  logo?: string;
  available: boolean;
  emrType: EmrType;
}

const availableIntegrations: Record<EmrType, IntegrationCardData> = {
  [EmrType.PROMPT]: {
    name: 'Prompt EMR',
    description: 'Automatically sync patient and visit data from Prompt EMR',
    emrType: EmrType.PROMPT,
    available: true,
  },
  [EmrType.WEBPT]: {
    name: 'WebPT',
    description: 'Connect your WebPT account to sync patient information',
    emrType: EmrType.WEBPT,
    available: false,
  },
  [EmrType.CLINICIENT]: {
    name: 'Clinicient',
    description: 'Integrate with Clinicient for seamless data management',
    emrType: EmrType.CLINICIENT,
    available: false,
  },
};

export default function IntegrationsPage({ clinicId }: IntegrationsPageProps) {
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationCardData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: activeIntegrations, isPending, isFetching } = trpc.emrIntegration.getByClinic.useQuery(
    {
      clinicId,
    },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Only show loading on initial load, not on refetches
  const isInitialLoad = isPending && isFetching;

  const isIntegrationActive = (emrType: string) => {
    return activeIntegrations?.some(
      (integration) => integration.emrType === emrType && integration.isActive
    );
  };

  const handleConnectClick = (integration: IntegrationCardData) => {
    if (!integration.available) return;
    setSelectedIntegration(integration);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your EMR systems to automatically sync patient and visit data
        </p>
      </div>

      {isInitialLoad ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.keys(availableIntegrations).map((key) => (
            <Card key={key} className="p-6 animate-pulse">
              <div className="h-6 bg-muted rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(availableIntegrations).map((integration) => {
            const isActive = isIntegrationActive(integration.emrType);
            const isAvailable = integration.available;

            return (
              <Card
                key={integration.emrType}
                className={`p-6 relative ${!isAvailable ? 'opacity-60' : ''}`}
              >
                {!isAvailable && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Coming Soon
                    </span>
                  </div>
                )}

                {isActive && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 dark:bg-green-900 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                      <Check className="h-3 w-3" />
                      Connected
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Plug className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {integration.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  {isActive ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      Connected
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleConnectClick(integration)}
                      disabled={!isAvailable}
                      className="w-full"
                    >
                      {isAvailable ? 'Connect' : 'Coming Soon'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {selectedIntegration && (
        <EnableIntegrationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedIntegration(null);
          }}
          integration={selectedIntegration}
          clinicId={clinicId}
        />
      )}
    </div>
  );
}
