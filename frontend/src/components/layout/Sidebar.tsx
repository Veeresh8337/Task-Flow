import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  CheckSquare, 
  User, 
  ListTodo, 
  Plus, 
  X,
  Menu,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'All Tasks', href: '/dashboard', icon: ListTodo },
  { name: 'My Tasks', href: '/my-tasks', icon: User },
  { name: 'Completed', href: '/completed', icon: CheckSquare },
  { name: 'Add Task', href: '/add-task', icon: Plus },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden",
          isOpen ? "block" : "hidden"
        )}
        onClick={onToggle}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-72 transform bg-card border-r border-border transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
              TaskFlow
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-smooth",
                      isActive
                        ? "bg-accent text-accent-foreground shadow-soft"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                    )
                  }
                  onClick={() => {
                    // Close mobile sidebar when navigating
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-6 left-4 right-4">
          <div className="rounded-lg bg-gradient-primary p-4 text-primary-foreground">
            <h3 className="font-semibold text-sm mb-1">Real-time Sync</h3>
            <p className="text-xs opacity-90">
              Your tasks sync automatically across all devices
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}