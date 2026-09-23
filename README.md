# personal-site

Justin Lu's personal site, plus a Lightfield-style CRM built two ways:

- **`twenty/`**: the real thing, on top of the open-source [Twenty CRM](https://github.com/twentyhq/twenty) (v2.9.0).
  A compose file to self-host Twenty and a provisioning script that adds Lightfield's five primitives through Twenty's
  APIs: Skills, Knowledge, chat-built Automations (workflows), run logs with a "For review" queue, and Permissions
  (roles). Verified against a running Twenty. Start with [`twenty/README.md`](twenty/README.md).
- **`crm/`**: a standalone static prototype of the Lightfield UI, useful as a design reference.

## Prototype UI (`crm/`)

A self-contained, AI-native CRM prototype in the style of Lightfield and Twenty: vanilla
HTML, CSS and JavaScript with no build step. Open `crm/index.html` in a browser
(or serve the repo with any static server) and it boots with a sample workspace.
Everything you change is stored in `localStorage`; use Settings to export a JSON
backup or reset to the sample data.

What is in it:

- **Up next** – today's meetings, tasks, pipeline KPIs and anything needing attention.
- **For review** – updates proposed from calls and automations (field changes,
  new contacts, email drafts) that you approve or dismiss in one click.
- **Knowledge** and **Skills** – notes the assistant draws on, and the reusable
  capabilities it can run.
- **Automations** – a table of 20 automations with a detail panel showing status,
  run protection, credits, performance, description, triggers, steps and a run log.
  "Run now" and "Pause" work, and real events (contact created, stage changed,
  meeting processed…) fire the matching automations.
- **Contacts, Companies, Opportunities, Meetings** – sortable, searchable tables
  with inline editing, full record pages with activity timelines, and a drag-and-drop
  pipeline board.
- **Meetings** – a recording preference (external only / all / none) set during
  onboarding, per-meeting overrides, and a "Simulate call now" button that produces a
  summary, follow-up tasks, and proposed record updates.
- **Chat** – a command assistant that creates records and automations, drafts recap and
  intro emails, builds a pipeline dashboard and answers questions about any record.
- **Lists** under Favorites and Demand, ⌘K search across everything, light and dark
  themes, and a responsive layout.
