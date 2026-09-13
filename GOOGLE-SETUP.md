# Google Cloud & Spreadsheet Setup Guide

This guide walks you through configuring Google Cloud, Google Sheets, and Google Drive for the **VIT Bhopal University Campus Complaint Management System**.

---

## 1. Google Spreadsheet Connection

The application uses the specified Google Spreadsheet:
- **Spreadsheet URL**: [https://docs.google.com/spreadsheets/d/18cZQvc7ueEOH5qD-4di-fUZVqZzVt8DF_mnbIHbI7xo/edit](https://docs.google.com/spreadsheets/d/18cZQvc7ueEOH5qD-4di-fUZVqZzVt8DF_mnbIHbI7xo/edit)
- **Spreadsheet ID**: `18cZQvc7ueEOH5qD-4di-fUZVqZzVt8DF_mnbIHbI7xo`

### Crucial Step: Share Spreadsheet with Service Account
To allow the server to read and write complaints data:
1. Open the spreadsheet in your browser: [Spreadsheet Link](https://docs.google.com/spreadsheets/d/18cZQvc7ueEOH5qD-4di-fUZVqZzVt8DF_mnbIHbI7xo/edit)
2. Click the green **Share** button in the top-right corner.
3. Paste your Google Cloud Service Account Email (e.g., `checker@lynx-454014.iam.gserviceaccount.com` or your project service account).
4. Set the role to **Editor**.
5. Uncheck "Notify people" and click **Share**.

---

## 2. Google Cloud Console Configuration

### A. Create or Select a GCP Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named `VIT-Bhopal-Complaints` or select an existing one.

### B. Enable APIs
Enable the following APIs in **APIs & Services > Library**:
1. **Google Sheets API**
2. **Google Drive API**

### C. Create Service Account & Private Key
1. Navigate to **IAM & Admin > Service Accounts**.
2. Click **Create Service Account**.
3. Name it: `complaint-system-backend`.
4. Grant the service account permissions (Project Viewer or Editor).
5. Once created, click on the service account > **Keys** tab > **Add Key** > **Create new key** > **JSON**.
6. A JSON file will download to your machine. It contains:
   - `client_email`
   - `private_key`
   - `project_id`

### D. Setup Google OAuth 2.0 (For Google Sign-In)
1. Navigate to **APIs & Services > Credentials**.
2. Click **Create Credentials > OAuth Client ID**.
3. Application Type: **Web application**.
4. Authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://your-app.vercel.app` (for production)
5. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback`
   - `https://your-app.vercel.app/api/auth/google/callback`
6. Copy your **Client ID** and **Client Secret**.

---

## 3. Google Drive Attachments (Private Storage)

1. Open [Google Drive](https://drive.google.com/).
2. Create a folder named: `VIT Bhopal Complaint Attachments`.
3. Right-click the folder > **Share** > Add your Service Account email as **Editor**.
4. Copy the folder ID from the URL:
   `https://drive.google.com/drive/folders/[FOLDER_ID]`
5. Set `GOOGLE_DRIVE_FOLDER_ID=[FOLDER_ID]` in your environment.

> [!NOTE]
> All uploaded attachments remain **private**. The application serves files via an authenticated endpoint (`/api/attachments/[id]`) to prevent unauthorized access to student documents.

---

## 4. Environment Variables Configuration

Copy `.env.example` to `.env.local` (or configure in Vercel Settings):

```env
# Service Account
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Sheet & Drive
GOOGLE_SHEET_ID=18cZQvc7ueEOH5qD-4di-fUZVqZzVt8DF_mnbIHbI7xo
GOOGLE_DRIVE_FOLDER_ID=your-drive-folder-id

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Session Auth
AUTH_SECRET=super_secure_minimum_32_chars_random_string
NEXTAUTH_URL=http://localhost:3000

# Optional Domain Restriction (e.g. vitbhopal.ac.in)
ALLOWED_EMAIL_DOMAIN=
```

---

## 5. Automatic Sheet Initialization

Run the automated setup script to build the entire sheet structure:

```bash
npm run setup-sheet
```

This will automatically create:
- `Users`
- `Complaints`
- `Complaint_Status_History`
- `Categories`
- `Admins`
- `Notifications`
- `Audit_Log`
- `Settings`

With navy blue headers, bold text, frozen top row, auto-fitted columns, filters, and dropdown validations.

---

## 6. Vercel Deployment

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Campus Complaint System"
   git push origin main
   ```
2. Import the project in [Vercel](https://vercel.com).
3. Under **Settings > Environment Variables**, add:
   - `GOOGLE_PROJECT_ID`
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` (ensure `\n` characters are properly preserved)
   - `GOOGLE_SHEET_ID`
   - `GOOGLE_DRIVE_FOLDER_ID`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `AUTH_SECRET`
   - `NEXTAUTH_URL` (set to your Vercel production URL e.g. `https://your-domain.vercel.app`)
4. Deploy!
