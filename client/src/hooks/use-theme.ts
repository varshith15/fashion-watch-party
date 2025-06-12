import { useContext } from "react";
import { ThemeProvider } from "@/components/theme-provider";

export function useTheme() {
  const context = useContext(ThemeProvider as any);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  const toggleTheme = () => {
    context.setTheme(context.theme === "light" ? "dark" : "light");
  };

  return {
    ...context,
    toggleTheme,
  };
}
