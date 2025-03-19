
import React from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const Auth: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  // Reindirizza alla dashboard se l'utente è già autenticato
  if (user && !isLoading) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Ripartizione Bollette</h1>
            <p className="mt-2 text-muted-foreground">
              Gestisci e dividi le tue bollette energetiche in modo semplice ed efficiente
            </p>
          </div>
          
          <AuthForm />
          
          <p className="text-center text-sm text-muted-foreground">
            Accedendo, potrai salvare i tuoi dati sul cloud e accedervi da qualsiasi dispositivo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
