# Backend API Integration & Audit Report

This frontend was built by inspecting every Controller, DTO, Entity, Mapper, Security configuration, and Exception handler in `com.anudeepreddy.Bug_Tracker`.

## 1. Exact Endpoint Mapping

### UserController (`/api`)
| Method | Endpoint | Query Params | JSON Body | Response |
|---|---|---|---|---|
| `GET` | `/api/healthcheck` | — | — | `"Servers Up..."` |
| `POST` | `/api/signup` | `role=USER` | `{ username, password, email }` | `String` |
| `POST` | `/api/signin` | — | `{ username, password }` | Raw JWT `String` |
| `GET` | `/api/getuser` | — | — | `GetUserDTO` |
| `PATCH` | `/api/updatepassword` | `newPassword` | — | `String` |
| `PUT` | `/api/updatedetails` | `newUsername`, `newEmail`, `newPassword` (optional) | — | `String` |
| `DELETE` | `/api/deleteuser` | — | — | `String` |
| `DELETE` | `/api/signout` | — (Header: `Authorization`) | — | `String` |

### ProjectController (`/api`)
| Method | Endpoint | Query Params | JSON Body | Response |
|---|---|---|---|---|
| `POST` | `/api/createproject` | — | `{ projectName, createdBy, description }` | `DisplayProjectDTO` |
| `DELETE` | `/api/deleteproject` | `id` | — | `String` |
| `GET` | `/api/getprojectbyid` | `id` | — | `DisplayProjectDTO` |
| `GET` | `/api/getprojectbyname` | `projectName` | — | `DisplayProjectDTO` |

### ProjectMemController (`/api`)
| Method | Endpoint | Query Params | JSON Body | Response |
|---|---|---|---|---|
| `POST` | `/api/addprojectmem` | `projectRole` (`MANAGER` \| `DEVELOPER`) | `{ projectid, userid }` *(lowercase)* | `DisplayProjectMemDTO` |
| `DELETE` | `/api/deleteprojectmem` | — | `{ userId, projectId }` *(camelCase)* | `String` |

### IssueController (`/api`)
| Method | Endpoint | Query Params | JSON Body | Response |
|---|---|---|---|---|
| `POST` | `/api/createissue` | `status`, `priority` | `{ projectId, userId, issueTitle, issueDescription, assigneeId }` | `DisplayIssuseDTO` |
| `PUT` | `/api/changeissue` | `status`, `priority` | `{ issueId, issueTitle, issueDescription, assigneeId }` | `DisplayIssuseDTO` |
| `PATCH` | `/api/changestatus` | `issueId`, `status` | — | `String` |
| `PATCH` | `/api/changepriority` | `issueId`, `priority` | — | `String` |
| `DELETE` | `/api/deleteissue` | `issueId` | — | `String` |
| `GET` | `/api/getprojectissue` | `projectId` | — | `List<ProjectIssueDTO>` |

### CommentController (`/api`)
| Method | Endpoint | Query Params | JSON Body | Response |
|---|---|---|---|---|
| `POST` | `/api/addcomment` | `projectId`, `issueId` | `{ comment }` | `DisplayCommentDTO` |
| `GET` | `/api/projectcomments` | `projectId` | — | `List<DisplayCommentDTO>` |
| `GET` | `/api/getallcomments` | — | — | `List<DisplayCommentDTO>` |
| `PATCH` | `/api/editcomment` | `commentId`, `newComment` | — | `DisplayCommentDTO` |
| `DELETE` | `/api/deletecomment` | `commentId` | — | `String` |

---

## 2. Backend Bugs & Missing Endpoints Identified During Inspection

The frontend is already coded to remain compatible with your existing backend, but you should be aware of the following backend issues:

1. **Missing `@Transactional` on `IssueService.changeStatus()` and `IssueService.changePriority()` (CRITICAL):**
   - In `IssueService.java`, `changeStatus()` and `changePriority()` mutate `issueEntity` without `@Transactional` or `issueRepository.save(issueEntity)`. Because there is no open persistence transaction, JPA dirty checking will **not** flush the updated status/priority to PostgreSQL!
   - **Recommended Fix:** Add `@Transactional` (or `issueRepository.save(issueEntity);`) to both `changeStatus` and `changePriority` in `IssueService.java`.

2. **`CommentMapper.toDTO()` omits `commentId`:**
   - In `CommentMapper.java`, `displayCommentDTO.setCommentId(commentEntity.getId())` is missing, causing `GET /api/projectcomments` and `GET /api/getallcomments` to return `commentId: null`.
   - **Recommended Fix:** Add `displayCommentDTO.setCommentId(commentEntity.getId());` inside `CommentMapper.toDTO()`.

3. **Missing List Endpoints (`GET /api/getallprojects`, `GET /api/getallusers`, `GET /api/projectmembers`):**
   - Your backend currently only exposes single-project lookup (`getprojectbyid`, `getprojectbyname`), no user-directory endpoint (`GetUserDTO` also omits `userId`), and no endpoint to list existing members of a project.
   - **Frontend Compatibility Workaround:** The frontend persists created/loaded project IDs and added project members in `localStorage`, auto-discovers project IDs from `/api/getallcomments`, and provides a **"Load Project"** search bar on the Projects page to import existing projects by ID or name.

4. **`DisplayCommentDTO` has no `author` or `createdAt` fields:**
   - `CommentEntity` only stores `id`, `comment`, `issueEntity`, and `projectEntity`. Per your instructions, the frontend does not fabricate comment authors or timestamps.

5. **`GobalException` returns HTTP 200 OK for errors:**
   - Your `@ControllerAdvice` wraps `AlreadyExistException`, `UserNotFoundException`, and `CommonException` inside `ResponseEntity.ok(errorResponse)` with `status: 403` inside the JSON payload.
   - **Frontend Compatibility Workaround:** Our Axios response interceptor (`src/api/axios.js`) detects `{ message, status >= 400, localDateTime }` inside HTTP 200 responses and rejects the promise cleanly so toast notifications and Kanban rollbacks trigger accurately.

6. **`SecurityConfiguration` permits sensitive user endpoints publicly:**
   - `/api/getuser`, `/api/deleteuser`, `/api/updatepassword`, and `/api/updatedetails` are marked `.permitAll()` in `SecurityConfiguration.java`, yet `UserController` calls `authentication.getName()`, which will throw a `NullPointerException` if called without a JWT. Always send the `Authorization: Bearer <token>` header (which our Axios interceptor does automatically).
