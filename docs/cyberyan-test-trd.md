# Technical Requirements Document (TRD)
**Project:** LinkedIn Profile Search Application
**Architecture:** Turborepo Monorepo (Client, API, Database)

## 1. Technology Stack
*   **Monorepo Tooling:** Turborepo (for shared configurations and types)
*   **Frontend:** React (Vite), TypeScript, Tailwind CSS, Shadcn UI, TanStack Query (React Query), Axios
*   **Backend:** NestJS, TypeScript, REST API
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **Infrastructure:** Docker, Docker Compose

## 2. Database Schema (Prisma)
The raw CSV data will be normalized into a single `Profile` model to optimize search performance. 

```prisma
model Profile {
  id               String   @id @default(uuid())
  linkedinId       String?  @unique
  fullName         String
  firstName        String?
  lastName         String?
  industry         String?
  jobTitle         String?
  jobCompanyName   String?
  locationName     String?
  summary          String?
  skills           Json?    // Stored as JSONB
  interests        Json?    // Stored as JSONB

  // Indexes for search optimization
  @@index([jobTitle])
  @@index([industry])
}