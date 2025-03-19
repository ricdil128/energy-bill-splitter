
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthForm: React.FC = () => {
  const { signIn, signUp, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) return;
    
    if (activeTab === 'login') {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <Link to="/">
            <Button variant="ghost" size="icon" className="mb-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div></div> {/* Spacer for alignment */}
        </div>
        <CardTitle className="text-2xl text-center">
          {activeTab === 'login' ? 'Accedi al tuo account' : 'Crea un nuovo account'}
        </CardTitle>
        <CardDescription className="text-center">
          {activeTab === 'login' 
            ? 'Inserisci le tue credenziali per accedere' 
            : 'Registrati per salvare i tuoi dati energetici'}
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 mx-6">
          <TabsTrigger value="login">Accedi</TabsTrigger>
          <TabsTrigger value="register">Registrati</TabsTrigger>
        </TabsList>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="La tua email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="La tua password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Caricamento...
                </>
              ) : activeTab === 'login' ? 'Accedi' : 'Registrati'}
            </Button>
          </form>
        </CardContent>
      </Tabs>
      
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        {activeTab === 'login' ? (
          <p>
            Non hai un account?{' '}
            <button
              type="button"
              className="underline text-primary"
              onClick={() => setActiveTab('register')}
            >
              Registrati
            </button>
          </p>
        ) : (
          <p>
            Hai già un account?{' '}
            <button
              type="button"
              className="underline text-primary"
              onClick={() => setActiveTab('login')}
            >
              Accedi
            </button>
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
