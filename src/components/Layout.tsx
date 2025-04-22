import { useState } from "react";
import { Outlet, NavLink, useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  Menu, 
  X,
  ChevronRight,
  UserCircle,
  LogOut,
  Bell,
  FileText,
  Sun,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import PageTransition from "./PageTransition";
import Header from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/contexts/NotificationsContext";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User } from "@supabase/supabase-js";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Clients", path: "/clients", icon: <Users className="h-5 w-5" /> },
    { name: "Cases", path: "/cases", icon: <FolderOpen className="h-5 w-5" /> },
    { name: "Billing", path: "/invoices", icon: <FileText className="h-5 w-5" /> },
    { name: "Notifications", path: "/notifications", icon: <Bell className="h-5 w-5" />, badge: unreadCount > 0 ? unreadCount : undefined },
    { name: "Profile", path: "/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  // Auto-close sidebar on mobile when clicking a link
  const handleNavLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Get current page title from navItems
  const getCurrentPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case "/":
        return "Dashboard";
      case "/clients":
        return "Clients";
      case "/cases":
        return "Cases";
      case "/invoices":
        return "Invoices";
      case "/profile":
        return "Profile";
      default:
        return "Legal Billing";
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className={cn(
          "fixed left-4 top-4 z-50 rounded-md p-2 text-slate-300 hover:bg-slate-800 lg:hidden transition-opacity duration-200",
          sidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-200",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "border-r bg-slate-900 dark:bg-slate-950 border-slate-800 dark:border-slate-800"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-50">Legal Billing</h2>
          <button
            onClick={toggleSidebar}
            className="rounded-md p-1 text-slate-300 hover:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md px-4 py-3 text-base font-medium transition-colors",
                  isActive
                    ? "bg-slate-800 text-slate-50 dark:bg-slate-800"
                    : "text-slate-300 hover:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                )
              }
              end={item.path === "/dashboard"}
              onClick={handleNavLinkClick}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.name}</span>
              {item.badge && item.badge > 0 && (
                <Badge variant="destructive" className="ml-auto h-6 w-6 flex items-center justify-center p-0 text-xs">
                  {item.badge > 9 ? '9+' : item.badge}
                </Badge>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        {user && (
          <div className="mt-auto border-t border-slate-800 dark:border-blue-900">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-3 flex-1 hover:bg-slate-800 dark:hover:bg-blue-900 rounded-md p-2 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={user.user_metadata?.avatar_url} 
                      alt={user.user_metadata?.full_name || user.email} 
                    />
                    <AvatarFallback className="bg-slate-800 dark:bg-blue-900 text-slate-50 dark:text-blue-200">
                      {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-50 truncate">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    {user.user_metadata?.full_name && (
                      <p className="text-xs text-slate-300 truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-slate-50 hover:bg-slate-800 dark:text-blue-300 dark:hover:text-blue-50 dark:hover:bg-blue-900"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full">
        <header className="h-16 border-b bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <div className="h-full px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">
                {getCurrentPageTitle()}
              </h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(!showNotifications)}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user?.user_metadata?.avatar_url} 
                        alt={user?.user_metadata?.full_name || user?.email} 
                      />
                      <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.user_metadata?.full_name || user?.email}
                      </p>
                      <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-3 md:p-4">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 z-50" onClick={() => setShowNotifications(false)}>
          <div className="absolute right-2 md:right-4 top-16 w-[calc(100%-1rem)] md:w-80 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 max-w-sm mx-2 md:mx-0">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
            </div>
            <div className="p-4">
              {unreadCount === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No new notifications</p>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">You have {unreadCount} unread notifications</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
