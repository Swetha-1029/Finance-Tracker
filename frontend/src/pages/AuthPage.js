import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { AuthContext, API } from '../App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, TrendingUp, Shield } from 'lucide-react';

const AuthPage = () => {
  const { login } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', name: '' });

 const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const response = await axios.post(`${API}/auth/login`, loginData);
    
    // ✅ FIXED - Store token + success message + redirect
    localStorage.setItem('token', response.data.token);  // 👈 STORE TOKEN
    login(response.data.token, response.data.user);      // 👈 YOUR LOGIN FUNC
    toast.success('✅ Login successful! Welcome back!'); // 👈 SUCCESS TOAST
    
    // 👈 AUTO-REDIRECT (if using react-router)
    // navigate('/dashboard'); 
    
  } catch (error) {
    console.error('Login error:', error.response?.data);
    toast.error(error.response?.data?.detail || 'Login failed - check credentials');
  } finally {
    setIsLoading(false);
  }
};


 const handleSignup = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    console.log('🚀 SENDING DATA:', signupData); // 🔍 DEBUG
    
    const response = await axios.post(
      `${API}/auth/signup`,
      signupData,
      {
        headers: {
          'Content-Type': 'application/json',  // ✅ FORCE JSON
        }
      }
    );
    
    login(response.data.token, response.data.user);
    toast.success('Account created successfully!');
  } catch (error) {
    console.error('❌ FULL ERROR:', error.response?.data); // 🔍 SEE EXACT ERROR
    toast.error(error.response?.data?.detail || 'Signup failed');
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-stone-900 to-stone-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">FinanceAI</h1>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Smart Finance<br />Management Made Simple
          </h2>
          <p className="text-stone-300 text-lg leading-relaxed">
            Track expenses, set budgets, and get AI-powered insights to achieve your financial goals.
          </p>
        </div>
        
        <div className="relative z-10 grid grid-cols-1 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">AI-Powered Insights</h3>
              <p className="text-stone-400 text-sm">Get personalized recommendations and spending predictions</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Secure & Private</h3>
              <p className="text-stone-400 text-sm">Your financial data is encrypted and protected</p>
            </div>
          </div>
        </div>

        <div className="absolute top-20 right-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
              <TabsTrigger value="signup" data-testid="signup-tab">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Welcome back</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        data-testid="login-email-input"
                        type="email"
                        placeholder="you@example.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        data-testid="login-password-input"
                        type="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 rounded-lg font-medium"
                      disabled={isLoading}
                      data-testid="login-submit-button"
                    >
                      {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="signup">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Create account</CardTitle>
                  <CardDescription>Start managing your finances smarter</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        data-testid="signup-name-input"
                        type="text"
                        placeholder="John Doe"
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        data-testid="signup-email-input"
                        type="email"
                        placeholder="you@example.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        data-testid="signup-password-input"
                        type="password"
                        placeholder="••••••••"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 rounded-lg font-medium"
                      disabled={isLoading}
                      data-testid="signup-submit-button"
                    >
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;