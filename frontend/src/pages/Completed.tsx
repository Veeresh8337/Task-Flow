import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { Task } from '@/components/tasks/TaskCard';

// Mock data for completed tasks
const completedTasks: Task[] = [
  {
    id: '4',
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated testing and deployment pipeline',
    status: 'done',
    priority: 'high',
    assignedUser: { name: 'Sarah Wilson', initials: 'SW' },
    dueDate: '2024-01-10',
  },
];

export default function Completed() {
  const [tasks, setTasks] = useState<Task[]>(completedTasks);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(currentTasks =>
      currentTasks.filter(task => task.id !== taskId)
    );
  };

  const handleTaskCreate = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
    };
    setTasks(currentTasks => [...currentTasks, newTask]);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="h-screen flex bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          onSidebarToggle={toggleSidebar}
          onSearch={handleSearch}
          isDark={isDarkMode}
          onThemeToggle={toggleTheme}
        />
        
        <main className="flex-1 overflow-hidden">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Completed Tasks</h1>
              <p className="text-muted-foreground">All finished tasks</p>
            </div>
          </div>
          <TaskBoard
            tasks={tasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            onTaskCreate={handleTaskCreate}
            searchQuery={searchQuery}
          />
        </main>
      </div>
    </div>
  );
}