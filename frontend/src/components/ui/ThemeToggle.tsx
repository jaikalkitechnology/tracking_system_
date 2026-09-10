import { useTheme } from "@/context/ThemeContext";
import { IconMoon, IconSun } from "@/components/ui/icons";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100"
    >
      {theme === "dark" ? <IconSun /> : <IconMoon />}
    </button>
  );
}
