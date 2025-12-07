import { Users, Calendar, Plug, ChevronLeft } from 'lucide-react';
import { Button, cn } from '@pt-app/shared-ui';

interface AppSidebarProps {
  currentTab: 'patients' | 'visits' | 'integrations';
  onTabChange: (tab: 'patients' | 'visits' | 'integrations') => void;
  isOpen: boolean;
  onClose: () => void;
}

const items = [
  {
    id: 'patients' as const,
    title: 'Patients',
    icon: Users,
  },
  {
    id: 'visits' as const,
    title: 'Visits',
    icon: Calendar,
  },
  {
    id: 'integrations' as const,
    title: 'Integrations',
    icon: Plug,
  },
];

export default function AppSidebar({ currentTab, onTabChange, isOpen, onClose }: AppSidebarProps) {
  const handleTabChange = (tab: 'patients' | 'visits' | 'integrations') => {
    onTabChange(tab);
    onClose();
  };

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-background transition-all duration-300',
        isOpen ? 'w-52 opacity-100' : 'w-0 border-0 opacity-0 overflow-hidden'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b px-4 min-w-52">
        <h2 className="text-lg font-semibold tracking-tight">PT AI</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="ml-auto"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2 min-w-52">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.title}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
