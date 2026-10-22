# Dialoqo frontend

React and Vite frontend for company administration, role-based access, WhatsApp onboarding, conversation monitoring, and auditing.

## Development

```sh
npm ci
npm run dev
```

```sh
npm run lint
npm run build
npm run preview
```

## Architecture

```text
src/
  api/                  Authenticated HTTP client
  assets/               Product assets
  components/
    access/             Access forms, sections, and paired lists/items
    auditing/           Audit filters, event lists, details, and metadata
    auth/               Login form, panel, and visual
    common/             Shared controls, forms, feedback, lists, navigation, and overlays
      layout/           Application layout, headers, and the Page shell
    monitoring/         Conversations, messages, templates, and resource selection
    organization/       Company and branch forms, sections, and paired lists/items
    public/             Public layout, page sections, visuals, and lists/items
    routing/            Authorization and route loading boundaries
    whatsapp/           Account, number, template, and assignment components
  context/              Context values and providers
  data/                 Domain content, filter defaults, and context transformations
  hooks/                All context, form, resource, request, and lifecycle hooks
  pages/                Route and major workspace entry points
  routes/               Routes, role redirects, and lazy page imports
  services/             Backend API communication and external integrations
  styles/               Global reset and design tokens
  utils/                Pure helpers, request ownership, and bounded metadata traversal
```

Every component has its own folder under `components/<domain>/<category>/<ComponentName>/`, containing its JSX file and, when styled, its own CSS Module. For example, the branch form lives in `components/organization/forms/BranchForm/BranchForm.jsx` alongside `BranchForm.module.css`. Components that only delegate rendering or supply behavior do not need an empty stylesheet.

Categories reflect the components present in each domain:

| Domain | Categories |
| --- | --- |
| `access` | `forms`, `lists`, `sections` |
| `auditing` | `forms`, `lists`, `metadata`, `panels` |
| `auth` | `forms`, `panels`, `visuals` |
| `common` | `buttons`, `feedback`, `forms`, `layout`, `lists`, `navigation`, `overlays` |
| `monitoring` | `content`, `forms`, `lists`, `media`, `panels`, `sections` |
| `organization` | `forms`, `lists`, `sections` |
| `public` | `layout`, `lists`, `sections`, `visuals` |
| `routing` | `boundaries`, `guards` |
| `whatsapp` | `forms`, `lists`, `sections` |

List/item pairs and controller/view pairs stay together in the same category. Message composers belong with forms, template pickers with panels, and workspace views with sections.

Shared layout components live under `components/common/layout/<ComponentName>/`.

Pages keep their domain grouping and each live in a dedicated `<PageName>/` folder containing `<PageName>.jsx` and `<PageName>.module.css`. For example, the monitoring page lives in `pages/monitoring/MonitoringPage/`.

Each context and its provider share a file in `src/context/`: `AuthContext.jsx` and `LanguageContext.jsx`. Their consumer hooks remain in `src/hooks/`.

Pages use the shared `Page` shell and orchestrate their view context. Hooks in `src/hooks/` own resource behavior; presentation components receive data and actions. API services remain responsible for communication with the backend.

Forms use the shared `components/common/forms/Form/Form.jsx` primitive, which forwards native form attributes and events. Each form owns editable drafts and local validation, while its controller owns persistence. Context selectors can remain controlled when their selection determines the surrounding workspace. A selection or reset identity initializes a fresh draft without resetting it on unrelated renders.

Collections use paired list and item components. Lists can accept loading and empty content; individual items format their record and invoke supplied actions. Section tabs support disabled states, badges, icons, arrow keys, Home, and End.

Monitoring shares one WebSocket connection per company and number. Conversation previews, private read counts, message edits, and delivery receipts update the affected records directly. Unchanged rows and the message composer retain their state. Successful sends merge the returned message into the timeline and deduplicate its socket echo.

The timeline retains loaded history and follows incoming messages while the reader is near the bottom. Reading older messages preserves the viewport and exposes a new-message shortcut. Reconnects reconcile missed messages in the background; filtered or paginated conversation membership changes also reconcile without hiding the current list.

React components use JavaScript JSX. Styling uses CSS Modules and shared variables. Relative imports retain the existing project convention.

## Configuration

Configure public frontend values through Vite environment variables:

| Variable              | Purpose                                                             |
| --------------------- | ------------------------------------------------------------------- |
| `VITE_API_BASE_URL`   | Backend HTTP origin or base path; defaults to the current origin    |
| `VITE_WS_BASE_URL`    | Optional explicit WebSocket base URL; otherwise uses the API origin |
| `VITE_META_APP_ID`    | Public Meta application identifier                                  |
| `VITE_META_CONFIG_ID` | Public Embedded Signup configuration identifier                     |

Backend secrets and operational Meta tokens must remain on the backend. Backend authentication, tenant boundaries, role permissions, message authorization, and onboarding remain authoritative.

## Validation and maintenance

ESLint enforces the shared Button, isolated page fields, paired collection rendering, the Page shell, CSS Modules instead of inline styles, and API-free presentation components. It also checks React hook usage and dependencies.

Metadata traversal preserves normal JSON formatting and bounds depth, cycles, and entry count.

Live backend, Meta onboarding, and browser interaction checks require a configured environment and an authorized account.

Follow [the coding guidelines](docs/coding_guidelines.md) and the repository's commit and pull request guidelines when extending the application.
