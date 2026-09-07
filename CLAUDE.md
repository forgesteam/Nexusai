# Nexus.ai

A private, authenticated PWA workspace for personal AI chat, research, document analysis, projects, prompts, and configurable AI behavior.

## Masterplan

- Provide each signed-in user with an isolated, durable AI workspace scoped to their GenMB `user.id`.
- Combine AI chat with file attachments, document indexing, image analysis, web search, voice input, reusable prompts, personalities, memories, projects, and optional plugins.
- Support knowledge-work tasks including writing, coding, translation, research, document Q&A, and image understanding.
- Keep the experience desktop-first while remaining installable and usable on mobile as a PWA.
- Preserve user control over data, AI settings, appearance, saved memories, and workspace organization.

> **Current product boundary:** Nexus.ai is **not** the originally requested customer-support dashboard.  
> `src/components/AppShell.tsx`, `src/components/WidgetChat.tsx`, and everything in `src/pages/` are disconnected legacy ReplyHarbor customer-support UI. They are not imported by `src/main.tsx` or reachable through `src/App.tsx`. Do not extend, reconnect, or delete them unless intentionally reviving ReplyHarbor as a separate product.

## Tech Stack & Architecture

- **React + TypeScript SPA**, mounted from `src/main.tsx`.
- **Vite-style frontend-only application**. This repository has no owned server, database schema, REST API, or route handlers.
- **GenMB SDK**, injected globally by `index.html` and accessed through `window.genmb`.
  - Authentication: Google OAuth, password sign-in/sign-up, verification codes, password reset, magic links, OTP.
  - Persistence: GenMB KV storage, always scoped by authenticated user ID.
  - AI capabilities: completions, web search, image AI, translation, voice, vector database document ingestion, file storage, email, functions, realtime, i18n, and RBAC.
- **Lucide React** for icons.
- **CSS-first active styling** in `src/styles/main.css`. Do not introduce Tailwind for active Nexus workspace features.
- **PWA support**:
  - `src/lib/pwa.ts` registers `public/sw.js`.
  - `public/manifest.webmanifest` defines install metadata.
  - `public/sw.js` caches only the app shell and falls back to `/` for navigations. User data, GenMB services, and AI generation do not work offline.

### Application composition

`src/App.tsx` is the authenticated workspace controller and durable-state boundary:

1. Initializes GenMB auth and RBAC.
2. Selects `LandingPage`, `AuthScreen`, or the authenticated workspace.
3. Loads all persisted user collections after authentication.
4. Owns navigation, command palette visibility, sidebar state, active conversation, filtering, and durable workspace collections.
5. Renders `ChatWorkspace` eagerly; lazy-loads `WorkspacePages` with `React.lazy`.

Active view IDs:

```ts
"chat" | "projects" | "library" | "plugins" | "settings" |
"code" | "prompts" | "tools" | "usage"
```

### State and persistence

Use this ownership chain for every durable workspace feature:

```text
Feature UI → callback in src/App.tsx → src/lib/nexus.ts → window.genmb APIs
```

- `src/lib/nexus.ts` is the only persistence and external-service boundary for active Nexus features.
- Do **not** call GenMB KV persistence directly from components.
- Every persisted read/write must be scoped to the authenticated `user.id`.
- `src/App.tsx` owns persisted collections:
  - conversations and folders
  - projects and prompts
  - personalities and memories
  - plugins and settings
- `src/components/ChatWorkspace.tsx` owns transient UI state only:
  - draft text, pending files, image preview URLs
  - upload/indexing progress and abort controllers
  - retry request data and request errors
  - speech-recognition state
  - message editing state
  - temporary web-search sources
- Use `useToast().pushToast(...)` from `src/components/ToastProvider.tsx` for visible success, error, and informational feedback.

### Roles

`src/App.tsx` configures GenMB RBAC:

- `aayushmaanshah701@gmail.com` receives the `developer` role with `["*"]` permissions.
- All other users receive the `editor` role with:
  - `chat:write`
  - `files:upload`
  - `workspace:read`

Do not rely on client RBAC alone for sensitive future server-side actions.

## File Structure

