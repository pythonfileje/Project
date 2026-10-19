# Barangay Maligaya – Online Service Request System

A multi-page web application where residents file barangay service requests (clearances, certificates, garbage collection, road and drainage repair, street lighting, peace and order, health assistance) and barangay staff process them. Built as a midterm project.

> "Barangay Maligaya" is a placeholder name. Replace it with your own barangay name (see [Customizing](#customizing)).

## Features

- **Pages:** Home, Login, Register, Dashboard, Requests, Add/Edit Request, Reports, Profile, Users (admin), Help, Prompt Log
- **Roles:** Resident, Staff and Admin, with access control on pages and actions
  - Resident: files and tracks their own requests; may edit or delete them while Pending
  - Staff: sees all requests and updates their status and notes
  - Admin: everything staff can do, plus manages users and roles
  - The first person to register becomes the Admin
- **Full CRUD** on requests, with search and status filter
- **One-click Complete / Reject** buttons for staff, plus status buttons on the edit form
- **Dashboard and reports:** totals, animated donut charts (status and category), recent activity, resolution rate
- **Multiple accounts:** the admin can create accounts and switch between them
- **Form validation:** required fields, email format, mobile format (09XXXXXXXXX), password strength and confirmation, duplicate email and duplicate pending request checks, clear error and success messages
- **UI:** left sidebar navigation (top bar on small screens), light and dark mode, hover effects, responsive layout
- **Prompt Development Log** page documenting how the build prompts were improved

## Project structure

```
barangay-service-requests/
├── index.html                      # Page shell (sidebar, main area, footer)
├── css/
│   └── styles.css                  # All styles, light/dark themes, responsive rules
├── js/
│   ├── app.js                      # Application logic: routing, auth, CRUD, dashboard, reports
│   └── local-storage-adapter.js    # Local database/user fallback for running outside Claude
├── README.md
└── .gitignore
```

## Run locally

No build step, no dependencies, and no installation are needed.

**Option 1 – open the file:** double-click `index.html`.

**Option 2 – small local server (recommended):**

```bash
# Python 3
python -m http.server 8000
# then open http://localhost:8000
```

or

```bash
npx serve .
```

### First run

1. Click **Register** and create your account. You become the **Admin**.
2. Open **Users → + Add new account** to create Staff and Resident accounts.
3. Use the account switcher in the sidebar to try the app as each role.

## How data is stored

| Where it runs | Database | Sign-in |
|---|---|---|
| Published on Claude (artifact) | Shared database provided by Claude | Your Claude account |
| Your computer / GitHub Pages | Your browser's `localStorage` (via `js/local-storage-adapter.js`) | A local browser identity |

Important notes:

- In local mode, data lives **only in the browser you use** and is not shared between people or devices. Clearing site data erases it.
- Passwords are **validated for strength but never stored**. This is a demo and not a secure login system.
- Role checks run in the browser. For a real deployment, move the data and authentication to a backend with server-side rules (for example Supabase, Firebase or a custom API).
- The project contains **no API keys, passwords or other secrets**. Do not add any to the code. If you add a backend later, keep keys in environment variables and list the files in `.gitignore`.

## Publish on GitHub

### Option A – command line

```bash
cd barangay-service-requests
git init
git add .
git commit -m "Initial commit: Barangay service request system"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Create the empty repository on github.com first (do not add a README there, since you already have one).

### Option B – upload in the browser

1. Create a new repository on github.com.
2. Click **uploading an existing file**.
3. Drag the **contents** of the project folder (keep the `css` and `js` folders) into the page and commit.

### Host it free with GitHub Pages

1. In your repository, open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. Save. After a minute your site is available at `https://<your-username>.github.io/<your-repo>/`.

## Customizing

- **Barangay name and wording:** search for `Barangay Maligaya` in `index.html` and `js/app.js` and replace it.
- **Request categories:** edit the `CATS` array at the top of `js/app.js`.
- **Colors:** edit the CSS variables in the `:root` blocks at the top of `css/styles.css`.
- **Prompt Log entries:** edit the `LOG` array in `js/app.js` so it reflects your group's real prompts and results.

## Browser support

Any recent version of Chrome, Edge, Firefox or Safari.
