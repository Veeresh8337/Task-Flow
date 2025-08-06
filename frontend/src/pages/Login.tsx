import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import axiosInstance from '@/utils/axiosInstance';
import Cookies from 'js-cookie';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/users/login', formData);

      console.log('✅ Logged in:', JSON.stringify(response.data, null, 2));
      const { user, accessToken, refreshToken } = response.data.data;

      if (accessToken && user) {
        Cookies.set('access_token', accessToken, { expires: 1, sameSite: 'Lax' /* secure: true if using HTTPS */ });
        if (refreshToken) {
          Cookies.set('refresh_token', refreshToken, { expires: 7, sameSite: 'Lax' });
        }

        Cookies.set(
          'user',
          JSON.stringify({
            fullName: user.fullName || user.username || formData.email.split('@')[0],
            username: user.username || formData.email.split('@')[0],
            email: user.email || formData.email,
            avatarUrl: user.avatarUrl || '/api/placeholder/40/40',
            isPremium: user.isPremium || false,
          }),
          { expires: 1, sameSite: 'Lax' }
        );

        console.log('✅ Stored in cookies');
        navigate('/dashboard', { replace: true });
      } else {
        console.warn('❌ No accessToken or user data in login response');
        alert('Login failed: Missing token or user');
      }
    } catch (error: any) {
      console.error('❌ Login error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      alert(error?.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-surface p-4">
      <Card className="w-full max-w-md shadow-large">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
            <div className="w-6 h-6 bg-primary-foreground rounded-sm" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your TaskFlow account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full gradient-primary shadow-glow" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
