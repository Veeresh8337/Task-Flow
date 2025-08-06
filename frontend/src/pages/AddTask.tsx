import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { TaskModal } from '@/components/tasks/TaskModal';
import { Task } from '@/components/tasks/TaskCard';

export default function AddTask() {
  const navigate = useNavigate();
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

  const handleTaskCreate = (taskData: Partial<Task>) => {
    console.log('Creating task:', taskData);
    // In a real app, this would save to the backend
    navigate('/dashboard');
  };

  const handleClose = () => {
    navigate('/dashboard');
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
        
        <main className="flex-1 overflow-hidden flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Create New Task</h1>
              <p className="text-muted-foreground">Add a new task to your project</p>
            </div>
            
            <TaskModal
              isOpen={true}
              onClose={handleClose}
              onSave={handleTaskCreate}
            />
          </div>
        </main>
      </div>
    </div>
  );
}