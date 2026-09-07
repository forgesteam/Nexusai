import type {
  Attachment,
  BackgroundId,
  ChatMessage,
  Memory,
  NexusConversation,
  NexusFolder,
  NexusProject,
  NexusPrompt,
  NexusSettings,
  Personality,
  Plugin,
  SearchSource,
  User,
} from "../types";

export const backgroundOptions: Array<{ id: BackgroundId; number: string; name: string; description: string }> = [
  ["neon-nexus", "01", "Neon Nexus", "Luminous intelligence core"],
  ["aurora-intelligence", "02", "Aurora Intelligence", "Polar light field"],
  ["cyber-pulse", "03", "Cyber Pulse", "Kinetic signal waves"],
  ["deep-space-ai", "04", "Deep Space AI", "Celestial inference"],
  ["quantum-flow", "05", "Quantum Flow", "Fluid quantum paths"],
  ["neural-network", "06", "Neural Network", "Connected thought mesh"],
  ["digital-galaxy", "07", "Digital Galaxy", "Data-star expanse"],
  ["electric-horizon", "08", "Electric Horizon", "Charged distant skyline"],
  ["violet-core", "09", "Violet Core", "Focused violet energy"],
  ["cyan-matrix", "10", "Cyan Matrix", "Structured signal grid"],
  ["cosmic-intelligence", "11", "Cosmic Intelligence", "Orbital cognition"],
  ["holographic-grid", "12", "Holographic Grid", "Projected dimensions"],
  ["synthetic-aurora", "13", "Synthetic Aurora", "Algorithmic northern lights"],
  ["dark-energy", "14", "Dark Energy", "Subtle gravitational glow"],
  ["ai-singularity", "15", "AI Singularity", "Convergent light field"],
  ["quantum-grid", "16", "Quantum Grid", "Luminous coordinate plane"],
  ["digital-ocean", "17", "Digital Ocean", "Deep flowing information"],
  ["neon-storm", "18", "Neon Storm", "Charged atmospheric bloom"],
  ["cyber-aurora", "19", "Cyber Aurora", "Circuit-lit aurora"],
  ["infinite-circuit", "20", "Infinite Circuit", "Endless precision paths"],
  ["plasma-core", "21", "Plasma Core", "Radiant plasma nucleus"],
  ["future-city", "22", "Future City", "Abstract metropolitan light"],
  ["data-dimension", "23", "Data Dimension", "Layered information space"],
  ["neural-cosmos", "24", "Neural Cosmos", "Synaptic constellation"],
  ["nexus-eclipse", "25", "NEXUS Eclipse", "Eclipsed neon halo"],
].map(([id, number, name, description]) => ({ id: id as BackgroundId, number, name, description }));
export const defaultSettings: NexusSettings = {
  theme: "dark",
  language: "en",
  model: "Nexus Text",
  voiceLanguage: "en-US",
  autoPlay: false,
  webSearch: false,
  memoryEnabled: false,
  backgroundId: "neon-nexus",
  lastNexusBackgroundId: "neon-nexus",
  backgroundAnimation: "medium",
  backgroundParticles: true,
  ambientGlow: true,
  backgroundMotion: true,
  reducedMotion: false,
};
export const availableModels = [
  {
    id: "Nexus Text",
    name: "Nexus Text",
    category: "Balanced",
    speed: "Fast",
    capabilities: "Chat · Documents · Web grounding",
    context: "Provider-managed",
  },
];
export const builtInPlugins: Plugin[] = [
  ["web-grounding", "Web Search", "Ground answers in live web results and show source cards.", "⌕"],
  ["vision", "Image Vision", "Analyze uploaded PNG, JPG, WEBP, or supported HEIC images.", "◈"],
  ["documents", "Document Q&A", "Upload and index supported documents for contextual questions.", "▤"],
  ["translator", "Translation", "Translate an AI response into Hindi.", "文"],
  ["code", "Code Workspace", "Explain, debug, improve, and generate code safely.", "</>"],
  ["secure-library", "Secure Library", "Store and review files in your private workspace library.", "▣"],
  ["conversation-search", "Conversation Search", "Find a prior conversation from the workspace sidebar.", "⌕"],
  ["conversation-export", "Response Export", "Copy or download any AI response as Markdown.", "↓"],
  ["response-regenerate", "Response Regeneration", "Request a fresh answer to the latest question.", "↻"],
  ["response-actions", "Response Actions", "Shorten, expand, simplify, or continue a response.", "✧"],
  ["voice-read", "Read Aloud", "Use your browser’s speech engine to read an answer aloud.", "◌"],
  ["voice-input", "Voice Input", "Realtime voice requires a configured Voice Agent.", "◉", "configuration-required"],
  ["profiles", "AI Profiles", "Create reusable personalities with custom instructions.", "☻"],
  ["memory", "Memory Controls", "Opt in to user-approved memories for chat context.", "◎"],
  ["projects", "Projects", "Organize workspace efforts with a NEX project ID.", "◫"],
  ["prompt-library", "Prompt Library", "Save and reuse high-quality prompts.", "✎"],
  ["file-attachments", "File Attachments", "Attach images and supported documents to a message.", "⌁"],
  ["image-uploads", "Image Uploads", "Add visual context directly from your device.", "▧"],
  ["web-sources", "Cited Sources", "Review source cards attached to web-grounded answers.", "↗"],
  ["language-settings", "Language Settings", "Choose an interface language preference.", "◐"],
  ["theme-settings", "Theme Settings", "Switch between dark, light, and system themes.", "◑"],
  ["account-profile", "Profile Picture", "Upload a personal avatar from Profile settings.", "●"],
  ["secure-auth", "Secure Authentication", "Use password, magic link, or Google sign-in.", "◇"],
  ["access-roles", "Workspace Roles", "Role-gated workspace and file access.", "♜"],
  ["workspace-usage", "Workspace Usage", "Review conversation, message, and upload counts.", "▥"],
].map(([id, name, description, icon, status = "ready"]) => ({
  id,
  name,
  description,
  icon,
  version: "1.0.0",
  permissions: [],
  enabled: true,
  execution: status === "ready" ? "built-in" : "unavailable",
  status: status as Plugin["status"],
}));
export const toolCount = builtInPlugins.length;

