import { FormEvent, useMemo, useState } from 'react';
import { Bot, Mail, Send, Sparkles } from 'lucide-react';
import type { Conversation, KnowledgeItem, Message, Settings } from '../types';
import Button from './ui/Button';
import { escapeHtml } from '../lib/utils';
import { useToast } from './ToastProvider';

type WidgetChatProps = { knowledge: KnowledgeItem[]; settings: Settings; source?: Conversation['source'] };

function findAnswer(question: string, knowledge: KnowledgeItem[]) {
  const terms = question.toLowerCase().split(/\W+/).filter((term) => term.length > 2);
  const ranked = knowledge.map((item) => ({ item, score: terms.reduce((score, term) => score + (item.question.toLowerCase().includes(term) || item.answer.toLowerCase().includes(term) ? 1 : 0), 0) })).sort((a, b) => b.score - a.score);
  return ranked[0]?.score >= 1 ? ranked[0].item.answer : null;
}

export default function WidgetChat({ knowledge, settings, source = 'Website' }: WidgetChatProps) {
  const { pushToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [messages, setMessages] = useState<Message[]>([{ id: 'welcome', role: 'assistant', text: settings.welcomeMessage, createdAt: Date.now() }]);
  const conversationId = useMemo(() => crypto.randomUUID(), []);

  const captureLead = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email)) { setFieldError('Please enter your name and a valid email address.'); return; }
    setFieldError('');
    setSending(true);
    try {
      await window.genmb.kv.set(`replyharbor:lead:${crypto.randomUUID()}`, { id: crypto.randomUUID(), name: name.trim(), email: email.trim(), source, createdAt: Date.now() });
      setLeadSubmitted(true);
      pushToast({ variant: 'success', title: 'Details saved', description: 'You can now chat with the assistant.' });
    } catch (err) { pushToast({ variant: 'error', title: 'Could not save your details', description: err instanceof Error ? err.message : String(err) }); }
    finally { setSending(false); }
  };

  const sendQuestion = async (event: FormEvent) => {
    event.preventDefault();
    if (!question.trim() || !leadSubmitted) return;
    setSending(true);
    const visitorMessage: Message = { id: crypto.randomUUID(), role: 'visitor', text: question.trim(), createdAt: Date.now() };
    const answer = findAnswer(question, knowledge);
    const assistantMessage: Message = { id: crypto.randomUUID(), role: 'assistant', text: answer ?? `I do not have a confident answer for that yet. I have asked the ${settings.businessName} team to follow up.`, createdAt: Date.now() };
    const updatedMessages = [...messages, visitorMessage, assistantMessage];
    try {
      const conversation: Conversation = { id: conversationId, visitorName: name, visitorEmail: email, source, status: answer ? 'Resolved' : 'Needs follow-up', messages: updatedMessages, createdAt: messages[0]?.createdAt ?? Date.now(), updatedAt: Date.now() };
      await window.genmb.kv.set(`replyharbor:conversation:${conversationId}`, conversation);
      if (!answer) {
        const delivery = await window.genmb.email.send({
          to: settings.ownerEmail,
          subject: `Customer handoff: ${name} needs an answer`,
          replyTo: email,
          html: `<h2>New customer handoff</h2><p><strong>${escapeHtml(name)}</strong> (${escapeHtml(email)}) asked:</p><blockquote>${escapeHtml(visitorMessage.text)}</blockquote><p>Reply directly to this email to follow up.</p>`,
        });
        if (!delivery.sent) throw new Error('The handoff email was not accepted for delivery.');
      }
      setMessages(updatedMessages);
      setQuestion('');
      if (!answer) pushToast({ variant: 'info', title: 'A human has been notified', description: 'The team will follow up using your email address.' });
    } catch (err) { pushToast({ variant: 'error', title: 'Message was not sent', description: err instanceof Error ? err.message : String(err) }); }
    finally { setSending(false); }
  };

  return <section className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg" aria-label="Customer support chat">
    <div className="flex items-center gap-3 bg-primary px-5 py-4 text-primary-foreground"><span className="flex size-9 items-center justify-center rounded-full bg-[hsl(var(--primary-foreground)/0.16)]"><Sparkles className="size-4" /></span><div><h2 className="text-base font-semibold">{settings.businessName} assistant</h2><p className="text-xs text-[hsl(var(--primary-foreground)/0.78)]">Typically replies instantly</p></div></div>
    {!leadSubmitted ? <form onSubmit={captureLead} className="space-y-4 p-5">
      <div><h3 className="text-lg font-semibold tracking-tight">Before we begin</h3><p className="mt-1 text-sm text-muted-foreground">Share your details so our team can follow up if needed.</p></div>
      <div className="space-y-2"><label htmlFor="visitor-name" className="text-sm font-medium">Your name</label><input id="visitor-name" value={name} onChange={(event) => setName(event.target.value)} onBlur={() => !name.trim() && setFieldError('Your name is required.')} disabled={sending} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring disabled:bg-muted disabled:opacity-50" /></div>
      <div className="space-y-2"><label htmlFor="visitor-email" className="text-sm font-medium">Email address</label><input id="visitor-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} onBlur={() => email && !/^\S+@\S+\.\S+$/.test(email) && setFieldError('Enter a valid email address.')} disabled={sending} aria-invalid={Boolean(fieldError)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring disabled:bg-muted disabled:opacity-50 aria-[invalid=true]:border-destructive" /></div>
      {fieldError && <p className="text-sm text-destructive" role="alert">{fieldError}</p>}
      <Button type="submit" loading={sending} className="w-full"><Mail className="size-4" />Start chat</Button>
    </form> : <>
      <div className="flex h-80 flex-col gap-4 overflow-y-auto bg-muted/30 p-5">{messages.map((message) => <div key={message.id} className={message.role === 'visitor' ? 'ml-8 rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground' : 'mr-8 rounded-lg border border-border bg-card px-3 py-2 text-sm'}>{message.text}</div>)}</div>
      <form onSubmit={sendQuestion} className="flex gap-2 border-t border-border p-4"><label htmlFor="chat-question" className="sr-only">Ask a question</label><input id="chat-question" value={question} onChange={(event) => setQuestion(event.target.value)} disabled={sending} placeholder="Ask about products, prices, or hours…" className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:bg-muted disabled:opacity-50" /><Button type="submit" loading={sending} disabled={!question.trim()} aria-label="Send question"><Send className="size-4" /></Button></form>
    </>}
  </section>;
}
