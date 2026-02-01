# CHECKPOINT - M1

**Checkpoint Date:** `June 10, 2025`

**Team:** `Group 5  `

**Milestone:** `M1 – Build + Test`

---

## Contribution of Each Team Member

All team members have actively participated in team meetings to understand the project scope, discuss design decisions, and help identify and break down tasks. We’ve organized responsibilities so that our work progresses sequentially with minimal blockers between team members.

| Team Member | Responsibility | Contribution Summary                                                                                                                                                                                       |
|-------------|----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Karmel**  | Provision & infrastructure setup (`pipeline init`) | Focused on provisioning the server, configuring `.env`, and managing infrastructure tasks that serve as the base for the rest of the pipeline. Currently finalizing the inventory setup and SSH readiness. |
| **Parna**   | Build system execution logic (`pipeline build`) | Focused on preparing the handler structure for executing build jobs. Took the lead in organizing and assigning GitHub issues, and will begin core implementation once server setup is complete.            |
| **Nura**    | `build.yml` for Ghost | Focused on writing a `build.yml` to build and test the Ghost project. Has taken the responsibility on writing this checkpoint report and is preparing the environment and job setup configuration.          |

---

## Tasks Completed

- Set up `.env` and handled `DO_TOKEN`
- Provisioned a server
- Cloned the project
- Created and assigned GitHub tasks
- Participated in planning and structure discussions
- Created the Checkpoint Report
- Broke down core responsibilities into structured subtasks

---

## Tasks In Progress

- Finalizing `inventory.yml` and waiting for SSH availability (Karmel)
- Preparing to implement directive handlers and `pipeline build` logic (Parna)
- Researching Ghost setup requirements and environment structure (Nura)

---

## Tasks Remaining

### Karmel (Provision Server)
- Automate IP assignment into inventory
- Test the server using a dummy `build.yml`
- Prepare screencast and milestone report

### Parna (Build Command Logic)
- Implement core directive classes (`AptInstaller`, `CommandRunner`, `GitCloner`, `EnvManager`)
- Parse `build.yml`
- Execute setup and job steps via SSH using created classes
- Log outputs and handle error reporting

### Nura (`build.yml` for Ghost)
- Finalize research on Ghost's MySQL and Node.js requirements
- Define global environment variables
- Write setup steps (MySQL, Node, Ghost repo clone)
- Write job steps (install, build, test)
- Run and validate `pipeline build`

---

## Screenshot of GitHub Project Board
![board-1.PNG](screenshot-checkpoint-board%2Fboard-1.PNG)
![board-2.PNG](screenshot-checkpoint-board%2Fboard-2.PNG)
![board-3.PNG](screenshot-checkpoint-board%2Fboard-3.PNG)
---