```text
index.html                         GenMB SDK injection, metadata, design tokens, PWA links.
public/manifest.webmanifest        Installable PWA metadata and Nexus icons.
public/sw.js                       Shell-only service worker; no offline AI/data caching.
src/main.tsx                       React entry point, global CSS import, PWA registration.
src/App.tsx                        Auth gate, RBAC setup, persisted workspace state, primary layout/navigation.
src/types/index.ts                 Shared Nexus domain types and GenMB-facing type declarations.
src/lib/genmb.ts                   GenMB helper/setup typings and SDK-facing utilities.
src/lib/nexus.ts                   Sole active persistence/integration layer; AI, files, vector DB, CRUD.
src/lib/pwa.ts                     Registers public/sw.js.
src/lib/utils.ts                   Shared utility helpers, including class-name composition.
src/styles/main.css                Active Nexus visual system, themes, layout, responsive styling.
src/components/LandingPage.tsx     Public marketing/entry screen.
src/components/AuthScreen.tsx      Password, Google, sign-up verification, and reset flows.
src/components/ChatWorkspace.tsx   Main chat UI; attachments, voice, search, generation, retries, exports.
src/components/WorkspacePages.tsx  Authenticated non-chat views: projects, library, prompts, settings, tools.
src/components/ToastProvider.tsx   Global toast context and toast rendering.
src/components/AppErrorBoundary.tsx Render-crash containment and reload fallback.
src/components/MathText.tsx        Message text/math rendering helper.
src/components/ui/                Small reusable UI primitives: Button, Card, Modal, EmptyState, Skeleton.
src/assets/nexus-symbol.svg        Primary compact Nexus mark.
src/assets/nexus-logo-full.svg     Full Nexus wordmark asset.
src/components/AppShell.tsx        Legacy ReplyHarbor shell; disconnected.
src/components/WidgetChat.tsx      Legacy ReplyHarbor widget UI; disconnected.
src/pages/                         Legacy ReplyHarbor pages; disconnected.
```

## Key Features

### Authentication and workspace isolation

- Users may authenticate with Google or email/password.
- Sign-up requires email verification; password reset uses an emailed verification code.
- Workspace loading begins only after GenMB auth is ready and a user exists.
- All saved workspace records must remain user-scoped. Never expose one user’s conversations, files, memories, or settings to another user.

### AI chat workspace

`src/components/ChatWorkspace.tsx` provides the primary interaction surface:

- Creates and persists conversations with titles derived from the first user message.
- Supports selectable AI models from `availableModels`.
- Uses personalities, memories, conversation history, and settings to construct prompts through `conversationPrompt`.
- Supports response actions such as regenerate, shorten, lengthen, simplify, explain, translate to Hindi, fix grammar, and continue.
- Supports editing messages and retrying failed requests.
- Allows aborting an in-progress generation via `AbortController`.
- Renders lightweight markdown-like headings, lists, fenced code blocks, and math through `MathText`.
- Supports copying and downloading generated output.

### Attachments and document workflows

Accepted file types are validated through GenMB storage:

- Images: PNG, JPEG, WebP.
- Documents/data: PDF, TXT, CSV, JSON, DOCX.
- Maximum file size: **50 MB**.

Attachment flow:

1. Validate with `window.genmb.storage.validate(...)`.
2. Upload into `nexus/{conversation.id}`.
3. Convert storage metadata with `attachmentFrom(...)`.
4. For non-image files, attempt vector ingestion with `window.genmb.vectordb.ingestFile(...)`.
5. Store the resulting document ID on the attachment when indexing succeeds.

Important: indexing failures should not necessarily discard a successfully uploaded attachment. Surface the issue to the user and preserve usable file context where possible.

### Image, web, and voice tools

- Image attachments may be analyzed through `analyzeImage(...)`.
- Optional web search uses `searchWeb(...)`; results are held as temporary `SearchSource[]` and attached to the active chat response.
- Voice dictation uses the browser Speech Recognition API when available. It is browser-dependent and must fail gracefully.
- Translation is provided through the GenMB integration layer rather than an owned API.

### Workspace organization

Persisted domain concepts include:

- `NexusConversation`: messages, timestamps, title, folder/project association, optional personality.
- `NexusFolder`: conversation organization.
- `NexusProject`: grouped work context.
- `NexusPrompt`: reusable prompt templates.
- `Personality`: reusable AI behavior/persona configuration.
- `Memory`: user-controlled persistent AI context.
- `Plugin`: saved plugin configuration.
- `NexusSettings`: model and appearance behavior, including theme and custom background options.

`App.tsx` applies settings to root `data-*` attributes:

```text
data-theme
data-background
data-animation
data-particles
data-ambient-glow
data-background-motion
data-reduced-motion
--custom-background
```

If a configured custom background URL fails to load, the app restores `lastNexusBackgroundId`, clears the invalid custom background metadata, persists the fallback, and informs the user.

### GenMB API surface

There is no app-owned REST API. Active integrations are mediated by `src/lib/nexus.ts` and use `window.genmb` services including:

```ts
window.genmb.auth
window.genmb.rbac
window.genmb.storage
window.genmb.vectordb
window.genmb.ai
window.genmb.search
window.genmb.image
window.genmb.voice
window.genmb.translate
window.genmb.kv
```

Keep SDK calls wrapped in `src/lib/nexus.ts` unless the call is explicitly transient browser UI behavior, such as voice recognition.

## Design Guidelines

