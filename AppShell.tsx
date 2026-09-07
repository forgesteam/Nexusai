import { BotMessageSquare, BookOpen, LayoutDashboard, MessageSquareText, Moon, Settings, Sun } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/knowledge', label: 'Knowledge', icon: BookOpen },
  { to: '/conversations', label: 'Conversations', icon: MessageSquareText },
  { to: '/settings', label: 'Channels', icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(() => localStorage.getItem('replyharbor-theme') === 'dark');
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('replyharbor-theme', dark ? 'dark' : 'light'); }, [dark]);

  return <div className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"><BotMessageSquare className="size-5" aria-hidden="true" /></span>
          <span><span className="block text-base font-semibold tracking-tight">ReplyHarbor</span><span className="block text-xs text-muted-foreground">AI customer desk</span></span>
        </NavLink>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">Demo data</span>
          <button type="button" aria-label={dark ? 'Use light theme' : 'Use dark theme'} onClick={() => setDark((value) => !value)} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">{dark ? <Sun className="size-5" /> : <Moon className="size-5" />}</button>
        </div>
      </div>
    </header>
    <div className="mx-auto flex max-w-7xl">
      <nav aria-label="Primary navigation" className="hidden w-56 shrink-0 border-r border-border p-4 md:block">
        <div className="sticky top-4 space-y-2">{navItems.map((item) => { const Icon = item.icon; return <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => cn('flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', isActive && 'bg-accent text-primary')}><Icon className="size-4" />{item.label}</NavLink>; })}</div>
      </nav>
      <main className="min-w-0 flex-1 px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pb-12">{children}</main>
    </div>
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 md:hidden"><div className="grid grid-cols-4 gap-1">{navItems.map((item) => { const Icon = item.icon; return <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => cn('flex flex-col items-center gap-1 rounded-md px-2 py-2 text-xs font-medium text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', isActive && 'bg-accent text-primary')}><Icon className="size-5" />{item.label}</NavLink>; })}</div></nav>
  </div>;
}