declare global {
  interface Window {
    GENMB_APP_ID?: string;
    genmb: {
      kv: {
        get: (key: string) => Promise<unknown | null>;
        set: (key: string, value: unknown) => Promise<void>;
        delete: (key: string) => Promise<{ deleted: boolean }>;
        list: (prefix: string) => Promise<{ data: Array<{ key: string; value: unknown }>; total: number }>;
      };
      auth: {
        ready: () => Promise<void>;
        getUser: () => User | null;
        isAuthenticated: () => boolean;
        onAuthStateChange: (cb: (u: User | null) => void) => () => void;
        signIn: () => Promise<User | null>;
        sendMagicLink: (email: string) => Promise<unknown>;
        signUp: (email: string, password: string, name?: string) => Promise<unknown>;
        verifySignUp: (email: string, code: string) => Promise<User | null>;
        signInWithPassword: (email: string, password: string) => Promise<User | null>;
        requestPasswordReset: (email: string) => Promise<void>;
        confirmPasswordReset: (email: string, code: string, password: string) => Promise<unknown>;
        signOut: () => Promise<void>;
      };
      storage: {
        validate: (file: File, options: { accept: string; maxSize: number }) => { ok: boolean; message: string };
        upload: (
          file: File,
          options: { folder: string; onProgress: (value: number) => void; signal?: AbortSignal },
        ) => Promise<{ filename: string; url: string; size: number; contentType: string }>;
        list: (options: {
          folder: string;
        }) => Promise<{
          files: Array<{ filename: string; url: string; size: number; contentType: string; uploadedAt: string }>;
          usage?: { totalSize: number; fileCount: number };
        }>;
        delete: (filename: string) => Promise<{ success: boolean }>;
      };
      fn: { invoke: (name: string, payload: unknown) => Promise<unknown> };
      rbac: {
        setRoleLoader: (loader: (user: User) => Promise<{ role: string; permissions: string[] } | null>) => void;
        ready: () => Promise<unknown>;
        clearRole: () => void;
        getRole: () => string | null;
        hasPermission: (permission: string) => boolean;
        onRoleChange: (callback: (role: string | null, permissions: string[]) => void) => () => void;
      };
      search: {
        web: (
          query: string,
          opts?: { numResults?: number },
        ) => Promise<Array<{ title: string; url: string; snippet: string; source: string; image?: string }>>;
      };
      translate: { text: (input: string, target: string, source?: string) => Promise<{ translated: string }> };
      vectordb: {
        ingestFile: (file: File, meta?: object) => Promise<{ documentId: string; chunks: number }>;
        search: (
          q: string,
          opts?: { limit?: number; filter?: object },
        ) => Promise<{ results: Array<{ content: string; score: number; metadata: object; documentId: string }> }>;
        delete: (id: string) => Promise<{ success: boolean }>;
      };
    };
  }
}
const key = (userId: string, part: string) => `nexus:${userId}:${part}`;
const listValues = async <T>(userId: string, prefix: string) =>
  (await window.genmb.kv.list(key(userId, prefix))).data.map((item) => item.value as T);
