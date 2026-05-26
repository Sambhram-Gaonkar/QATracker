# QATrackr

QATrackr is a B2B SaaS MVP for manual QA testers, freelance testers, QA trainees, small teams, agencies, and QA training institutes. It replaces messy Excel-based QA tracking with project-based test cases, bug reports, proof screenshots, dashboards, and Excel exports.

## Features

- Landing page for “Simple QA Test Case & Bug Report Manager”
- Supabase email/password signup and login
- Protected SaaS dashboard routes
- Automatic default organization/workspace creation
- Project CRUD with search, status filter, edit, and delete confirmation
- Test case CRUD with filters, quick status update, automatic `TC-001` IDs, and Excel export
- Bug report CRUD with filters, colored severity/status badges, automatic `BUG-001` IDs, screenshot proof upload, and Excel export
- Excel/CSV import for existing QA sheets, including multi-sheet workbooks with separate test case and bug report tabs
- Cross-project dashboard and reports with Recharts
- Free plan enforcement: 1 project, 20 test cases, 10 bugs
- Billing page with Free, Pro, and Team plans plus Stripe TODO placeholders
- Settings page for workspace name, current plan, user email, and logout
- Supabase PostgreSQL schema, RLS policies, updated_at triggers, and storage bucket migration

## Tech Stack

- Next.js App Router with TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, Storage, and RLS
- Recharts
- xlsx
- Lucide React
- Vercel-ready environment configuration

## Folder Structure

```txt
src/
  app/
  components/
    layout/
    ui/
    dashboard/
    projects/
    test-cases/
    bugs/
    exports/
  lib/
    supabase/
  types/
supabase/
  migrations/
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PRO=
STRIPE_PRICE_ID_TEAM=
```

No secrets are hardcoded. Stripe variables are placeholders for the future billing implementation.

## Supabase Setup

1. Create a Supabase project.
2. Go to Project Settings > API.
3. Copy the Project URL into `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy the anon public key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Copy the service role key into `SUPABASE_SERVICE_ROLE_KEY` only for server-side future use. Do not expose it in the browser.
6. Go to Authentication > Providers and enable Email.
7. For local development, set the site URL to `http://localhost:3000`.

## Database Migration

Run the migration manually:

