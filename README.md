# Milestone Report – M1 (Build + Test)

**Team:** Group 5  
**Date:** July 13, 2025

---

## Contribution of Each Team Member

All members of our team remained actively engaged throughout the milestone. While we initially divided the work based on areas of responsibility, from a certain point — especially after facing severe infrastructure issues — we shifted to working collaboratively. Everyone contributed to debugging, testing, and reconfiguring the pipeline on different servers.

| Team Member | Responsibility | Contribution Summary                                                                                                                                           |
|-------------|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Karmel**  | `pipeline init` – Provision & infrastructure setup | Set up initial provisioning logic and environment configuration. Later collaborated with others to experiment with various servers and SSH access issues.      |
| **Parna**   | `pipeline build` – Build system execution logic | Built the structure of the `build` command. Towards the end, made screen cast, tested builds on stronger machines and helped refine setup logic.               |
| **Nura**  | Authoring `build.yml` for Ghost | Wrote the first version of `build.yml` and handled environment research. Also wrote reports. Contributed significantly to testing and debugging with the team. |

> **Note:** After encountering major technical blockers, most tasks became team efforts, with everyone contributing to testing and problem-solving instead of following strict individual assignments.

---

## Tasks Completed

- `.env` file setup and multiple server provision attempts
- Cloning and testing the Ghost project on multiple servers
- Writing and refining the `build.yml` file
- Creating GitHub tasks and keeping track of progress
- Extensive team calls during the final days to troubleshoot issues
- Identifying system requirement limitations and researching alternatives
- Preparing this README milestone report

> **From the second week onward**, many tasks became shared efforts as we worked together to test various configurations and resolve critical blockers.

---

## Challenges Faced

### 1. Unstable ArvanCloud Infrastructure
The biggest blocker was the ArvanCloud environment, where network reliability was extremely poor. We frequently encountered:
- SSH timeouts and failed sessions
- Inability to clone repositories
- Long provisioning delays

Sometimes, we couldn’t even connect to the machine after provisioning, making progress nearly impossible for hours at a time.

### 2. Ghost Installation Failures
Installing Ghost often caused the server to freeze or become unresponsive, even on Amazon server with 2 CPUs and 2 GB RAM. Crashes happened during `npm install` or `yarn build`.

### 3. High System Requirements
After investigation, we found that Ghost required more powerful servers (≥ 8 GB RAM & 4 CPUs) to run builds and tests reliably — far beyond what we had access to.

### 4. Inconsistent Errors
We encountered various package installation issues, out-of-memory crashes, and failed test runs — often with no clear error messages. This required repeated trial and error across multiple setups.

---

## What We Learned

- Real-world CI/CD systems depend heavily on infrastructure quality
- Even open-source projects like Ghost may require high system specs for local building and testing
- Debugging distributed systems takes coordinated teamwork and persistence
- Designing flexible build scripts means anticipating failure and variance in server behavior

---

## Final Status

Although we could not complete a full `pipeline build` run with all tests due to infrastructure limitations, we:
- Implemented major components of the pipeline system
- Prepared a functional and reusable `build.yml` for Ghost
- Successfully reached the build phase on one of the test servers
- Maintained collaboration and steady progress despite blockers

> We initially tried using the official commands specified in the assignment:
>
> ```bash
> npm install
> node index init -b build.yml
> node index build -b build.yml -j build
> ```
> However, due to persistent errors and environment limitations, we also tested with alternate formats like:
>
> ```bash
> pipeline build --build build.yml --job build
> ```
> to bypass potential CLI parsing issues and continue debugging across systems.

We believe the work we’ve done lays a solid foundation for the next milestone.

---
## Screencast 

[Part 1](https://drive.google.com/file/d/1ZiSTY06vbzUw4oT3rNDetUmI65jcdybi/view)

[Part 2](https://drive.google.com/file/d/1AemQ_vgvTtBeCF6zNrgiRgYhyx8bvLiU/view)

---

# Milestone Report – M2 (Deployment)

**Team:** Group 5  
**Date:** August 10, 2025

---

## Contribution of Each Team Member

All members of the team were actively engaged throughout the milestone. While each person had a primary area of focus, everyone contributed to other tasks when needed — from planning, debugging, and testing, to final deployment verification.

| Team Member | Responsibility                                       | Contribution Summary                                                                                                                                                                            |
|-------------|------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Karmel**  | Docker migration, inventory setup, screencast        | Led the removal of ArvanCloud and migration to Docker-based infrastructure. Created the new inventory system for Docker containers, tested the environment, and prepared the final screencast.  |
| **Parna**   | Ghost deploy job, blue-green setup + persistent data | Implemented the full `deploy` job using the blue-green directive. Set up Ghost v4 (blue) and Ghost v5 (green) containers with proper healthchecks and proxy routing. Tested failover scenarios. |
| **Nura**    | Lifecycle directive, Update build.yml, reporting     | Implemented the `lifecycle` section logic. Contribute updating build.yml. Wrote checkpoint and milestone reports and assisted in testing and debugging.                                         |

---

## Tasks Completed

- Tagged repository with **M1**
- Removed all ArvanCloud dependencies
- Created `dockerExec` and `docker.js` to replace SSH and cloud provider logic
- Added **lifecycle** directive support in `build.yml`
- Implemented `deploy` job with blue-green directive
- Set up Ghost v4 (blue) and Ghost v5 (green) on separate ports
- Configured healthcheck for both instances
- Implemented proxy to route traffic between blue and green
- Added Docker volumes for persistent data
- Verified failover and automatic recovery between instances
- Recorded and prepared the final screencast

---

## Challenges Faced

1. **Provider Migration**  
   Completely replacing ArvanCloud with Docker required reworking infrastructure code, including execution and provisioning logic.

2. **Networking & Healthchecks**  
   Ensuring proper port mapping and reliable healthcheck results inside Docker networks was critical to making failover smooth.

3. **Failover Stability**  
   Making sure the proxy consistently switched between blue and green without downtime required repeated testing.

4. **Idempotency of Commands**  
   All blue-green deployment steps had to be re-runnable without breaking the environment.

---

## What We Learned

- Designing modular provider logic allows smoother infrastructure changes (SSH → Docker)
- Practical experience with **Blue-Green Deployment** and its benefits in zero-downtime releases
- How to implement and manage persistent data with Docker volumes
- The importance of automated failover testing before deploying in production

---

## Final Status

- The CLI app retains all M1 features and now fully supports Docker-based infrastructure and Blue-Green Deployment.
- The deployment strategy successfully runs Ghost v4 and v5 side-by-side with persistent data.
- Failover between instances is automatic and stable, with quick recovery when the primary instance returns.
- Project is ready for final presentation and demonstration.

---

## Screencast

[Part 1](https://drive.google.com/file/d/16o9UCkIkmBFUtL54RcoapRUIQitWRGhc/view?usp=sharing)

[Part 2](https://drive.google.com/file/d/1UY8zAvdyw1rpAgBf2UIPoa62atOihGET/view?usp=sharing)


---