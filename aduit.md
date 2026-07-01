# EventStaff Nepal — Full Site Audit & Fix

You are auditing a MERN stack app (React 18 + Vite + Tailwind, Express, MongoDB, 
Socket.IO) for bugs where the UI doesn't reflect authenticated state, plus broken 
links, dead buttons, and role-based access leaks.

## Phase 1 — Map the codebase (read only, don't change anything yet)

1. Read `client/src/context/AuthContext.*` (or wherever auth state lives). Note 
   exactly what it exposes: `user`, `isAuthenticated`, `loading`, `role`, etc.
2. Read `client/src/App.jsx` and the router config. List every route and which 
   component renders it.
3. Find every component that renders auth-gated CTAs. Grep for these strings 
   across `client/src/`:
   - "Sign Up", "Signup", "Sign up"
   - "Get Started", "Get started"  
   - "Login", "Log In", "Sign In"
   - "Register", "Create Account"
   - `/signup`, `/register`, `/login` (as Link `to=` or href)
4. For each match, record: file path, line number, the surrounding component, 
   and whether the component currently reads `useAuth()` / auth context.

Output a markdown table of findings before doing anything else. Wait for me to 
confirm before proceeding.

## Phase 2 — Classify each finding

For every CTA found, classify as:
- **BUG**: shown to logged-in users when it shouldn't be (footer "Get Started", 
  hero "Sign Up Now" on dashboard, etc.)
- **CORRECT**: only renders on public/guest pages, or already gated on `!user`
- **AMBIGUOUS**: needs my decision (e.g. marketing page reachable while logged in)

For each BUG, propose the fix as a diff. Do NOT apply yet. Standard fix pattern:

```jsx
const { user } = useAuth();
// ...
{!user && (
  <Link to="/signup" className="...">Get Started</Link>
)}
{user && (
  <Link to={user.role === 'organizer' ? '/organizer/dashboard' : '/worker/dashboard'}>
    Go to Dashboard
  </Link>
)}
```

## Phase 3 — Broader functional audit

While you're in there, also check and report (don't fix yet):

1. **Dead links**: every `<Link to="...">` and `<a href="...">` — does the route 
   exist in the router? Does the API endpoint exist in `server/routes/`?
2. **Role leaks**: any organizer-only page reachable by workers, or vice versa. 
   Check both the route guard AND the navbar/menu links.
3. **Broken buttons**: `onClick` handlers that call undefined functions, or 
   buttons with no handler at all.
4. **Form submissions**: every form — does its submit handler call the right API 
   endpoint with the right method? Are errors displayed to the user?
5. **Socket.IO**: is the socket connection gated on auth? Does it disconnect on 
   logout? Are listeners cleaned up in `useEffect` returns?
6. **Loading states**: pages that render before `AuthContext` finishes loading 
   user — do they flash guest UI? (This is often the real cause of "shows signup 
   after login".)
7. **Protected routes**: every route that should require auth — is it actually 
   wrapped in a `<ProtectedRoute>` or equivalent?
8. **Logout**: does logout clear the JWT from localStorage AND reset auth context 
   AND disconnect the socket AND redirect?

Report findings as a categorized list with severity (high/medium/low).

## Phase 4 — Fix in batches

Once I approve the report:
- Fix BUGs in Phase 2 first, one component per commit-sized batch
- Then high-severity items from Phase 3
- After each batch, run `npm run build` in `client/` and `npm run lint` if 
  configured. Report any errors.
- Run the dev server briefly to confirm no console errors on startup.

## Rules

- Never edit `.env`, `node_modules/`, or anything in `server/config/db.js` 
  connection strings.
- Don't refactor unrelated code. Minimal diffs only.
- If you're unsure whether something is a bug, ask me.
- Show me the diff for each file before saving it.