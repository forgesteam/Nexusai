import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import type {
  Memory,
  NexusConversation,
  NexusFolder,
  NexusProject,
  NexusSettings,
  NexusPrompt,
  Personality,
  Plugin,
  User,
  WorkspaceRole,
} from "./types";
import {
  Archive,
  Command,
  FolderKanban,
  Image as ImageIcon,
  Library,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Settings as SettingsIcon,
  Wrench,
  X,
} from "lucide-react";
import ToastProvider, { useToast } from "./components/ToastProvider";
import AuthScreen from "./components/AuthScreen";
import LandingPage from "./components/LandingPage";
import ChatWorkspace from "./components/ChatWorkspace";
import Button from "./components/ui/Button";
import {
  clearMemories,
  listConversations,
  listFolders,
  listMemories,
  listPersonalities,
  listProjects,
  listPrompts,
  loadPlugins,
  loadSettings,
  makeProjectId,
  removeConversation,
  removeProject,
  saveConversation,
  savePlugins,
  saveProject,
  saveSettings,
} from "./lib/nexus";
import NEXUS_LOGO from "./assets/nexus-symbol.svg";
const WorkspacePages = lazy(() => import("./components/WorkspacePages"));
type View = "chat" | "projects" | "library" | "plugins" | "settings" | "code" | "prompts" | "tools" | "usage";
const DEVELOPER_EMAIL = "aayushmaanshah701@gmail.com";
function AppInner() {
  const { pushToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<WorkspaceRole | null>(null);
  const [view, setView] = useState<View>("chat");
  const [sidebar, setSidebar] = useState(false);
  const [conversations, setConversations] = useState<NexusConversation[]>([]);
  const [folders, setFolders] = useState<NexusFolder[]>([]);
  const [projects, setProjects] = useState<NexusProject[]>([]);
  const [prompts, setPrompts] = useState<NexusPrompt[]>([]);
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [settings, setSettings] = useState<NexusSettings | null>(null);
  const [activeId, setActiveId] = useState("");
  const [search, setSearch] = useState("");
  const [command, setCommand] = useState(false);
  useEffect(() => {
    let live = true;
    window.genmb.rbac.setRoleLoader(async (member) =>
      member.email.toLowerCase() === DEVELOPER_EMAIL
        ? { role: "developer", permissions: ["*"] }
        : { role: "editor", permissions: ["chat:write", "files:upload", "workspace:read"] },
    );
    void (async () => {
      try {
        await window.genmb.auth.ready();
        await window.genmb.rbac.ready();
        if (live) {
          setUser(window.genmb.auth.getUser());
          setRole(window.genmb.rbac.getRole() as WorkspaceRole | null);
        }
      } catch (e) {
        pushToast({
          variant: "error",
          title: "Authentication could not initialize",
          description: e instanceof Error ? e.message : String(e),
        });
      } finally {
        if (live) setLoading(false);
      }
    })();
    const unAuth = window.genmb.auth.onAuthStateChange((u) => {
      if (live) setUser(u);
    });
    const unRole = window.genmb.rbac.onRoleChange((r) => {
      if (live) setRole(r as WorkspaceRole | null);
    });
    return () => {
      live = false;
      unAuth();
      unRole();
    };
  }, [pushToast]);
  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        const [c, f, p, pr, pe, m, pl, s] = await Promise.all([
          listConversations(user.id),
          listFolders(user.id),
          listProjects(user.id),
          listPrompts(user.id),
          listPersonalities(user.id),
          listMemories(user.id),
          loadPlugins(user.id),
          loadSettings(user.id),
        ]);
        setConversations(c);
        setFolders(f);
        setProjects(p);
        setPrompts(pr);
        setPersonalities(pe);
        setMemories(m);
        setPlugins(pl);
        setSettings(s);
        document.documentElement.dataset.theme = s.theme;
      } catch (e) {
        pushToast({
          variant: "error",
          title: "Workspace data could not load",
          description: e instanceof Error ? e.message : String(e),
        });
      }
    })();
  }, [user, pushToast]);
  useEffect(() => {
    if (!settings || !user) return;
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.dataset.background = settings.backgroundId;
    root.dataset.animation = settings.backgroundAnimation;
    root.dataset.particles = String(settings.backgroundParticles);
    root.dataset.ambientGlow = String(settings.ambientGlow);
    root.dataset.backgroundMotion = String(settings.backgroundMotion);
    root.dataset.reducedMotion = String(settings.reducedMotion);
    root.style.setProperty(
      "--custom-background",
      settings.customBackgroundUrl ? `url("${settings.customBackgroundUrl}")` : "none",
    );
    if (!settings.customBackgroundUrl) return;
    const image = new Image();
    image.onload = () => undefined;
    image.onerror = () => {
      const fallback = {
        ...settings,
        customBackgroundUrl: undefined,
        customBackgroundFilename: undefined,
        backgroundId: settings.lastNexusBackgroundId,
      };
      setSettings(fallback);
      void saveSettings(user.id, fallback);
      pushToast({
        variant: "info",
        title: "Custom background unavailable",
        description: "Your last selected NEXUS background has been restored.",
      });
    };
    image.src = settings.customBackgroundUrl;
  }, [settings, user, pushToast]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          setCommand(true);
        }
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "o") {
          e.preventDefault();
          newChat();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "/") {
          e.preventDefault();
          window.dispatchEvent(new Event("nexus:focus-composer"));
        }
        if (e.key === "Escape") {
          setCommand(false);
          setSidebar(false);
        }
      };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });
  const active = conversations.find((c) => c.id === activeId);
  const filtered = useMemo(
    () =>
      conversations
        .filter((c) => !c.archived && c.title.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.updatedAt - a.updatedAt),
    [conversations, search],
  );
  const savePrefs = async (s: NexusSettings) => {
    if (!user) return;
    setSettings(s);
    try {
      await saveSettings(user.id, s);
      pushToast({ variant: "success", title: "Settings saved" });
    } catch (e) {
      pushToast({
        variant: "error",
        title: "Could not save settings",
        description: e instanceof Error ? e.message : String(e),
      });
    }
  };
  const saveChat = async (c: NexusConversation) => {
    if (!user) throw new Error("You must be signed in to save a conversation.");
    try {
      await saveConversation(user.id, c);
      setConversations((x) => [c, ...x.filter((i) => i.id !== c.id)]);
      setActiveId(c.id);
    } catch (e) {
      pushToast({
        variant: "error",
        title: "Could not save conversation",
        description: e instanceof Error ? e.message : String(e),
      });
      throw e;
    }
  };
  const newChat = () => {
    const c: NexusConversation = {
      id: crypto.randomUUID(),
      title: "New conversation",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations((x) => [c, ...x]);
    setActiveId(c.id);
    setView("chat");
    setSidebar(false);
  };
  const deleteChat = async (c: NexusConversation) => {
    if (!user || !confirm(`Delete “${c.title}”?`)) return;
    try {
      await removeConversation(user.id, c.id);
      setConversations((x) => x.filter((i) => i.id !== c.id));
      if (activeId === c.id) setActiveId("");
      pushToast({ variant: "success", title: "Conversation deleted" });
    } catch (e) {
      pushToast({
        variant: "error",
        title: "Could not delete conversation",
        description: e instanceof Error ? e.message : String(e),
      });
    }
  };
  const select = (v: View) => {
    setView(v);
    setSidebar(false);
  };
  const createProject = async () => {
    if (!user) return;
    const name = prompt("Project name");
    if (!name?.trim()) return;
    const x: NexusProject = {
      id: makeProjectId(),
      name: name.trim(),
      description: "",
      ownerId: user.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    try {
      await saveProject(user.id, x);
      setProjects((v) => [x, ...v]);
      pushToast({ variant: "success", title: "Project created", description: x.id });
    } catch (e) {
      pushToast({
        variant: "error",
        title: "Could not create project",
        description: e instanceof Error ? e.message : String(e),
      });
    }
  };
  const useTool = async (tool: Plugin) => {
    if (tool.status !== "ready") throw new Error("Voice Agent configuration is required before this tool can be used.");
    if (tool.id === "web-grounding" && !settings.webSearch) await savePrefs({ ...settings, webSearch: true });
    const destinations: Record<string, View> = {
      code: "code",
      "secure-library": "library",
      projects: "projects",
      "prompt-library": "prompts",
      "workspace-usage": "usage",
      profiles: "settings",
      memory: "settings",
      "language-settings": "settings",
      "theme-settings": "settings",
      "account-profile": "settings",
      "secure-auth": "settings",
      "access-roles": "settings",
    };
    select(destinations[tool.id] || "chat");
  };
  if (loading) return <div className="boot">Loading your NEXUS workspace…</div>;
  if (!user) return <AuthScreen />;
  if (!settings) return <div className="boot">Preparing your workspace…</div>;
  const current = active || {
    id: crypto.randomUUID(),
    title: "New conversation",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };
  return (
    <div className="app-shell">
      <div className="workspace-canvas">
        <aside id="nexus-navigation" className={`sidebar ${sidebar ? "open" : ""}`} aria-hidden={!sidebar}>
        <div className="sidebar-top">
          <button className="logo" onClick={newChat} aria-label="Start a new NEXUS chat">
            <img className="logo-image" src={NEXUS_LOGO} alt="" />
            <b>
              NEXUS <em>AI</em>
            </b>
          </button>
          <button className="icon sidebar-close" onClick={() => setSidebar(false)} aria-label="Close navigation">
            <X size={19} />
          </button>
        </div>
        <Button className="new-chat" onClick={newChat}>
          <Plus size={17} />
          New chat
        </Button>
        <label className="search">
          <Search size={15} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chats" />
        </label>
        <nav>
          {[
            ["chat", MessageSquare, "Chats"],
            ["projects", FolderKanban, "Projects"],
            ["library", Library, "Library"],
            ["prompts", Archive, "Prompt Library"],
            ["code", Command, "Code Workspace"],
            ["tools", Wrench, "Tools"],
            ["usage", ImageIcon, "Usage"],
          ].map(([id, Icon, label]) => (
            <button key={id as string} className={view === id ? "active" : ""} onClick={() => select(id as View)}>
              <Icon size={17} />
              {label as string}
            </button>
          ))}
        </nav>
        <div className="folders">
          <p>FOLDERS</p>
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setSearch("");
                select("chat");
              }}
            >
              <FolderKanban size={14} />
              {f.name}
            </button>
          ))}
          <span>Drag chats onto folders in Chats.</span>
        </div>
        <div className="recent">
          <p>RECENT</p>
          {filtered.slice(0, 8).map((c) => (
            <div
              draggable
              onDragStart={(e) => e.dataTransfer.setData("conversation", c.id)}
              className={`recent-item ${activeId === c.id ? "selected" : ""}`}
              key={c.id}
            >
              <button
                onClick={() => {
                  setActiveId(c.id);
                  select("chat");
                }}
              >
                {c.pinned ? "📌 " : ""}
                {c.title}
              </button>
              <button onClick={() => void deleteChat(c)}>
                <X size={13} />
              </button>
            </div>
          ))}
          {!filtered.length && <span className="empty-mini">Start your first conversation.</span>}
        </div>
        <div className="sidebar-bottom">
          <button onClick={() => select("settings")}>
            <SettingsIcon size={17} />
            Settings
          </button>
          <div className="profile">
            <span>
              {settings.avatarUrl || user.picture ? (
                <img src={settings.avatarUrl || user.picture} alt="" />
              ) : (
                user.name?.[0] || user.email[0]
              )}
            </span>
            <div>
              <b>{settings.displayName || user.name || "NEXUS user"}</b>
              <small>{user.email}</small>
            </div>
            <button onClick={() => void window.genmb.auth.signOut().then(() => window.genmb.rbac.clearRole())}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
        </aside>
        <div className="sidebar-overlay" onClick={() => setSidebar(false)} aria-hidden="true" />
        {view === "chat" ? (
        <ChatWorkspace
          user={user}
          conversation={current}
          settings={settings}
          personalities={personalities}
          memories={memories}
          onSave={saveChat}
          onUpdateSettings={savePrefs}
          onOpenLibrary={() => select("library")}
        />
        ) : (
          <Suspense fallback={<div className="boot">Loading workspace area…</div>}>
            <WorkspacePages
            view={view}
            user={user}
            settings={settings}
            conversations={conversations}
            folders={folders}
            projects={projects}
            prompts={prompts}
            personalities={personalities}
            memories={memories}
            plugins={plugins}
            onOpenMenu={() => setSidebar(true)}
            onCreateProject={createProject}
            onSaveSettings={savePrefs}
            onSetConversations={setConversations}
            onSetFolders={setFolders}
            onSetPrompts={setPrompts}
            onSetPersonalities={setPersonalities}
            onSetMemories={setMemories}
            onSetPlugins={async (p) => {
              setPlugins(p);
              await savePlugins(user.id, p);
            }}
            onDeleteConversation={deleteChat}
            onClearMemories={async () => {
              await clearMemories(user.id);
              setMemories([]);
            }}
            onOpenChat={(id) => {
              setActiveId(id);
              select("chat");
            }}
              onUseTool={useTool}
            />
          </Suspense>
        )}
      </div>
      <button
        className="mobile-menu"
        onClick={() => setSidebar(true)}
        aria-label="Open navigation"
        aria-expanded={sidebar}
        aria-controls="nexus-navigation"
      >
        <Menu size={17} strokeWidth={2.25} />
        <span className="sr-only">Open navigation</span>
      </button>
      {command && (
        <CommandPalette
          onClose={() => setCommand(false)}
          onCommand={(x) => {
            setCommand(false);
            if (x === "New Chat") newChat();
            else if (x === "Focus composer") {
              select("chat");
              setTimeout(() => window.dispatchEvent(new Event("nexus:focus-composer")), 0);
            } else if (x === "Toggle Theme")
              void savePrefs({ ...settings, theme: settings.theme === "dark" ? "light" : "dark" });
            else
              select(
                x === "Open Projects"
                  ? "projects"
                  : x === "Open Library"
                    ? "library"
                    : x === "Open Settings"
                      ? "settings"
                      : x === "Open Tools"
                        ? "tools"
                        : "chat",
              );
          }}
        />
      )}
    </div>
  );
}
function CommandPalette({ onClose, onCommand }: { onClose: () => void; onCommand: (x: string) => void }) {
  const [q, setQ] = useState("");
  const commands = [
    "New Chat",
    "Search Chats",
    "Open Projects",
    "Open Library",
    "Open Settings",
    "Upload File",
    "Start Voice",
    "Open Tools",
    "Toggle Theme",
    "Focus composer",
  ];
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="command-palette">
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search commands…" />
        <div>
          {commands
            .filter((x) => x.toLowerCase().includes(q.toLowerCase()))
            .map((x) => (
              <button key={x} onClick={() => onCommand(x)}>
                {x}
                <kbd>{x === "New Chat" ? "Ctrl Shift O" : x === "Focus composer" ? "Ctrl /" : ""}</kbd>
              </button>
            ))}
        </div>
        <button className="command-close" onClick={onClose}>
          Esc to close
        </button>
      </div>
    </div>
  );
}
function isInstalledApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}
function InstalledEntry() {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
    let live = true;
    void window.genmb.auth
      .ready()
      .then(() => {
        if (live) setAuthenticated(window.genmb.auth.isAuthenticated());
      })
      .finally(() => {
        if (live) setChecking(false);
      });
    return () => {
      live = false;
    };
  }, []);
  if (checking) return <div className="boot">Opening NEXUS AI…</div>;
  return authenticated ? <AppInner /> : <AuthScreen onAuthenticated={() => window.location.assign("/app")} />;
}
function RoutedApp() {
  const path = window.location.pathname;
  const launch = () => window.location.assign("/app");
  if (path === "/" && isInstalledApp()) return <InstalledEntry />;
  if (path === "/") return <LandingPage />;
  if (path === "/login" || path === "/signup")
    return <AuthScreen initialMode={path === "/signup" ? "signup" : "login"} onAuthenticated={launch} />;
  return <AppInner />;
}
export default function App() {
  return (
    <ToastProvider>
      <RoutedApp />
    </ToastProvider>
  );
}
