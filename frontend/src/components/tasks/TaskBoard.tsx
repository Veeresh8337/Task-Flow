import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCard, Task } from './TaskCard';
import { TaskModal } from './TaskModal';
import { cn } from '@/lib/utils';

interface TaskBoardProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskCreate: (task: Omit<Task, 'id'>) => void;
  searchQuery: string;
}

const columns = [
  { id: 'todo', title: 'To Do', status: 'todo' as const },
  { id: 'in-progress', title: 'In Progress', status: 'in-progress' as const },
  { id: 'done', title: 'Done', status: 'done' as const },
];

export function TaskBoard({
  tasks,
  onTaskUpdate,
  onTaskDelete,
  onTaskCreate,
  searchQuery,
}: TaskBoardProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      task.assignedUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTasksByStatus = (status: Task['status']) => {
    return filteredTasks.filter((task) => task.status === status);
  };

  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    console.log('Drag start:', { id: task.id, title: task.title, status: task.status });
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id); // For browser compatibility
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetStatus: Task['status']) => {
      e.preventDefault();
      if (!draggedTask) {
        console.warn('No dragged task found on drop');
        return;
      }
      if (draggedTask.status === targetStatus) {
        console.log('No status change needed:', { id: draggedTask.id, status: targetStatus });
        setDraggedTask(null);
        setDragOverColumn(null);
        return;
      }
      console.log('Dropping task:', {
        id: draggedTask.id,
        title: draggedTask.title,
        fromStatus: draggedTask.status,
        toStatus: targetStatus,
      });
      const updatedTask = { ...draggedTask, status: targetStatus, isUpdated: true };
      onTaskUpdate(updatedTask); // Trigger PATCH via MyTasks.tsx
      setDraggedTask(null);
      setDragOverColumn(null);
    },
    [draggedTask, onTaskUpdate]
  );

  const handleTaskEdit = (task: Task) => {
    console.log('Editing task:', { id: task.id, title: task.title });
    setEditingTask(task);
  };

  const handleTaskSave = (taskData: Partial<Task>) => {
    console.log('Saving task:', taskData);
    if (editingTask) {
      const updatedTask = {
        ...editingTask,
        ...taskData,
        isUpdated: true,
      };
      onTaskUpdate(updatedTask);
    } else {
      onTaskCreate(taskData as Omit<Task, 'id'>);
    }
    setEditingTask(null);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Task Board</h1>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="gradient-primary shadow-glow"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)] overflow-hidden">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.status);
          const isDragOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              className={cn(
                'flex flex-col bg-muted/30 rounded-lg p-4 border-2 border-dashed transition-colors',
                isDragOver ? 'border-primary bg-primary/5' : 'border-transparent'
              )}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground">{column.title}</h2>
                <span className="text-sm text-muted-foreground bg-accent px-2 py-1 rounded-full">
                  {columnTasks.length}
                </span>
              </div>

              {/* Task List */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    className="cursor-move"
                  >
                    <TaskCard
                      task={task}
                      onEdit={handleTaskEdit}
                      onDelete={onTaskDelete}
                      isDragging={draggedTask?.id === task.id}
                    />
                  </div>
                ))}

                {columnTasks.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                    <p className="text-sm">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      <TaskModal
        task={editingTask}
        isOpen={editingTask !== null || isCreateModalOpen}
        onClose={() => {
          setEditingTask(null);
          setIsCreateModalOpen(false);
        }}
        onSave={handleTaskSave}
      />
    </div>
  );
}