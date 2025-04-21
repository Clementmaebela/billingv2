
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import NotificationBell from "./NotificationBell";

const Header = () => {
  const { user } = useAuth();
  const [initials, setInitials] = useState("?");
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (user?.user_metadata) {
      const { full_name, name } = user.user_metadata;
      const displayName = full_name || name || user.email;
      
      if (displayName) {
        // Get the first letter of each word in the name, up to 2 letters
        const initial = displayName
          .split(/\s+/)
          .map(word => word[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();
        
        setInitials(initial || '?');
      }
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side - can contain page title or breadcrumbs in the future */}
        <div className="flex items-center">
          {isMobile && (
            <h1 className="text-lg font-semibold text-[#1a365d]">Legal Billing</h1>
          )}
        </div>
        
        {/* Right side - user profile and notifications */}
        {user && (
          <div className="flex items-center gap-4">
            <NotificationBell />
            
            <Separator orientation="vertical" className="h-8" />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage 
                      src={user.user_metadata?.avatar_url} 
                      alt={user.user_metadata?.full_name || user.email} 
                    />
                    <AvatarFallback className="bg-[#1a365d] text-white">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user.user_metadata?.avatar_url} 
                      alt={user.user_metadata?.full_name || user.email} 
                    />
                    <AvatarFallback className="bg-[#1a365d] text-white">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{user.user_metadata?.full_name || user.email}</p>
                    {user.user_metadata?.full_name && (
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center cursor-pointer">
                    <UserCircle className="w-4 h-4 mr-2" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
