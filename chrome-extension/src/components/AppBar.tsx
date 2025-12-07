import { Search } from 'lucide-react';
import { Button, Input, Avatar, AvatarFallback, SidebarTrigger } from '@pt-app/shared-ui';

interface AppBarProps {
  onProfileClick: () => void;
  onSearchChange: (value: string) => void;
  userName?: string;
}

export default function AppBar({
  onProfileClick,
  onSearchChange,
  userName
}: AppBarProps) {
  const userInitials = userName
    ? userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="h-14 border-b bg-background flex items-center px-4 gap-3 sticky top-0 z-50">
      <SidebarTrigger />

      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients..."
            className="pl-8"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onProfileClick}
        className="ml-auto"
        aria-label="Open profile"
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
      </Button>
    </div>
  );
}
