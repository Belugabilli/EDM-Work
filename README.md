# VIT Bhopal University - Campus Complaint Management System

A production-grade, secure Web-Based Campus Complaint Management System engineered for **VIT Bhopal University**, deployed on **Vercel** with **Google Sheets API** as the primary and only application data store and **Google Drive API** for private, authorized complaint attachments.

---

## 🌟 Key Architecture & Highlights

- **Separated Student & Admin Portals**: Completely distinct UI themes, navigation systems, and server-side authorization guards.
  - **Student Portal**: Grievance lodging, real-time status stepper tracking, and in-app notifications.
  - **Admin Portal**: 360-degree ticket management, departmental assigning, official administrative responses, and live analytics.
- **Zero "Section" Field**: Strictly compliant with university requirements — students only have `Student ID`, `Name`, `Email`, `Phone`, `Department`, `Year`, and an optional `Room No. (if any)`.
- **Optional Room Number**: `Room No. (if any)` is strictly optional and not marked as compulsory anywhere in registration, profile, or complaint flow.
- **Direct Google Sheets Backend**: Google Sheets serves as the primary and single source of truth across 8 structured tabs. No local filesystem database or silent fallback.
- **Strictly Private Google Drive Attachments**: Attachments (PDF, JPG, PNG up to 10MB) are stored in private Google Drive folders and streamed exclusively through authenticated, access-controlled endpoints (`/api/attachments/[id]`).
- **Automated Sheet Provisioning**: Idempotent `npm run setup-sheet` script automatically connects to the Google Spreadsheet, creates missing tabs, applies freeze panes, navy blue header styling, filters, and dropdown data validations.

---

## 🏗️ Google Spreadsheet Schema (8 Tabs)

1. **`Users`**:
   `user_id | student_id | name | email | phone | department | year | room_no | role | account_status | created_at | last_login`
2. **`Complaints`**:
   `complaint_id | user_id | student_id | category_id | subject | description | location | room_no | priority | status | assigned_to | attachment_url | admin_response | created_at | updated_at | resolved_at | closed_at`
3. **`Complaint_Status_History`**:
   `history_id | complaint_id | old_status | new_status | changed_by | comment | timestamp`
4. **`Categories`**:
   `category_id | category_name | department | active`
5. **`Admins`**:
   `admin_id | user_id | name | email | department | role | active`
6. **`Notifications`**:
   `notification_id | user_id | complaint_id | title | message | type | is_read | created_at`
7. **`Audit_Log`**:
   `log_id | actor_id | action | entity_type | entity_id | details | timestamp`
8. **`Settings`**:
   `key | value`

---

## 💻 Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide Icons
- **Database / Store**: Google Sheets API v4 (`googleapis`)
- **File Storage**: Google Drive API v3 (`googleapis`)
- **Authentication**: Google OAuth 2.0 (`google-auth-library`), signed session JWTs (`jose`)
- **Script Runner**: `tsx` for automated spreadsheet setup
- **Deployment**: Vercel

---

## 🚀 Quick Start & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd EDM
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in the Google Cloud service account credentials and OAuth keys:
```env
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=18cZQvc7ueEOH5qD-4di-fUZVqZzVt8DF_mnbIHbI7xo
GOOGLE_DRIVE_FOLDER_ID=your-drive-folder-id
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
AUTH_SECRET=super_secure_secret_key_minimum_32_chars
NEXTAUTH_URL=http://localhost:3000
ALLOWED_EMAIL_DOMAIN=
```

### 3. Share Spreadsheet with Service Account
Open the spreadsheet:
[https://docs.google.com/spreadsheets/d/18cZQvc7ueEOH5qD-4di-fUZVqZzVt8DF_mnbIHbI7xo/edit](https://docs.google.com/spreadsheets/d/18cZQvc7ueEOH5qD-4di-fUZVqZzVt8DF_mnbIHbI7xo/edit)
Click **Share** and grant **Editor** access to your `GOOGLE_CLIENT_EMAIL`.

### 4. Run Automatic Sheet Setup
```bash
npm run setup-sheet
```
This automatically configures all 8 tabs, styles headers, freezes row 1, applies column sizing, filters, and dropdown validations.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Role Protection

- **Server-Side Authorization**: Roles (`STUDENT`, `ADMIN`, `SUPER_ADMIN`) are determined strictly server-side by checking the `Admins` and `Users` tabs. Client requests cannot forge role privileges.
- **Route Protection**: Next.js middleware guards `/admin/*` and `/student/*`.
  - Students accessing `/admin/*` are rejected with 403 Forbidden or redirected.
  - Admins accessing `/student/*` are routed directly to `/admin/dashboard`.
- **Private Attachments**: Files uploaded to Google Drive are never shared with public permissions. They are streamed strictly through `/api/attachments/[id]` after verifying the user is an Admin or the student who created the complaint.
- **Zero Client Credential Leak**: Google API keys and private service account keys execute exclusively inside server-side API routes.

---

## 📦 Vercel Deployment

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Complete VIT Bhopal Complaint Management System"
   git push origin main
   ```
2. Import project into **Vercel**.
3. Under **Project Settings > Environment Variables**, add the environment variables from `.env.local`.
4. Deploy!

---

## ⚠️ Known Google Sheets Operating Characteristics

- **Rate Limits**: Google Sheets API has a quota of 300 requests per minute per project. For university-wide high throughput (>50k concurrent users), a relational database such as PostgreSQL/Supabase can be connected through the existing modular service layer (`lib/googleSheets.ts`).
- **Data Integrity**: Concurrency is managed via batch updates and atomic sequential ID generation (`CMP-2026-XXXXX`).
