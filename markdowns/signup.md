You have full context of the entire SparkClub codebase (frontend + backend + auth flow + database schema + routing + UI architecture). Implement the following feature completely and modify existing code directly instead of generating isolated examples.

PROJECT CONTEXT:
SparkClub is a multi-role club governance platform with:
- frontend deployed on Vercel
- backend on Render
- React/Vite frontend
- Node.js + Express backend
- JWT authentication
- role-based dashboards
- current login flow exists
- existing user auth system exists
- existing backend routes and database schema exist

TASK:
Implement a full signup / onboarding system with role governance and redesign the authentication UI.

==================================================
PART 1 — SIGNUP SYSTEM IMPLEMENTATION
==================================================

Create a complete signup flow.

Business rules:

1. Any public user can sign up.

2. Every newly created user MUST be assigned:
"default role = member"

NOT:
- treasurer
- faculty
- club head
- super admin

ONLY:
member

3. Role elevation is controlled ONLY by Super Admin.

Super admin can later promote a member into:
- student head
- treasurer
- faculty advisor
- faculty coordinator
- club coordinator
- event lead
- department lead

4. No user can self-select privileged roles during signup.

STRICTLY DISALLOW:
dropdown role selector at signup.

==================================================
PART 2 — BACKEND IMPLEMENTATION
==================================================

Modify backend authentication architecture.

Implement:

AUTH ROUTES:

POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me

Signup payload:

{
  "fullName": "",
  "email": "",
  "password": "",
  "phone": "",
  "college": "",
  "department": "",
  "year": ""
}

Signup backend logic:

- validate required fields
- sanitize input
- normalize email
- hash password with bcrypt
- prevent duplicate emails
- create user record
- assign role = "member"
- set account status = active
- generate JWT
- return authenticated user session

Database fields required:

users:
- id
- full_name
- email
- password_hash
- phone
- college
- department
- year
- role
- status
- created_at
- updated_at

Validation:
- valid email
- strong password
- minimum password length
- unique email
- no empty fields

Error responses:
- duplicate account
- weak password
- invalid email
- malformed payload
- server failure

Login must continue working.

==================================================
PART 3 — ROLE MANAGEMENT
==================================================

Super admin must gain member role management.

Implement admin routes:

GET /api/superadmin/users
PATCH /api/superadmin/users/:id/role
PATCH /api/superadmin/users/:id/status

Role update logic:
only super admin allowed.

Allowed transitions:

member →
- student head
- treasurer
- faculty advisor
- faculty coordinator
- department lead
- event lead

Blocked:
member → super admin

unless explicitly seeded manually.

Admin user management dashboard must include:
- all users table
- role badge
- account status
- created date
- search users
- filter by role
- promote/demote actions
- deactivate account
- reactivate account

==================================================
PART 4 — AUTHORIZATION CHANGES
==================================================

Update RBAC middleware.

Role-based route protection must support:

member
student_head
treasurer
faculty_advisor
faculty_coordinator
club_head
super_admin

Unauthorized users must be blocked cleanly.

If member attempts admin page:
redirect or 403.

==================================================
PART 5 — FRONTEND SIGNUP PAGE
==================================================

Create a premium modern signup experience.

Current auth UI is visually empty and boring.

Redesign login + signup completely.

DO NOT use:
plain centered white card
basic bootstrap form
blank background
minimal boring auth template

Create immersive modern auth experience.

STYLE:
premium SaaS
dark mode first
interactive
motion rich
high-end product feel

Visual direction:
Stripe + Linear + Framer + futuristic SaaS dashboard aesthetic

Include:

BACKGROUND:
- animated gradient mesh
- floating particles
- subtle glowing nodes
- moving soft light effects
- layered depth
- blurred glass panels

AUTH CARD:
- glassmorphism
- floating shadows
- rounded premium edges
- animated hover lighting
- subtle depth transitions

LOGIN PAGE:
fields:
- email
- password

features:
- show/hide password
- remember me
- forgot password
- animated validation
- loading states
- inline error messages

SIGNUP PAGE:
fields:
- full name
- email
- password
- confirm password
- phone
- college
- department
- academic year

NO ROLE DROPDOWN.

signup CTA:
“Create Account”

Add:
- password strength meter
- animated validation indicators
- success feedback
- loading spinner
- disabled submit states

==================================================
PART 6 — INTERACTIVITY
==================================================

Make auth pages feel premium.

Add:
- Framer Motion animations
- entrance transitions
- staggered field reveals
- subtle hover transforms
- animated button gradients
- interactive input glow
- mouse parallax background
- soft floating abstract shapes

Optional split layout:

LEFT:
brand storytelling
product value proposition
feature highlights

RIGHT:
auth form

Or dynamic centered immersive experience.

==================================================
PART 7 — RESPONSIVE DESIGN
==================================================

Fully responsive.

Desktop:
rich immersive layout

Tablet:
optimized split or stacked layout

Mobile:
clean premium mobile auth

No broken spacing.

==================================================
PART 8 — USER FLOW
==================================================

Signup flow:

visitor
→ signup
→ account created
→ JWT issued
→ redirected to member dashboard

Login flow:

existing user
→ login
→ route by role

Routing logic:
member → /dashboard/member
student_head → /dashboard/head
treasurer → /dashboard/treasurer
faculty_advisor → /dashboard/faculty
super_admin → /dashboard/superadmin

==================================================
PART 9 — CODE QUALITY
==================================================

Requirements:
- modify existing architecture
- preserve current auth structure where possible
- avoid breaking login
- production-ready code
- clean folder organization
- reusable components
- consistent styling
- API integration wired correctly
- proper error handling

==================================================
FINAL OUTPUT
==================================================

Implement complete working feature directly in project codebase.
Do not provide pseudo-code only.
Ensure backend + frontend + RBAC + admin management are fully integrated.