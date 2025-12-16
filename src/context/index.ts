// Re-export all context exports for cleaner imports

// AuthContext
export { AuthProvider, useAuth } from './AuthContext';
export type { AuthContextType, User } from './AuthContext';

// SidebarContext
export { SidebarProvider, useSidebar } from './SidebarContext';

// ThemeContext
export { ThemeProvider, useTheme } from './ThemeContext';
