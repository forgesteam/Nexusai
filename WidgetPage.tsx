import { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import WidgetChat from '../components/WidgetChat';
import { getKnowledge, getSettings } from '../lib/genmb';
import type { KnowledgeItem, Settings } from '../types';
import Skeleton from '../components/ui/Skeleton';

export default function WidgetPage({ embedded = false }: { embedded?: boolean }) {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]); const [settings, setSettings] = useState<Settings | null>(null); const [error, setError] = useState('');
  const load = async () => { try { const [items, config] = await Promise.all([getKnowledge(), getSettings()]); setKnowledge(items); setSettings(config); } catch (err) { setError(err instanceof Error ? err.message : String(err)); } };
  useEffect(() => { document.title = embedded ? 'Customer Support Chat' : 'Widget Preview | ReplyHarbor'; document.querySelector('meta[name="description"]')?.setAttribute('content', 'Ask a question using the ReplyHarbor customer support assistant.'); void load(); }, [embedded]);
  if (error) return <main className="min-h-screen bg-background p-4"><div className="mx-auto max-w-md rounded-lg border border-destructive/40 bg-card p-6"><p className="font-medium text-destructive">The chat widget could not load.</p><p className="mt-2 text-sm text-muted-foreground">{error}</p><button onClick={() => void load()} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Try again</button></div></main>;
  if (!settings) return <main className="min-h-screen bg-background p-4"><div className="mx-auto max-w-md"><Skeleton className="h-[560px] w-full rounded-xl" /></div></main>;
  if (embedded) return <main className="min-h-screen bg-background p-3"><WidgetChat knowledge={knowledge} settings={settings} /></main>;
  return <div className="mx-auto max-w-5xl space-y-8"><section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><ArrowLeft className="size-4" />Back to dashboard</Link><p className="mt-6 text-sm font-medium text-muted-foreground">Live customer experience</p><h1 className="text-3xl font-semibold tracking-tight">Widget preview</h1><p className="mt-2 max-w-prose text-muted-foreground">Try the chat exactly as a visitor would. Ask about the camp mug, shipping, hours, or trail blanket.</p></div><Link to="/embed" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ExternalLink className="size-4" />Open embed view</Link></section><div className="mx-auto max-w-md"><WidgetChat knowledge={knowledge} settings={settings} /></div></div>;
}