1. Open Supabase SQL Editor.
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`.
3. Run the SQL.
4. Confirm tables exist: `organizations`, `organization_members`, `projects`, `test_cases`, `bugs`, `user_profiles`.
5. Confirm the `bug-proofs` storage bucket exists.

The migration enables RLS and scopes data to organization members. A signup trigger creates `user_profiles`, a default organization, and an owner membership.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Local Demo Mode Without Supabase

If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing, QATrackr automatically runs in local demo mode. Demo mode uses browser `localStorage` with a built-in user:

- Email: `demo@qatrackr.local`
- Workspace: `My Workspace`
- Plan: `pro`

This lets you open `/dashboard`, create projects, add test cases, add bug reports, use filters, edit/delete records, and test Excel exports locally before connecting Supabase. Data is stored only in the browser where you test it.

Production checks:

```bash
npm run build
npm run lint
```

## Create First User

1. Start the app with `npm run dev`.
2. Visit `/signup`.
3. Create an account with email and password.
4. After signup, the app redirects to `/dashboard`.
5. Supabase creates “My Workspace” automatically.

If email confirmation is enabled in Supabase, confirm the email first, then log in at `/login`.

## Test Core Flows

- Login/signup: create an account, log out, and log back in.
- Protected routes: open `/dashboard` in a logged-out browser and confirm redirect to `/login`.
- Project creation: go to `/projects/new`, create “E-Commerce Website Testing”.
- Test cases: open the project, add test cases for Login, Registration, Product Search, Cart, Checkout, Payment, and Dashboard.
- Bug reports: add bugs and upload a screenshot proof file.
- Excel export: use Export Test Cases, Export Bugs, and Export Full Report from project pages.
- Excel/CSV import: open a project detail page and use Import Excel/CSV to import all matching test case and bug sheets. Open the Test Cases or Bugs pages to import only that data type.
- Free limits: on Free plan, attempt to create more than 1 project, 20 test cases, or 10 bugs.

## Excel and CSV Import Format

QATrackr detects headers automatically, so files can include report title rows above the actual table headers. Multi-sheet `.xlsx` files are supported.

Supported test case columns:
- Module
- Test Case ID
- Title
- Preconditions
- Test Steps
- Expected Result
- Actual Result
- Priority
- Status

Supported bug report columns:
- Bug ID
- Bug Title
- Module/Feature
- Test Steps
- Expected Result
- Actual Result
- Severity
- Priority
- Proof
- Status

If a test case row has a blank Module, QATrackr uses the previous non-empty Module from that sheet. Bug status `New` is imported as `Open`.

## Sample Data

Sample Project: E-Commerce Website Testing

Sample Modules:
- Login
- Registration
- Product Search
- Cart
- Checkout
- Payment
- Dashboard

Sample Test Cases:
- Verify login with valid credentials
- Verify login with invalid password
- Verify search with valid product name
- Verify add to cart functionality
- Verify checkout form validation

Sample Bugs:
- Login button does not respond on first click
- Cart count does not update after adding product
- Payment page accepts invalid CVV
- Search filter resets after page refresh

## Deploy on Vercel

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Add all environment variables from `.env.example`.
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL.
5. Run the Supabase migration before testing production auth.
6. Deploy.

## Day-wise Build Roadmap

Day 1: Project Setup
- Initialize Next.js app
- Configure TypeScript
- Configure Tailwind CSS
- Create folder structure
- Add basic layout
- Add reusable UI components
- Add `.env.example`

Day 2: Supabase Setup
- Create Supabase client files
- Add server/client Supabase helpers
- Create SQL migration
- Add tables
- Add RLS policies
- Add storage bucket policy
- Add database types

Day 3: Authentication
- Build signup page
- Build login page
- Build logout
- Protect dashboard routes
- Add auth redirects
- Create default organization after signup/login

Day 4: SaaS Layout
- Build dashboard shell
- Add sidebar
- Add topbar
- Add responsive layout
- Add settings page
- Show user/workspace info

Day 5: Projects Module
- Create project form
- Create projects list
- Create project detail page
- Add edit/delete project
- Add search/filter
- Add Free plan project limit

Day 6: Test Case Module
- Create test case form
- Create test case table
- Add create/edit/delete
- Add status update
- Add search/filter
- Add Free plan test case limit

Day 7: Bug Report Module
- Create bug form
- Create bug table
- Add create/edit/delete
- Add severity/priority/status badges
- Add search/filter
- Add Free plan bug limit

Day 8: Screenshot Proof Upload
- Configure Supabase Storage
- Upload bug proof files
- Save proof URL/path
- Show proof links in bug table
- Add upload validation

Day 9: Dashboard Analytics
- Show stat cards
- Add test case status chart
- Add bug severity chart
- Add recent bugs
- Add recent failed test cases

Day 10: Excel Export
- Add export test cases to Excel
- Add export bugs to Excel
- Add full project report export
- Add summary sheet
- Test exported files

Day 11: Reports Page
- Add cross-project analytics
- Add global charts
- Add recent activity
- Add export all reports if possible

Day 12: Billing Page
- Add Free, Pro, Team plans
- Show current plan
- Add usage limit display
- Add upgrade placeholder buttons
- Add TODO notes for Stripe Checkout integration

Day 13: UI Polish
- Improve spacing
- Improve mobile responsiveness
- Improve empty states
- Improve loading states
- Improve error messages
- Improve badges and tables

Day 14: QA Testing
- Test signup/login/logout
- Test protected routes
- Test project CRUD
- Test test case CRUD
- Test bug CRUD
- Test file upload
- Test Excel export
- Test plan limits
- Fix bugs

Day 15: Deployment Readiness
- Ensure `npm run build` passes
- Ensure `npm run lint` passes
- Update README
- Add Vercel deployment notes
- Add screenshots placeholders in README
- Final cleanup

## Future Roadmap

Version 1.1:
- Team invite system
- Role-based access UI
- Comments on bugs
- Activity log
- CSV import from Excel

Version 1.2:
- Requirement module
- Test suite module
- Test run module
- Test execution history
- Re-test failed test cases

Version 1.3:
- AI test case generator from requirement text
- AI bug report formatter
- AI severity/priority suggestion
- AI Selenium Python script generator

Version 1.4:
- Jira integration
- GitHub Issues integration
- Slack notifications
- Email reports

Version 1.5:
- Real Stripe/Razorpay payment integration
- Customer portal
- Invoice history
- Subscription management

## Known Limitations

- Billing buttons are placeholders. Add Stripe Checkout route handlers and real price IDs before charging users.
- Team invitations and role-based UI are not implemented in the MVP.
- Storage policies are authenticated and bucket-scoped; stricter object-path checks can be added when team collaboration expands.
- The app assumes one active organization per user for the MVP.
