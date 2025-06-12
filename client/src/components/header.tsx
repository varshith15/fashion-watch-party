import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Settings } from "lucide-react";

export default function Header() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glassmorphism border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-apple-blue to-apple-orange rounded-full flex items-center justify-center">
              <i className="fas fa-play text-white text-sm"></i>
            </div>
            <h1 className="text-lg font-semibold">Fashion Stream Live</h1>
          </div>
          
          <div className="flex items-center space-x-2 px-3 py-1 bg-apple-red rounded-full text-white text-sm">
            <div className="w-2 h-2 bg-white rounded-full pulse-live"></div>
            <span className="font-medium">LIVE</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <i className="fas fa-eye"></i>
            <span className="text-sm">2.4K</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
