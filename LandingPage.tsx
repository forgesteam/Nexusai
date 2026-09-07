import { ArrowDownToLine, ArrowRight, BookOpen, Bot, Braces, Check, ChevronDown, Code2, FileText, FolderKanban, Image, LockKeyhole, Menu, Mic, Search, ShieldCheck, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { clearDeferredInstallPrompt, getDeferredInstallPrompt, subscribeToInstallPrompt, type InstallPromptEvent } from '../lib/pwa'
import NEXUS_LOGO from '../assets/nexus-symbol.svg'
const go = (path: string) => { window.location.assign(path) }

const features = [
  { icon: Bot, title: 'AI Chat', text: 'Fast conversations with reusable AI profiles, response actions, and regeneration.' },
  { icon: Search, title: 'Web Search', text: 'Ground answers in live web results and review cited sources.' },
  { icon: Image, title: 'Image Vision', text: 'Upload an image and ask NEXUS to describe, inspect, or extract text from it.' },
  { icon: FileText, title: 'Documents', text: 'Bring files into your workspace and ask contextual questions when configured.' },
  { icon: Code2, title: 'Code Workspace', text: 'Explain, debug, improve, and generate code in a focused developer view.' },
  { icon: Mic, title: 'Voice', text: 'Use voice tools when a compatible Voice Agent connection is configured.' },
  { icon: FolderKanban, title: 'Projects', text: 'Keep work organized with dedicated spaces and unique NEX project IDs.' },
  { icon: BookOpen, title: 'Library', text: 'Store workspace files in your private, authenticated library.' },
  { icon: Sparkles, title: 'Prompt Library', text: 'Save reusable instructions so your best workflows are always ready.' },
]

const faqs = [
  ['What is NEXUS AI?', 'NEXUS AI is an authenticated AI workspace that brings chat, web research, image analysis, projects, files, code tools, and reusable prompts together.'],
  ['Is NEXUS free?', 'You can create an account and try NEXUS free. Some AI and storage capabilities may depend on your workspace plan and configured services.'],
  ['Can I upload documents?', 'Yes. Signed-in users can upload supported files to their private Library. Document-aware workflows are available when the required workspace capability is configured.'],
  ['Can NEXUS analyze images?', 'Yes. NEXUS supports uploaded-image analysis for descriptions, visual questions, and OCR-style text extraction.'],
  ['Does NEXUS support coding?', 'Yes. The Code Workspace is designed for explaining, debugging, improving, and generating code.'],
  ['Does NEXUS have web search?', 'Yes. NEXUS can use live web grounding and surface source results for current research.'],
  ['Does NEXUS support voice?', 'NEXUS includes voice tooling. Live voice input depends on connecting a compatible Voice Agent for your workspace.'],
  ['How is my data handled?', 'Your workspace requires authentication, and private files are scoped to your signed-in workspace. You remain in control of saved memories and workspace content.'],
]

function WorkspacePreview() {
  return <div className="nexus-preview" aria-label="Preview of the NEXUS AI workspace">
    <aside><div className="preview-brand"><img src={NEXUS_LOGO} alt="" /> NEXUS</div><div className="preview-new">＋ New conversation</div><div className="preview-nav active">◉ Chat</div><div className="preview-nav">▣ Projects</div><div className="preview-nav">▤ Library</div><div className="preview-nav">⌘ Code</div><div className="preview-user">AA <span>Personal workspace</span></div></aside>
    <section><div className="preview-top"><span>NEXUS Chat</span><span className="preview-chip">Web grounded</span></div><div className="preview-chat"><div className="preview-question">Map a practical launch plan for our product update.</div><div className="preview-answer"><span className="preview-star">✦</span><p>I’ll outline the launch across product, messaging, and distribution—then turn it into clear project tasks.</p><div><i /> <i /> <i /></div></div></div><div className="preview-compose">Ask NEXUS anything <span>↑</span></div></section>
  </div>
}

const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null)
  const [installing, setInstalling] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [installError, setInstallError] = useState('')
  const closeNav = () => setMobileOpen(false)
  useEffect(() => {
    setInstalled(isStandalone())
    setInstallEvent(getDeferredInstallPrompt())
    const unsubscribe = subscribeToInstallPrompt((event) => {
      setInstallEvent(event)
      if (event) setInstallError('')
    })
    const handleInstalled = () => setInstalled(true)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      unsubscribe()
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])
  const install = async () => {
    if (!installEvent) return
    setInstalling(true)
    setInstallError('')
    try {
      await installEvent.prompt()
      const choice = await installEvent.userChoice
      if (choice.outcome === 'accepted') setInstalled(true)
    } catch (error) {
      setInstallError(error instanceof Error ? error.message : 'NEXUS could not open the install prompt. Please try again.')
    } finally {
      clearDeferredInstallPrompt(installEvent)
      setInstalling(false)
    }
  }
  return <main className="nexus-landing">
    <nav className="landing-nav" aria-label="Primary navigation"><a className="landing-logo" href="/" aria-label="NEXUS AI home"><img src={NEXUS_LOGO} alt="NEXUS AI" /><span>NEXUS <em>AI</em><small>by Aayushmaan</small></span></a><button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation" aria-expanded={mobileOpen}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button><div className={mobileOpen ? 'nav-links open' : 'nav-links'}><a onClick={closeNav} href="#features">Features</a><a onClick={closeNav} href="#tools">Tools</a><a onClick={closeNav} href="#security">Security</a><a onClick={closeNav} href="#faq">FAQ</a></div><div className="nav-actions"><button className="text-button" onClick={() => go('/login')}>Log in</button><button className="nav-cta" onClick={() => go('/signup')}>Try NEXUS Free <ArrowRight size={15} /></button></div></nav>

    <section className="landing-hero"><h1 className="sr-only">NEXUS AI — A next-generation intelligent workspace</h1><div className="eyebrow"><Sparkles size={14} /> NEXUS AI <span>by Aayushmaan</span></div><p className="hero-title">A next-generation<br /><strong>intelligent workspace.</strong></p><p className="hero-copy">NEXUS AI brings conversations, research, vision, documents, coding, and projects into one focused system that keeps context in motion.</p><div className="hero-actions"><button className="hero-primary" onClick={() => go('/signup')}>Start with NEXUS <ArrowRight size={18} /></button><a className="hero-secondary" href="#features">Explore NEXUS <ChevronDown size={17} /></a></div><WorkspacePreview /></section>

    <section className="product-strip" aria-label="NEXUS AI capabilities">{['AI Chat','Web Search','Vision','Documents','Code','Voice','Projects','Library'].map(item => <span key={item}><Check size={14} /> {item}</span>)}</section>

    <section id="features" className="landing-section feature-section"><div className="section-kicker">CAPABILITIES</div><h2>A complete AI workspace,<br />built to keep you in flow.</h2><p className="section-intro">Every tool belongs in one focused environment—not scattered across tabs, subscriptions, and half-finished workflows.</p><div className="feature-grid">{features.map(({ icon: Icon, title, text }) => <article className="feature-card" key={title}><div className="feature-icon"><Icon size={21} /></div><h3>{title}</h3><p>{text}</p><span>Explore <ArrowRight size={14} /></span></article>)}</div></section>

    <section id="tools" className="landing-section connection-section"><div><div className="section-kicker">ONE WORKSPACE</div><h2>Your work, connected<br />from first thought to finish.</h2><p>Start a conversation, turn it into an organized project, reference your library, refine the output in code, and use the right tool without leaving NEXUS.</p><button className="outline-button" onClick={() => go('/signup')}>Start your workspace <ArrowRight size={16} /></button></div><div className="flow-visual" aria-label="Chat connects to Projects, Library, Code and Tools"><div className="flow-line" /><div className="flow-node primary"><Bot size={22} /><b>Chat</b><small>Start anywhere</small></div><div className="flow-node project"><FolderKanban size={20} /><b>Projects</b><small>Organize work</small></div><div className="flow-node library"><BookOpen size={20} /><b>Library</b><small>Bring context</small></div><div className="flow-node code"><Braces size={20} /><b>Code</b><small>Build faster</small></div><div className="flow-node tools"><Sparkles size={20} /><b>Tools</b><small>Do more</small></div></div></section>

    <section id="security" className="landing-section security-section"><div className="security-icon"><ShieldCheck size={28} /></div><div><div className="section-kicker">SECURITY AND CONTROL</div><h2>Built around your workspace—not someone else’s feed.</h2><p>NEXUS uses secure authentication and keeps private workspace content behind your sign-in. Workspace roles, private library access, memory controls, HTTPS, security headers, and least-privilege browser permissions help keep the experience intentional.</p><div className="security-points">{['Secure authentication','Workspace roles','Private library','Memory controls','HTTPS and security headers','Least-privilege permissions'].map(item => <span key={item}><LockKeyhole size={15} /> {item}</span>)}</div></div></section>

    <section className="landing-section profiles-section"><div className="profile-copy"><div className="section-kicker">AI PROFILES</div><h2>Make NEXUS respond like your best collaborator.</h2><p>Create reusable AI personalities and instructions for the way you work—whether you need a concise research partner, a thoughtful editor, or a rigorous coding assistant.</p><a href="#faq">Learn about profiles <ArrowRight size={16} /></a></div><div className="profile-card"><div className="profile-orb">✦</div><div><span>ACTIVE PROFILE</span><h3>Product Strategist</h3><p>Clear, evidence-led thinking with practical next steps.</p></div><div className="profile-tags"><b>Structured</b><b>Concise</b><b>Curious</b></div></div></section>

    <section className="landing-section developer-section"><div className="code-window"><div className="code-tabs"><span /><span /><span /><b>launch-plan.ts</b></div><pre><code><i>01</i> <em>const</em> nextMove = <b>await</b> nexus.plan({'\n'}<i>02</i>   objective: <u>'Ship with confidence'</u>,{'\n'}<i>03</i>   context: project.library,{'\n'}<i>04</i>   output: <u>'implementation roadmap'</u>{'\n'}<i>05</i> ){';'}{'\n'}<i>06</i>{'\n'}<i>07</i> <b>export default</b> nextMove{';'}</code></pre><div className="code-status"><span>● Connected</span><span>NEXUS Code Workspace</span></div></div><div><div className="section-kicker">FOR DEVELOPERS</div><h2>From idea to implementation, with context intact.</h2><p>Use Code Workspace to explain unfamiliar code, track down issues, improve a draft, or generate a clean starting point—alongside the conversations and files that informed it.</p><button className="outline-button" onClick={() => go('/signup')}>Open Code Workspace <ArrowRight size={16} /></button></div></section>

    <section className="landing-section mobile-section"><div><div className="section-kicker">MOBILE, TOO</div><h2>Take your workspace wherever the work goes.</h2><p>NEXUS adapts across desktop, tablet, and mobile so your conversations, projects, and context stay within reach.</p></div><div className="phone-preview"><div className="phone-notch" /><div className="phone-head">✦ NEXUS <span>•••</span></div><div className="phone-question">Summarize today’s research.</div><div className="phone-answer">Here are the key findings and the most actionable next steps.</div><div className="phone-input">Ask NEXUS <b>↑</b></div></div></section>

    <section className="landing-cta"><div className="section-kicker">YOUR NEXT WORKSPACE</div><h2>Build more. Search smarter.<br />Create faster.</h2><button className="hero-primary" onClick={() => go('/signup')}>Launch NEXUS AI <ArrowRight size={18} /></button></section>

    <section id="faq" className="landing-section faq-section"><div><div className="section-kicker">FAQ</div><h2>Questions, answered.</h2><p>Everything you need to know before you launch your NEXUS workspace.</p></div><div className="faq-list">{faqs.map(([question, answer], index) => <article key={question}><button onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}>{question}<ChevronDown size={18} /></button>{openFaq === index && <p>{answer}</p>}</article>)}</div></section>

    <footer className="landing-footer"><a className="landing-logo" href="/"><img src={NEXUS_LOGO} alt="NEXUS AI" /><span>NEXUS <em>AI</em><small>by Aayushmaan</small></span></a><div><a href="#features">Features</a><a href="#security">Security</a><a href="#faq">FAQ</a><button onClick={() => go('/login')}>Login</button><button onClick={() => go('/app')}>Launch NEXUS</button></div><p>© 2026 NEXUS AI</p></footer>
    {installEvent && !installed && <button className="install-nexus" onClick={() => void install()} disabled={installing} aria-label="Install NEXUS AI"><ArrowDownToLine size={17} />{installing ? 'Opening install…' : 'Install NEXUS'}</button>}
    {installError && <p className="install-error" role="alert">{installError}</p>}
  </main>
}
