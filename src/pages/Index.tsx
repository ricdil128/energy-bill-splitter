import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, LineChart, Shield, Cloud } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Index: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ripartisci e Gestisci le Tue Bollette Energetiche
                </h1>
                <p className="text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Un'applicazione semplice ma potente per dividere equamente i costi energetici 
                  tra diverse unità, tracciare i consumi nel tempo e ottimizzare le tue spese.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link to={user ? "/dashboard" : "/auth"}>
                    <Button className="px-8">
                      {user ? "Vai alla Dashboard" : "Inizia Ora"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  {!user && (
                    <Link to="/auth">
                      <Button variant="outline">
                        Accedi
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img 
                  src="/placeholder.svg" 
                  alt="Energy Bill Splitter Screenshot" 
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last" 
                  width={500} 
                  height={310} 
                />
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Funzionalità Principali
                </h2>
                <p className="text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Tutto ciò di cui hai bisogno per gestire al meglio le tue bollette energetiche
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <LineChart className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Analisi dei Consumi</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Monitora e analizza i consumi energetici nel tempo per individuare opportunità di risparmio.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Account Sicuro</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Proteggi i tuoi dati con un account personale e accedi da qualsiasi dispositivo.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Cloud className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Sincronizzazione Cloud</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tutti i tuoi dati sono sincronizzati automaticamente e disponibili su tutti i tuoi dispositivi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Pronto a Iniziare?
                </h2>
                <p className="text-gray-500 dark:text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Crea un account gratuito e inizia a gestire le tue bollette energetiche in modo intelligente.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Link to={user ? "/dashboard" : "/auth"}>
                  <Button className="w-full">
                    {user ? "Vai alla Dashboard" : "Inizia Ora"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full border-t items-center justify-center px-4 md:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Ripartizione Bollette. Tutti i diritti riservati.
        </p>
      </footer>
    </div>
  );
};

export default Index;
