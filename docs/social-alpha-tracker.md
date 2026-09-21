# Social alpha tracker

Statuses: Backlog, Ready, In Progress, Blocked, Review, Done. Every item records
its milestone, dependencies, acceptance criterion and validation result here.

| ID         | Milestone | Status      | Depends on     | Acceptance criterion                              | Validation result                            |
| ---------- | --------- | ----------- | -------------- | ------------------------------------------------- | -------------------------------------------- |
| GG-001     | M0        | Done        | —              | User analytics work preserved                     | Baseline inspected; analytics files retained |
| GG-002     | M0        | Done        | GG-001         | Lifecycle, round, error, restart analytics tested | Existing focused tests pass                  |
| GG-003     | M0        | Done        | GG-001         | Five baseline commands recorded green             | 41 tests; all gates passed 2026-09-21        |
| GG-004–005 | M0        | Done        | —              | Tracker has workflow and required fields          | This document                                |
| GG-101     | M1        | Review      | GG-004         | Complete room flow specified                      | Flow in social-alpha-spec                    |
| GG-102     | M1        | Ready       | GG-101         | 8–10 consent-aware interviews completed           | Human work pending                           |
| GG-103–104 | M1        | Review      | GG-102         | Content bible and state copy approved             | Draft in social-alpha-spec                   |
| GG-105–106 | M1        | Ready       | GG-104         | States prototyped and tested with five people     | Human validation pending                     |
| GG-201–203 | M2        | Review      | GG-101         | Split routes, social CTA and guest nickname       | Implemented; validation pending              |
| GG-204     | M2        | In Progress | GG-203, GG-401 | Lobby/recovery states render                      | Waiting/join/invalid complete                |
| GG-205–206 | M2        | Review      | GG-203         | Sharing and privacy-safe OG metadata              | Implemented; device preview pending          |
| GG-207     | M2        | Review      | GG-201         | Practice remains offline                          | Existing PWA retained                        |
| GG-301–308 | M3        | Backlog     | M2             | Headless deterministic simulation                 | Not started                                  |
| GG-401–409 | M4        | Backlog     | GG-301         | Authenticated clients complete room lifecycle     | Not started                                  |
| GG-501–508 | M5        | Backlog     | M4             | Two devices complete and rematch                  | Not started                                  |
| GG-601–608 | M6        | Backlog     | GG-103, M5     | Authenticity review passes                        | Not started                                  |
| GG-701–708 | M7        | Backlog     | M5             | Private measurable accessible funnel              | Social funnel partial                        |
| GG-801–809 | M8        | Backlog     | M7             | Alpha gates and decision memo                     | Not started                                  |

Grouped rows must be split into individual delivery issues before that group
begins. No later task should be marked complete by implication.
