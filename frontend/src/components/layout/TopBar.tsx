import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Menu, Bell, LogOut, Settings, Moon, Sun, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

interface TopBarProps {
  onSidebarToggle: () => void;
  onSearch: (query: string) => void;
  isDark: boolean;
  onThemeToggle: () => void;
}

interface User {
  fullName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  isPremium: boolean;
}

export function TopBar({
  onSidebarToggle,
  onSearch,
  isDark,
  onThemeToggle,
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (['/login', '/register'].includes(location.pathname)) {
      console.log('Skipping TopBar useEffect on login/register route:', location.pathname);
      setIsLoading(false);
      setUser(null);
      return;
    }

    console.log('TopBar useEffect triggered for path:', location.pathname);
    const loadUser = () => {
      setIsLoading(true);
      try {
        const accessToken = Cookies.get('access_token');
        const userData = Cookies.get('user');

        if (!accessToken || !userData) {
          console.warn('No access token or user data found, redirecting to login');
          navigate('/login', { replace: true });
          return;
        }

        const parsedUser: User = JSON.parse(userData);
        if (!parsedUser.username || !parsedUser.email) {
          throw new Error('Invalid user data: username or email missing');
        }

        setUser({
          fullName: parsedUser.fullName || parsedUser.username || 'Unknown User',
          username: parsedUser.username,
          email: parsedUser.email,
          avatarUrl: parsedUser.avatarUrl || '/api/placeholder/40/40',
          isPremium: parsedUser.isPremium || false,
        });
      } catch (error: any) {
        console.error('Error loading user data:', {
          message: error.message,
          fullError: JSON.stringify(error, null, 2),
        });
        setUser(null);
        navigate('/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [navigate, location.pathname]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleLogout = async () => {
    try {
      const accessToken = Cookies.get('access_token');
      if (accessToken) {
        await axios.post(
          'http://localhost:8000/api/v1/users/logout',
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        console.log('✅ Successfully logged out');
      }
    } catch (error: any) {
      console.error('❌ Logout error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        fullError: JSON.stringify(error, null, 2),
      });
    } finally {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      Cookies.remove('user');
      setUser(null);
      navigate('/login', { replace: true });
    }
  };

  if (isLoading) {
    return (
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          <p>Loading...</p>
        </div>
      </header>
    );
  }

  if (!user) {
    return (
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          <Button variant="ghost" onClick={() => navigate('/login')}>
            Sign In
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-72 pl-10 bg-background/50 border-border/50"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onThemeToggle} className="h-9 w-9">
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <div className="relative">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-11 w-11 rounded-full">
                <Avatar className="h-11 w-11 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarImage src={user.avatarUrl} alt={user.fullName} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-foreground text-white font-semibold text-lg">
                    {user.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                  {user.isPremium && (
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-1 shadow-lg">
                      <Crown className="h-4 w-4 text-white" />
                    </div>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{user.fullName}</p>
                    {user.isPremium && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
