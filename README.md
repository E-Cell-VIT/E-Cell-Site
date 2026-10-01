# E-Cell VIT Mumbai — Website & Admin CMS (100% Local Version)

The official website and administrative content management system for the **Entrepreneurship Cell (E-Cell) of Vidyalankar Institute of Technology (VIT), Wadala, Mumbai**.

Official Tagline: **LEARN • BUILD • NETWORK • LEAD**

---

## 🚀 Quick-Start Guide (Runs 100% Locally)

This application runs completely on your local computer at `http://localhost:3000`. It requires **zero cloud accounts, zero API keys, no Supabase, no Vercel, no Firebase, and no external services**. All data is safely persisted in a local SQLite database (`./data/ecell.db`).

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Local Database & Seed Data
```bash
npm run prisma:push
npm run seed
```
*(All seed records use clearly marked placeholders like `[Placeholder: ...]`. Seeding never creates an admin account with a known password).*

### Step 3: Create Your Administrator Account
Create your Super Admin account using the interactive setup script:
```bash
npm run create-admin
```
*(Or specify inline: `npm run create-admin -- --email admin@vit.edu.in --name "Administrator" --role super_admin --password "StrongPassword123!"`)*

### Step 4: Run the Development Server
```bash
npm run dev
```

Visit in your browser:
- **Public Website:** [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin) (or login at [http://localhost:3000/admin/login](http://localhost:3000/admin/login))

---

## 🛡️ Automated Verification Suite

Run the automated verification suite to test security, privacy isolation, RBAC rules, magic byte validation, and rate limiting:
```bash
npm run verify
```
This runs 34 automated unit & integration checks verifying:
1. **Public Data-Access Layer Isolation:** Public queries never touch private tables (`startup_private`, `incubation_applications`, `leads`, `privacy_requests`, `admin_users`) or sensitive fields (`founderEmails`, `founderPhones`, `internalNotes`, `pitchDeckPath`).
2. **Audit Log Sanitization:** Passwords, hashes, emails, phone numbers, and internal notes are automatically redacted (`[REDACTED]`) before being written to `./data/ecell.db`.
3. **Magic Byte Validation:** Image and PDF uploads are validated via binary magic bytes (`FF D8 FF` for JPEG, `89 50 4E 47` for PNG, `%PDF-` for PDF) to reject disguised executable scripts.
4. **SQLite-Backed Rate Limiting:** Brute force and repetitive submission protection on public contact forms and application submission endpoints.
5. **Storage Isolation:** Confirms public directory (`./storage/public`) and isolated private storage (`./storage/private`) structures exist.
6. **RBAC & Pitch Deck Access Logging:** Enforces `super_admin` vs `editor` permissions and validates that confidential pitch deck downloads are tracked in `pitch_deck_access_logs`.

---

## 👥 Role Permissions Matrix

The admin dashboard enforces strict server-side Role-Based Access Control (RBAC):

| Feature / Action | `editor` | `super_admin` | Notes |
| :--- | :---: | :---: | :--- |
| **View Overview & Analytics** | ✅ | ✅ | Real-time counts of startups, applications, events |
| **Review Leads & Inquiries** | ✅ | ✅ | Filter by status, mark read/unread, add internal notes |
| **Review Incubation Cohorts** | ✅ | ✅ | Update application status, download pitch deck PDFs |
| **Manage Startups Directory** | ✅ | ✅ | Create, edit, toggle verification badges, archive, restore |
| **Manage Events & Winners** | ✅ | ✅ | Post events, upload reports, record podium winners |
| **Author Blogs & Insights** | ✅ | ✅ | Rich-text markdown, auto read-time, publish toggle |
| **Manage Grants Directory** | ✅ | ✅ | Add schemes, IST deadline timer, document checklist builder |
| **Manage Team & Mentors** | ✅ | ✅ | Add faculty/mentors/student heads, upload headshots |
| **Rollover Academic Year** | ✅ | ✅ | Moves current student council to past council archive |
| **Manage Taxonomy & Categories** | ✅ | ✅ | Add/edit startup domains, event formats, grant sectors |
| **DPDP Privacy Requests** | ✅ | ✅ | Review and process citizen data rights requests |
| **Global Site Settings** | ✅ | ✅ | Update logo, tagline, about/mission/vision, campus map link |
| **Export Data (CSV / JSON)** | ✅ | ✅ | Download full structured datasets for all 8 entities |
| **Manage Admin Users** | ❌ | ✅ | Create admin accounts, change roles, deactivate, reset passwords |
| **View Security Audit Trail** | ❌ | ✅ | Tamper-evident log with before/after diff inspector |
| **Permanent Deletion** | ❌ | ✅ | Hard delete records with mandatory `DELETE` confirmation string |

---

## 📚 Complete Command Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js local development server on `http://localhost:3000` |
| `npm run build` | Builds optimized production bundle and runs TypeScript compilation |
| `npm run start` | Runs the production server locally |
| `npm run verify` | Runs the 34-check security, privacy, and RBAC verification test suite |
| `npm run prisma:push` | Synchronizes SQLite database schema (`./data/ecell.db`) with `schema.prisma` |
| `npm run seed` | Populates database with placeholder data (events, startups, team, grants, blogs) |
| `npm run create-admin` | Interactive CLI to create an administrator account |
| `npm run reset-admin-password` | Interactive CLI to reset an admin password directly in SQLite |
| `npm run backup` | Creates a timestamped `.zip` archive of database and all storage in `./backups/` |
| `npm run restore` | Restores database and files from an existing backup archive with rollback safety |

---

## 🔒 Data Security & Privacy Architecture

### 1. Isolated Private Storage
- **Public Files:** Uploaded to `./storage/public/` (served via public endpoint `/api/files/public/*`).
- **Confidential Pitch Decks:** Uploaded to `./storage/private/pitch_decks/`. These files are **completely inaccessible to public visitors** and are served strictly through the authenticated admin route `/api/files/private/*`.
- **Mandatory Audit Logging:** Every time an administrator views or downloads a pitch deck, an entry is permanently written to `pitch_deck_access_logs` recording the administrator's email, timestamp, IP address, and application ID.

### 2. Digital Personal Data Protection (DPDP) Compliance
- Public inquiry forms (`/api/leads`) and incubation cohort applications (`/api/incubation`) require explicit user consent checkboxes with versioned consent logs (`consentGiven: true`, `consentVersion: "v1.0"`).
- Public users can submit data rights requests at `/privacy-request` for Data Access, Correction, Erasure, or Consent Withdrawal.
- The Admin Privacy Requests module (`/admin/privacy-requests`) provides a compliance queue to fulfill and document user rights requests.

### 3. Public Data Access Layer Separation
- Public queries (`src/lib/db/public-queries.ts`) are completely decoupled from admin queries (`src/lib/db/admin-queries.ts`).
- Public queries strictly enforce `publicationStatus = "Published"` and never select sensitive columns (founder emails, founder phones, verification notes, internal notes, password hashes).

---

## 📦 Backup & Disaster Recovery

> [!IMPORTANT]
> **Back up regularly!**
> Because this application runs 100% locally on your machine, all data lives in `./data/ecell.db` and `./storage/`. Always create a backup before software updates or system migrations.

### How to Create a Backup
```bash
npm run backup
```
Creates `backups/ecell-backup-YYYY-MM-DD-HHMMSS.zip` containing:
- `./data/ecell.db` (complete database snapshot)
- `./storage/public/` (all logos, event photos, reports)
- `./storage/private/` (all pitch decks)

### How to Restore from a Backup
```bash
npm run restore
```
The script will list all available backup zip files in `./backups/`. Enter the number of the archive you wish to restore, and type `YES` to confirm. A safety snapshot of your current database is automatically created before restoring, ensuring zero data loss if anything goes wrong.

---

## 🌐 Transitioning to Production (Future Hosting)

When VIT is ready to deploy this website online:
1. **Option A (VPS with Persistent Storage):** Deploy to any Ubuntu/Debian VPS (e.g. DigitalOcean Droplet, AWS EC2, or Hetzner). The SQLite database and local storage require no changes and run at native speed. Set up a daily cron job to run `npm run backup` to offsite cloud storage.
2. **Option B (Serverless / Cloud DB):** Because all database interactions are abstracted behind the typed data access layer (`src/lib/db/*`), switching from SQLite to PostgreSQL only requires changing `provider = "postgresql"` in `prisma/schema.prisma`. Storage in `src/lib/storage.ts` can be redirected to AWS S3 or Cloudflare R2 with zero changes to any UI components.

---

**Entrepreneurship Cell (E-Cell)**  
Vidyalankar Institute of Technology (VIT), Wadala, Mumbai  
*LEARN • BUILD • NETWORK • LEAD*
