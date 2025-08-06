// 📁 frontend/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { Task } from '@/components/tasks/TaskCard';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/v1/tasks', {
        withCredentials: true // ✅ sends cookies
      });
  
      const mappedTasks = res.data.data.map(task => ({
        id: task._id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assignedUser: {
          name: task.assignedTo?.name || 'Unknown',
          avatar: task.assignedTo?.avatar || '',
          initials: task.assignedTo?.name?.slice(0, 2).toUpperCase() || 'U',
        },
      }));
  
      setTasks(mappedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };
  

  useEffect(() => {
    fetchTasks();

    const interval = setInterval(() => {
      setTasks(currentTasks =>
        currentTasks.map(task => ({
          ...task,
          isUpdated: Math.random() > 0.95,
        }))
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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

  const handleTaskDelete = async (taskId: string) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/tasks/${taskId}`, {
        withCredentials: true,
      });
      setTasks(current => current.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleTaskCreate = async (taskData: Omit<Task, 'id'>) => {
    try {
      const res = await axios.post(
        'http://localhost:8000/api/v1/tasks',
        {
          ...taskData,
        },
        { withCredentials: true } // ✅ So token cookie is sent
      );
  
      const newTask = {
        id: res.data.data._id,
        title: res.data.data.title,
        description: res.data.data.description,
        status: res.data.data.status,
        priority: res.data.data.priority,
        dueDate: res.data.data.dueDate,
        assignedUser: {
          name: 'You',
          avatar: '',
          initials: 'YO',
        },
      };
  
      setTasks(currentTasks => [...currentTasks, newTask]);
    } catch (err) {
      console.error('Error creating task:', err);
    }
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
