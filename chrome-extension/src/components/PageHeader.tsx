import { Button } from '@pt-app/shared-ui';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  onBack: () => void;
}

export default function PageHeader({ title, onBack }: PageHeaderProps) {
  return (
    <div className="flex items-center mb-4 relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        aria-label="Go back"
        className="absolute left-0"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-2xl font-semibold flex-1 text-center">{title}</h1>
    </div>
  );
}
