# Lightfield-style CRM on Twenty

This folder runs the real, open-source [Twenty CRM](https://github.com/twentyhq/twenty)
(AGPL, v2.9.0) and layers Lightfield's five primitives on top of it **without forking Twenty**.
Everything is done through Twenty's own extension points: custom objects and fields, workflows,
AI agents, roles and permissions, and the REST/GraphQL APIs.

## The five primitives, mapped to Twenty

| Lightfield primitive | How it is built on Twenty |
|---|---|
| **Skills** – reusable playbooks you run against your data | A `Skill` custom object holding the instructions, plus one *manual-trigger workflow per skill* whose single step is an **AI agent step** that runs those instructions. Run from any record's "Run workflow" menu or from the agent chat. Customize by editing the Skill record and re-provisioning. |
| **Knowledge** – company facts and rules the agent grounds in | A `Knowledge` custom object (title, category, body, optional company link). The workspace agent's system prompt tells it to read Knowledge before drafting, and every AI step's prompt references it. |
| **Automations** – AI steps built with you in chat | Twenty **workflows**: a trigger (record created/updated, cron, webhook, manual) plus steps (AI agent, find records, create/update record, send email, HTTP request, code). Each AI step is prompted to load the full customer context (company, people, opportunities, notes), not just the trigger payload. Building one in chat is Twenty's own "Ask AI" agent with the `WORKFLOWS` permission, seeded with the Lightfield three-question playbook (what should happen, when it runs, what it can touch). |
| **Run logs + "For review"** | Run logs are Twenty's built-in **Workflow Runs** (per-step inputs, outputs, errors). "For review" is a `Review` custom object: every automation that wants to change a record or send something creates a `Review` (`FIELD_UPDATE`, `EMAIL_DRAFT`, `SLACK_DRAFT`, `MERGE`) instead of acting. The **Apply approved review** workflow fires when a person moves a Review to `APPROVED` and applies it. Runs go to completion; humans review after. |
| **Permissions** | Twenty **roles**. A dedicated `Lightfield Agent` role gives the workspace agent and every workflow only the object permissions and permission flags they need (read all objects, write `Review`/`Knowledge`/`Task`/`Note`, no destructive access). Workflows that need more (writing opportunities, sending email) are called out in `provision/definitions/content.mjs` and you grant those role permissions explicitly before activating them. |

## Run it

Requirements: Docker with Compose, and an AI provider key for agent steps (Anthropic or OpenAI).

```bash
cd twenty
cp .env.example .env            # set ENCRYPTION_KEY (openssl rand -base64 32) and an AI key
docker compose up -d
open http://localhost:3000      # create your workspace (first sign-up becomes admin)
```

Then create an API key in Twenty (Settings → API & Webhooks → API keys) and provision the layer:

```bash
cd provision
TWENTY_URL=http://localhost:3000 TWENTY_API_KEY=... node provision.mjs
```

The script is idempotent: it creates what is missing, updates what already exists, and prints what it did.
Use `node provision.mjs --only=objects,knowledge` to run part of it and `node verify.mjs` to check the result.

## What gets provisioned

- **Objects**: `Knowledge`, `Skill`, `Review`, plus extra fields on `company` (segment, source, billingCustomerId),
  `person` (leadStatus, source) and `opportunity` (nextStep, qualifiedAt).
- **Role** `Lightfield Agent` and the workspace **agent** with the Lightfield system prompt.
- **Workflows**: the 20 automations in `definitions/content.mjs` (Cal.com demo booked, post-meeting follow-up,
  dedupe, recap emails, account segmentation, LinkedIn leads, research, enrichment, billing sync, Slack on Won,
  stale-deal nudges, weekly digest, "Apply approved review", …) and one manual workflow per Skill.
- **Sample data**: 12 companies, 20 people, 11 opportunities, 3 call notes, 7 pending reviews and the Knowledge base,
  so the "For review" view is populated on first open.

## Layout

```
twenty/
  docker-compose.yml        self-hosted Twenty, pinned to v2.9.0
  .env.example
  provision/
    provision.mjs           creates objects, fields, role, agent, workflows, records (idempotent)
    verify.mjs              checks the workspace after provisioning
    twenty-client.mjs       tiny REST + GraphQL client using an API key
    definitions/content.mjs the Lightfield content: knowledge, skills, automations, seed records
```

## Prototype UI

`../crm/` is a standalone static prototype of the Lightfield UI (review queue, chat-built automations,
permission grants, sequences, settings). It is useful as a design reference for what the Twenty workspace
should feel like, but it is not connected to Twenty.
