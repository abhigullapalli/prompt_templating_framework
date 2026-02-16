# Audit Management Application (POC)

React + TypeScript proof-of-concept for an Audit Management Application using browser localStorage as the persistence layer.

## Implemented highlights
- Role-based UI (Admin, User, Reviewer test users)
- Audit listing, assignment, execution, scoring, and status updates
- Rebuttal and secondary audit workflows
- In-app notifications
- Local persistence abstraction (`src/services/storage.ts`)
- Explicit Phase 2 integration stubs (Azure AD, email, SQL repository)

## Run
```bash
npm install
npm run dev
```

Open `http://localhost:5173`.