export const loadSettings = async (userId: string) => ({
  ...defaultSettings,
  ...(((await window.genmb.kv.get(key(userId, "settings"))) as Partial<NexusSettings>) || {}),
});
export const saveSettings = (userId: string, value: NexusSettings) =>
  window.genmb.kv.set(key(userId, "settings"), value);
export async function listConversations(userId: string) {
  return (await listValues<NexusConversation>(userId, "conversation:")).sort((a, b) => b.updatedAt - a.updatedAt);
}
export const saveConversation = (userId: string, value: NexusConversation) =>
  window.genmb.kv.set(key(userId, `conversation:${value.id}`), value);
export const removeConversation = (userId: string, id: string) =>
  window.genmb.kv.delete(key(userId, `conversation:${id}`));
export async function listProjects(userId: string) {
  return (await listValues<NexusProject>(userId, "project:")).sort((a, b) => b.updatedAt - a.updatedAt);
}
export const saveProject = (userId: string, value: NexusProject) =>
  window.genmb.kv.set(key(userId, `project:${value.id}`), value);
export const removeProject = (userId: string, id: string) => window.genmb.kv.delete(key(userId, `project:${id}`));
export const listFolders = (userId: string) => listValues<NexusFolder>(userId, "folder:");
export const saveFolder = (userId: string, x: NexusFolder) => window.genmb.kv.set(key(userId, `folder:${x.id}`), x);
export const removeFolder = (userId: string, id: string) => window.genmb.kv.delete(key(userId, `folder:${id}`));
export const listPrompts = (userId: string) => listValues<NexusPrompt>(userId, "prompt:");
export const savePrompt = (userId: string, x: NexusPrompt) => window.genmb.kv.set(key(userId, `prompt:${x.id}`), x);
export const removePrompt = (userId: string, id: string) => window.genmb.kv.delete(key(userId, `prompt:${id}`));
export const listPersonalities = (userId: string) => listValues<Personality>(userId, "personality:");
export const savePersonality = (userId: string, x: Personality) =>
  window.genmb.kv.set(key(userId, `personality:${x.id}`), x);
export const removePersonality = (userId: string, id: string) =>
  window.genmb.kv.delete(key(userId, `personality:${id}`));
export const listMemories = (userId: string) => listValues<Memory>(userId, "memory:");
export const saveMemory = (userId: string, x: Memory) => window.genmb.kv.set(key(userId, `memory:${x.id}`), x);
export const removeMemory = (userId: string, id: string) => window.genmb.kv.delete(key(userId, `memory:${id}`));
export async function clearMemories(userId: string) {
  const items = await window.genmb.kv.list(key(userId, "memory:"));
  await Promise.all(items.data.map((x) => window.genmb.kv.delete(x.key)));
}
export async function loadPlugins(userId: string) {
  const stored = await window.genmb.kv.get(key(userId, "plugins"));
  const overrides = (stored as Record<string, boolean> | null) || {};
  return builtInPlugins.map((p) => ({ ...p, enabled: overrides[p.id] ?? p.enabled }));
}
export const savePlugins = (userId: string, list: Plugin[]) =>
  window.genmb.kv.set(key(userId, "plugins"), Object.fromEntries(list.map((p) => [p.id, p.enabled])));
