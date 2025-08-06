import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { TaskBoard } from '../components/tasks/TaskBoard';
import { Task } from '../components/tasks/TaskCard';

interface MyTasksProps {
  // Add any props if needed
}

export function MyTasks(props: MyTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch tasks from backend on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/api/v1/tasks', {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        });
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleTaskUpdate = async (updatedTask: Task) => {
    const originalTasks = [...tasks]; // Backup for optimistic update rollback
    // Optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? { ...task, status: updatedTask.status } : task
      )
    );
    try {
      const response = await axios.put(
        `http://localhost:8000/api/v1/tasks/${updatedTask.id}`,
        { status: updatedTask.status },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        }
      );
      // Update state with backend response
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? { ...task, ...response.data } : task
        )
      );
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task. Please try again.');
      // Revert optimistic update
      setTasks(originalTasks);
    }
  };

  const handleTaskCreate = async (taskData: Omit<Task, 'id'>) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/tasks',
        taskData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        }
      );
      setTasks((prevTasks) => [...prevTasks, response.data]);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task. Please try again.');
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await axios.delete(`http://localhost:8000/api/v1/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      {isLoading ? (
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <TaskBoard
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
          onTaskCreate={handleTaskCreate}
          searchQuery={searchQuery}
        />
      )}
    </div>
  );
}