
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, LayoutDashboard, History, FileText, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);
  
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: 'History',
      href: '/history',
      icon: <History className="h-5 w-5" />,
    }
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const NavContent = () => (
    <>
      <div className="flex items-center h-14 px-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <span className="font-medium">Energy Bill Splitter</span>
        </Link>
      </div>
      
      <ScrollArea className="flex-1 pb-4">
        <nav className="grid gap-1 px-2 py-4">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={`
                flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors
                ${isActive(item.href) 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'}
              `}
            >
              {item.icon}
              <span>{item.name}</span>
              {isActive(item.href) && (
                <ChevronRight className="h-4 w-4 ml-auto" />
              )}
            </Link>
          ))}
        </nav>
        
        <Separator className="my-2" />
        
        <div className="px-4 py-2">
          <h3 className="text-sm font-medium">Created with</h3>
          <div className="mt-2 flex items-center">
            <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Lovable AI</span>
          </div>
        </div>
      </ScrollArea>
    </>
  );
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for desktop */}
      {!isMobile && (
        <aside className="w-64 border-r flex flex-col bg-background">
          <NavContent />
        </aside>
      )}
      
      {/* Mobile sheet navigation */}
      {isMobile && (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex h-14 items-center px-4 border-b lg:hidden">
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <Link to="/" className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Energy Bill Splitter</span>
            </Link>
          </div>
          
          <SheetContent side="left" className="p-0 w-64">
            <NavContent />
          </SheetContent>
        </Sheet>
      )}
      
      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {isMobile && (
          <div className="h-14 border-b"></div>
        )}
        <div className="flex-1 overflow-auto animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