export const makeProjectId = () =>
  `NEX-${crypto.getRandomValues(new Uint32Array(2)).join("").toString(36).toUpperCase().slice(0, 8).padEnd(8, "X")}`;
export function download(name: string, text: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
export const conversationPrompt = (
  messages: ChatMessage[],
  prompt: string,
  personality?: Personality,
  memories: Memory[] = [],
  retrievedContext = "",
) => `You are NEXUS AI, a careful, capable workspace assistant. First understand the request and relevant conversation context. Then reason privately, verify the result, and format the answer for the user. Prefer correctness over guessing: never invent facts, sources, file contents, tool output, unreadable text, or certainty. When confidence is limited, state exactly what is uncertain or missing and ask one focused clarification only when necessary. If asked who created, made, or is the creator of NEXUS, answer naturally: "Aayushmaan Shah created me." Do not attribute NEXUS to another company or an AI website builder. Never reveal or infer the creator's private personal information, including a home address. If asked for a location, share only an app-configured broad public location; if none is configured, say that you cannot provide one.

For maths, logic, science, and code: extract values and constraints, choose an appropriate method, check calculations, units, edge cases, and whether the final answer addresses the question. For schoolwork, use a compact structure: Given, Required, Method, Steps, Final answer. For code debugging: identify the error, explain its cause, provide a minimal corrected solution, and note related risks. For creative work, adapt voice and structure to the task rather than using a generic template. Resolve references such as “it”, “that”, “step 3”, and “the previous one” from recent conversation whenever clear. Give the direct answer first and use concise Markdown only when it improves clarity. ${personality ? `Adopt this profile: ${personality.name}. ${personality.instructions}. Style: ${personality.style}.` : ""} ${memories.length ? `User-approved memory: ${memories.map((m) => m.text).join(" | ")}.` : ""} ${retrievedContext ? `Relevant material from the user's uploaded documents (treat it as the source of truth for document questions):\n${retrievedContext}` : ""}\nRecent conversation:\n${messages
  .slice(-8)
  .map((m) => `${m.role.toUpperCase()}: ${m.text.slice(0, 1600)}`)
  .join("\n")
  .slice(-8000)}\nUSER: ${prompt}`;
export class AIRequestError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "network"
      | "auth"
      | "rate-limit"
      | "server"
      | "invalid-request"
      | "response"
      | "initializing",
    public readonly retryAfter?: number,
  ) {
    super(message);
    this.name = "AIRequestError";
  }
}
const deployedAppId = "OBqiMNglO98o";
async function appId(_signal?: AbortSignal) {
  return window.GENMB_APP_ID || deployedAppId;
}
const retryAfterSeconds = (value: string | null) => {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
};
async function readAIResponse(res: Response) {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    if (res.ok)
      throw new AIRequestError("The AI service returned an unreadable response. Please try again.", "response");
  }
  if (!res.ok) {
    const detail =
      typeof body === "object" && body && "error" in body && typeof (body as { error?: unknown }).error === "string"
        ? (body as { error: string }).error
        : "";
    const retryAfter = retryAfterSeconds(res.headers.get("retry-after"));
    if (res.status === 401 || res.status === 403)
      throw new AIRequestError(
        "NEXUS could not authorize this AI request. Please sign out, sign in again, and retry.",
        "auth",
      );
    if (res.status === 429)
      throw new AIRequestError(
        retryAfter
          ? `AI capacity is temporarily limited. Try again in about ${retryAfter} seconds.`
          : "AI capacity is temporarily limited. Please try again shortly.",
        "rate-limit",
        retryAfter,
      );
    if (res.status >= 500)
      throw new AIRequestError(
        "The AI service is temporarily unavailable. Your message was kept; please retry.",
        "server",
      );
    throw new AIRequestError(detail || "The AI service rejected this request. Please try again.", "invalid-request");
  }
  const text =
    typeof body === "object" &&
    body &&
    "data" in body &&
    typeof (body as { data?: { text?: unknown } }).data?.text === "string"
      ? (body as { data: { text: string } }).data.text.trim()
      : "";
  if (!text)
    throw new AIRequestError("The AI service completed the request but returned no text. Please retry.", "response");
  return text;
}
export async function complete(prompt: string, search: boolean, signal?: AbortSignal) {
  const payload = { prompt, appId: await appId(signal), maxTokens: 700, enableSearch: search };
  try {
    const res = await fetch("/api/ai/completion", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      signal,
      body: JSON.stringify(payload),
    });
    return await readAIResponse(res);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    if (error instanceof AIRequestError) throw error;
    if (error instanceof TypeError)
      throw new AIRequestError(
        "NEXUS could not reach the AI service. Check your connection and retry; your message is still in this chat.",
        "network",
      );
    throw error;
  }
}
export async function searchWeb(query: string): Promise<SearchSource[]> {
  const results = await window.genmb.search.web(query, { numResults: 5 });
  return results.map((r) => ({ title: r.title, url: r.url, snippet: r.snippet, source: r.source, image: r.image }));
}
const visionImageTypes = ["image/png", "image/jpeg", "image/webp"] as const;
export const supportedImage = (f: File) => visionImageTypes.includes(f.type as (typeof visionImageTypes)[number]);
export async function analyzeImage(file: File, prompt: string, signal?: AbortSignal) {
  if (!supportedImage(file))
    throw new AIRequestError("Unsupported image type. Vision accepts PNG, JPG, and WEBP images.", "invalid-request");
  if (file.size > 10 * 1024 * 1024)
    throw new AIRequestError("Image too large. Vision analysis supports images up to 10MB.", "invalid-request");
  const form = new FormData();
  form.append("image", file, file.name);
  form.append(
    "prompt",
    `You are NEXUS Vision. Inspect this image spatially, not as plain OCR. First assess legibility, crop, rotation, lighting, blur, and whether all relevant regions are visible. Preserve equations, fractions, powers, roots, subscripts, signs, tables, diagrams, graphs, and answer choices. If a symbol or value is unclear, state exactly what cannot be read and request a clearer image; never guess. Then answer the user’s request with a concise, verified explanation. Preserve mathematical structure precisely, including powers, subscripts, fractions, roots, inequalities, Greek letters, scientific notation, and units. Use readable Unicode notation or standard LaTeX delimiters for mathematics so the NEXUS chat renderer can format it. For academic problems, include Given, Required, Method, Steps, and Final answer where helpful. User request: ${prompt}`,
  );
  form.append("appId", await appId(signal));
  try {
    const res = await fetch("/api/ai/completion/image", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: form,
      signal,
    });
    return await readAIResponse(res);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    if (error instanceof AIRequestError) throw error;
    if (error instanceof TypeError)
      throw new AIRequestError(
        "NEXUS could not reach the vision service. Check your connection and retry; the image remains attached.",
        "network",
      );
    throw error;
  }
}
export async function imageQualityWarning(file: File) {
  if (!supportedImage(file)) return "";
  try {
    const url = URL.createObjectURL(file);
    const image = new Image();
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error("The image could not be decoded in this browser."));
      image.src = url;
    });
    URL.revokeObjectURL(url);
    if (Math.min(dimensions.width, dimensions.height) < 700)
      return `This image is ${dimensions.width}×${dimensions.height}, which may be too low-resolution for small text or equations. Upload a sharper, closer photo if any result looks uncertain.`;
    return "";
  } catch {
    return "NEXUS could not inspect image dimensions before analysis. If the photo is blurry, dark, cropped, or rotated, upload a clearer full-page image.";
  }
}
export const attachmentFrom = (f: {
  filename: string;
  url: string;
  size: number;
  contentType: string;
}): Attachment => ({ ...f, kind: f.contentType.startsWith("image/") ? "image" : "file" });