- Visual identity is a dark, futuristic “Nexus” workspace with cyan → blue → violet → magenta gradient accents.
- Core dark surfaces use near-black navy tones, reflected in PWA metadata:
  - background/theme: `#070a12`
  - icon surface: `#091127`
- Primary brand assets are `src/assets/nexus-symbol.svg` and `src/assets/nexus-logo-full.svg`.
- Styling is centralized in `src/styles/main.css`; use existing Nexus CSS classes and CSS variables rather than introducing a parallel styling system.
- Settings may alter theme, background, ambient glow, particles, animation, motion, and reduced-motion behavior.
- Preserve keyboard accessibility, visible focus states, semantic controls, and toast-based feedback.
- Desktop is the primary workspace layout; mobile must retain chat composition, navigation access, safe-area behavior, and usable tool controls.

## App Flow

### First visit and authentication

1. Visitor lands on `LandingPage`.
2. They choose sign-in or workspace creation.
3. `AuthScreen` supports Google, password sign-in, sign-up verification, and password reset.
4. After GenMB auth and RBAC initialization, `App.tsx` loads all user-scoped collections.
5. The user enters the chat workspace by default.

### Chat and research

1. User creates/selects a conversation.
2. User optionally selects a personality, adds files, enables web search, or dictates text.
3. Files upload before/while the request context is assembled; eligible documents are vector-indexed.
4. `complete(...)` generates an answer using conversation context and configured workspace behavior.
5. The conversation persists after user/assistant updates.
6. The user may copy, download, regenerate, edit, or transform an answer.

### Navigation and productivity

- The active workspace uses internal view state in `App.tsx`, not React Router.
- `Cmd/Ctrl + K` opens the command palette.
- `ChatWorkspace` listens for the `nexus:focus-composer` browser event to focus the composer.
- Sidebar behavior is controlled by `App.tsx`; ensure new views work in both collapsed/mobile states.

### Edge cases

- Auth or workspace-load failures must display a toast without permanently blanking the application.
- `AppErrorBoundary` should contain unexpected render crashes and offer a reload action.
- Cancel generation when changing conversations or unmounting the chat workspace.
- Revoke generated image preview object URLs when queued files change or the component unmounts.
- Handle missing browser speech-recognition support without blocking typed chat.
- Do not claim offline access to AI, files, search, or persisted data; the service worker only provides shell fallback.

## Conventions

- Use TypeScript types from `src/types/index.ts`; avoid duplicating domain shapes inside components.
- Use `PascalCase` for components/types, `camelCase` for functions and variables, and descriptive `onX` names for callbacks.
- Keep durable mutations in `App.tsx`; pass async callbacks into child components.
- Keep GenMB persistence, storage, AI, search, image, vector DB, and export logic in `src/lib/nexus.ts`.
- Use `crypto.randomUUID()` for client-created IDs where existing patterns do so.
- Keep active styling in `src/styles/main.css`; reuse UI primitives under `src/components/ui/`.
- Add user-facing feedback with `useToast`, not `alert()` or silent failures.
- Avoid importing legacy ReplyHarbor files into Nexus code.

### Adding a new workspace feature

1. Add or extend the relevant type in `src/types/index.ts`.
2. Add validated, user-scoped persistence/integration helpers in `src/lib/nexus.ts`.
3. Add durable state and load/save callbacks in `src/App.tsx`.
4. Render the feature from `ChatWorkspace.tsx` or `WorkspacePages.tsx`.
5. Add CSS to `src/styles/main.css` using existing Nexus patterns.
6. Add loading, empty, error, and permission-aware states.
7. Verify that switching conversations/users does not leak transient or persisted state.

## Platform (GenMB)

This app is built and hosted on GenMB.

**Runtime:** Browser sandbox (iframe) or Cloud Run. No Node.js server — all code runs client-side unless `backend/` exists.

**Dependencies:** CDN-only (esm.sh, cdn.tailwindcss.com, unpkg). Use ES module imports with full CDN URLs. No `npm install` at runtime.

**Entry point:** `index.html` must include all CDN script tags. Tailwind via CDN with inline config.

**Built-in services (relative API paths only, never hardcode domains):**
- `/api/ai/completion` — AI proxy | `/api/data/{appId}/*` — PostgreSQL (DataConnect SDK)
- `/api/storage/{appId}/*` — File uploads (GCS) | `/api/auth/google/*` — Google OAuth
- `/api/contact/submit` — Contact form | SDKs: `window.genmb.db`, `.storage`, `.auth`

**File structure:** `index.html` (entry), `src/` (source), `styles/` (CSS), `backend/` (optional FastAPI), `CLAUDE.md` (this file).

**Cannot:** Install npm packages at runtime, access filesystem, make direct server-side calls from frontend, modify infra.
