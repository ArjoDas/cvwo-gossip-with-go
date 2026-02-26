import { FormEvent } from 'react';
import { useThemeMode } from '../context/ThemeContext';

interface NavbarProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  onLogout: () => void;
  onOpenTopics: () => void;
}

export default function Navbar({
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  onLogout,
  onOpenTopics,
}: NavbarProps) {
  const { mode, toggleTheme } = useThemeMode();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/60 dark:border-stone-800/70 bg-white/70 dark:bg-stone-900/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 py-3">
          {/* Branding */}
          <button
            type="button"
            className="shrink-0 text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-50"
          >
            Gossip
          </button>

          {/* Search */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 hidden sm:flex"
          >
            <div className="w-full relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-400">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.167 3.333A5.833 5.833 0 1 0 9.167 15a5.833 5.833 0 0 0 0-11.667Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 15l-1.875-1.875"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Search posts..."
                className="w-full rounded-full border border-stone-200/80 dark:border-stone-700 bg-white/70 dark:bg-stone-900/80 pl-9 pr-4 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:border-transparent transition"
              />
            </div>
          </form>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200/70 dark:border-stone-700 bg-white/70 dark:bg-stone-900/80 text-stone-700 dark:text-stone-200 shadow-sm hover:bg-stone-100/80 dark:hover:bg-stone-800 transition"
              aria-label="Toggle dark mode"
            >
              {mode === 'dark' ? (
                // Sun
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M12 3v2.5M12 18.5V21M4.22 4.22l1.77 1.77M17.99 17.99l1.79 1.79M3 12h2.5M18.5 12H21M4.22 19.78l1.77-1.77M17.99 6.01l1.79-1.79" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              ) : (
                // Moon
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 14.5A7.5 7.5 0 0 1 10.5 5 6 6 0 1 0 20 14.5Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenTopics}
              className="hidden sm:inline-flex items-center rounded-full border border-stone-200/80 dark:border-stone-700 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 bg-white/70 dark:bg-stone-900/80 hover:bg-stone-100/80 dark:hover:bg-stone-800 transition"
            >
              Topics
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center rounded-full bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 px-3 py-1.5 text-xs font-semibold shadow-sm hover:bg-stone-800 dark:hover:bg-stone-200 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSubmit} className="sm:hidden pb-3">
          <div className="w-full relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-400">
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.167 3.333A5.833 5.833 0 1 0 9.167 15a5.833 5.833 0 0 0 0-11.667Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 15l-1.875-1.875"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search posts..."
              className="w-full rounded-full border border-stone-200/80 dark:border-stone-700 bg-white/70 dark:bg-stone-900/80 pl-9 pr-4 py-2 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:border-transparent transition"
            />
          </div>
        </form>
      </div>
    </header>
  );
}

