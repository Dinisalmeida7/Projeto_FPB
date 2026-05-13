# Projeto_FPB
# Sports Management Platform — Analysis & Design

> End-to-end software engineering analysis and design of a web platform for managing 
> sports federation data, from requirements gathering through to a functional backend 
> proof-of-concept.

---

## About This Project

This repository documents the complete analysis and design of a web platform for 
managing sports information in the context of a national basketball federation. The 
goal was to apply rigorous software engineering methodology to produce a 
production-ready specification — covering requirements, architecture, data modelling, 
and API design — backed by a working backend implementation.

The platform replaces a fragmented, outdated public portal with a structured system 
featuring a public-facing area for visitors and a role-based administration panel.

---

## What This Project Demonstrates

- **Requirements engineering** — functional and non-functional requirements elicited 
  from domain analysis, organised into use case specifications with actors, 
  pre/post-conditions, and alternative flows
- **System architecture** — layered architecture with MVC and REST API, documented with 
  component responsibilities, communication protocols, and technology justification
- **Relational data modelling** — entity-relationship model normalised to 3NF, covering 
  complex domain patterns such as multi-role persons, dynamic aggregate computation, 
  and generalisation/specialisation
- **API specification** — complete REST API with request/response schemas, HTTP status 
  codes, authentication flow, and permission validation logic
- **Backend implementation** — Node.js + Express proof-of-concept following a 
  Controller → Service → Repository pattern with JWT authentication

---

## System Overview

The platform is divided into two areas:

**Public portal** — accessible without authentication  
Clubs, competitions, games, standings, member profiles (athletes, referees, coaches), 
document downloads, and global search.

**Administration panel** — JWT-authenticated  
Full CRUD across all entities, granular per-area permissions per administrator account, 
and an immutable audit log of all administrative actions.

---

## Technical Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | React | Component-based UI; shared by public portal and admin panel |
| Backend | Node.js + Express | Lightweight REST API; consistent JS across the stack |
| Database | MySQL | Relational model suits structured, predictable domain data |
| Authentication | JWT | Stateless auth; per-request permission validation against DB |
| File storage | Local file system | Sufficient for proof-of-concept scope |
| Protocol | HTTPS + JSON | Secure communication; standard REST convention |

---

## Data Model Highlights

- **Multi-role persons** — a single `Person` entity links to independent `Athlete`, 
  `Referee`, `Coach`, and `FPBMember` tables via 1:1 relations; a person can hold any 
  combination of roles simultaneously
- **Dynamic aggregates** — competition standings and athlete season averages are 
  computed at query time from raw game data, avoiding stored redundancy
- **Team entity** — supports multiple squads per club, district selection teams, and 
  athletes competing across several teams
- **Granular permissions** — one `Permission` row per administrator per functional area, 
  with independent `can_create`, `can_edit`, `can_delete` flags
- **3NF compliance** — model verified through 1NF, 2NF, and 3NF; no transitive 
  dependencies or partial key dependencies

---

## API Design

- Base URL: `/api/v1`
- Auth: `Authorization: Bearer <token>` on all administrative endpoints
- Pagination on high-volume resources (`games`, `members`)
- Configurable sorting on all listing endpoints
- Consistent error envelope: `{ "error": "...", "message": "...", "code": ... }`

**Modules:** `auth` · `clubs` · `competitions` · `games` · `members` · `documents` · 
`search` · `administrators`

Full request/response schemas, status codes, and permission validation logic are 
documented in [`T5_API_Specification.md`](./docs/T5_API_Specification.md).

---

## Repository Structure
FPB Project Report
fpb-backend/
├── api/
│   ├── routes/
│   └── middleware/
├── modules/
│   ├── auth/
│   ├── clubs/
│   ├── competitions/
│   ├── games/
│   ├── members/
│   └── documents/
├── infrastructure/
│   ├── database/
│   └── storage/
└── shared/
├── models/
├── validators/
└── utils/

---

## Project Status

| Phase | Status |
|---|---|
| Requirements Analysis | ✅ Complete |
| Architecture Design | ✅ Complete |
| Data Modelling | ✅ Complete |
| API Specification | ✅ Complete |
| Backend Implementation | 🔄 In progress |
| Final Documentation | ⏳ Pending |

---

## Academic Context

Developed as the capstone project for the **Software Engineering Lab** course  
(*Laboratório de Projeto em Engenharia Informática*) at **UTAD**, 2025/2026.

**Author:** Dinis Almeida  
**Supervisor:** António Jorge Gonçalves De Gouveia
