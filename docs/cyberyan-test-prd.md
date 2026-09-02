# Product Requirements Document (PRD)
**Project:** LinkedIn Profile Search Application
**Context:** Technical Assessment - Full Stack Specialist

## 1. Project Overview
The objective is to build a lightweight, highly responsive web application that allows users to search and filter a provided dataset of approximately 300 LinkedIn professional profiles. The project strictly prioritizes robust backend architecture, efficient search logic, and seamless client-server communication over complex graphical UI design.

## 2. Target Audience
Evaluation committee reviewing the technical assessment. The application must be extremely easy to set up, run, and evaluate.

## 3. Core Features

### 3.1. Global Search
*   **Description:** A single text input allowing users to search across professional profiles using keywords.
*   **Targeted Fields:** The search must query at minimum the candidate's `fullName`, `summary`, and `skills` array.
*   **Behavior:** The search should support partial matches and be case-insensitive. 

### 3.2. Faceted Filtering
*   **Description:** Users must be able to narrow down search results using at least two specific attributes.
*   **Filter 1: Industry:** A dropdown or multi-select component populated by unique industries found in the dataset.
*   **Filter 2: Job Title:** A dropdown or multi-select component populated by unique job titles.
*   **Behavior:** Filters must act conjunctively (AND logic). Selecting an industry and a job title should return profiles matching *both*.

### 3.3. Results Display
*   **Description:** A clear, list-based presentation of the matching profiles.
*   **Displayed Data:** Each result card/row should display essential information: Name, Job Title, Company, Industry, and a truncated Summary.
*   **Feedback:** The UI must display loading states during data fetching and an empty state if no profiles match the criteria.

## 4. Non-Functional Requirements
*   **Simplicity & Readability:** Code must be clean, modular, and easy to follow.
*   **Performance:** Search and filtering operations must be optimized for speed, leveraging database indexing rather than in-memory client-side filtering.
*   **Reproducibility:** The application must be fully containerized. Reviewers should only need to run a single command (e.g., `docker-compose up`) to start the database, backend, and frontend.

## 5. Out of Scope
*   Advanced graphical UI elements or complex animations.
*   User authentication or authorization.
*   Profile creation, updating, or deletion (CRUD operations beyond Read).