import { useState, useEffect } from 'react';
import { Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedUser: {
    name: string;
    avatar?: string;
    initials: string;
  };
  dueDate: string;
  isUpdated?: boolean;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  isDragging?: boolean;
}

const priorityColors = {
  low: 'priority-low',
  medium: 'priority-medium',
  high: 'priority-high',
  urgent: 'priority-urgent',
};

export function TaskCard({ task, onEdit, onDelete, isDragging }: TaskCardProps) {
  const [showLiveIndicator, setShowLiveIndicator] = useState(false);

  useEffect(() => {
    if (task.isUpdated) {
      setShowLiveIndicator(true);
      const timer = setTimeout(() => setShowLiveIndicator(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [task.isUpdated]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div
      className={cn(
        "task-card group relative rounded-lg border border-border bg-card p-4 shadow-soft hover:shadow-medium",
        isDragging && "task-card-dragging",
        showLiveIndicator && "live-indicator"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-sm leading-tight mb-1 text-card-foreground">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Edit className="mr-2 h-3 w-3" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">
              <Trash2 className="mr-2 h-3 w-3" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-3">
        <Badge className={cn("text-xs font-medium", priorityColors[task.priority])}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={task.assignedUser.avatar} alt={task.assignedUser.name} />
            <AvatarFallback className="text-xs bg-accent text-accent-foreground">
              {task.assignedUser.initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground">{task.assignedUser.name}</span>
        </div>

        <div
          className={cn(
            "flex items-center gap-1",
            isOverdue ? "text-destructive" : "text-muted-foreground"
          )}
        >
          <Calendar className="h-3 w-3" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
      </div>

      {showLiveIndicator && (
        <div className="absolute -top-1 -right-1 h-3 w-3">
          <div className="h-3 w-3 bg-primary rounded-full animate-pulse" />
          <div className="absolute top-0 left-0 h-3 w-3 bg-primary rounded-full animate-ping" />
        </div>
      )}
    </div>
  );
}