import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { projectApi } from '../api/projectApi';
import { issueApi } from '../api/issueApi';
import { commentApi } from '../api/commentApi';
import { projectMemberApi } from '../api/projectMemberApi';
import { STORAGE_KEYS } from '../utils/constants';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext(null);

function readJsonStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function WorkspaceProvider({ children }) {
  const { isAuthenticated, user } = useAuth();

  const [knownProjectIds, setKnownProjectIds] = useState(() =>
    readJsonStorage(STORAGE_KEYS.KNOWN_PROJECT_IDS, [])
  );
  const [projects, setProjects] = useState([]);
  const [issuesByProject, setIssuesByProject] = useState({});
  const [membersByProject, setMembersByProject] = useState(() =>
    readJsonStorage(STORAGE_KEYS.PROJECT_MEMBERS_CACHE, {})
  );
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const [workspaceError, setWorkspaceError] = useState(null);

  const persistKnownProjectIds = useCallback((ids) => {
    const unique = Array.from(
      new Set(ids.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0))
    ).sort((a, b) => a - b);
    setKnownProjectIds(unique);
    localStorage.setItem(STORAGE_KEYS.KNOWN_PROJECT_IDS, JSON.stringify(unique));
    return unique;
  }, []);

  const persistMembersCache = useCallback((updater) => {
    setMembersByProject((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      localStorage.setItem(STORAGE_KEYS.PROJECT_MEMBERS_CACHE, JSON.stringify(next));
      return next;
    });
  }, []);

  /**
   * Synchronize projects, issues, and discovered users from backend endpoints.
   * Since backend has GET /api/getprojectbyid, GET /api/getprojectissue, and GET /api/getallcomments
   * (but lacks GET /api/getallprojects or GET /api/getallusers), we discover project IDs from
   * local registry + /api/getallcomments, and harvest user IDs & names from issues + members.
   */
  const syncWorkspace = useCallback(async () => {
    if (!isAuthenticated) {
      setProjects([]);
      setIssuesByProject({});
      return;
    }

    setLoadingWorkspace(true);
    setWorkspaceError(null);

    try {
      // 1. Discover any project IDs referenced in comments
      let discoveredIds = [...readJsonStorage(STORAGE_KEYS.KNOWN_PROJECT_IDS, [])];
      try {
        const allComments = await commentApi.getAllComments();
        allComments.forEach((c) => {
          if (c.projectId && !discoveredIds.includes(Number(c.projectId))) {
            discoveredIds.push(Number(c.projectId));
          }
        });
      } catch {
        // Ignore if comments endpoint fails or is empty
      }

      const cleanIds = persistKnownProjectIds(discoveredIds);

      // 2. Fetch details for all known projects
      const fetchedProjects = [];
      const validIds = [];

      await Promise.all(
        cleanIds.map(async (pid) => {
          try {
            const proj = await projectApi.getProjectById(pid);
            if (proj && proj.projectId) {
              fetchedProjects.push(proj);
              validIds.push(proj.projectId);
            }
          } catch {
            // Project may have been deleted on backend
          }
        })
      );

      if (validIds.length !== cleanIds.length) {
        persistKnownProjectIds(validIds);
      }

      fetchedProjects.sort((a, b) => a.projectId - b.projectId);
      setProjects(fetchedProjects);

      // 3. Fetch issues for each valid project
      const issuesMap = {};
      await Promise.all(
        fetchedProjects.map(async (proj) => {
          try {
            const projIssues = await issueApi.getProjectIssues(proj.projectId);
            issuesMap[proj.projectId] = projIssues.map((iss) => ({
              ...iss,
              projectId: proj.projectId,
              projectName: proj.projectName,
            }));
          } catch {
            issuesMap[proj.projectId] = [];
          }
        })
      );

      setIssuesByProject(issuesMap);
    } catch (err) {
      setWorkspaceError(err.message || 'Failed to synchronize workspace data.');
    } finally {
      setLoadingWorkspace(false);
    }
  }, [isAuthenticated, persistKnownProjectIds]);

  useEffect(() => {
    if (isAuthenticated) {
      syncWorkspace();
    } else {
      setProjects([]);
      setIssuesByProject({});
    }
  }, [isAuthenticated, syncWorkspace]);

  const registerProjectInWorkspace = useCallback(
    async (projectDto) => {
      if (!projectDto?.projectId) return;
      persistKnownProjectIds([...knownProjectIds, projectDto.projectId]);
      setProjects((prev) => {
        const exists = prev.some((p) => p.projectId === projectDto.projectId);
        if (exists) {
          return prev.map((p) =>
            p.projectId === projectDto.projectId ? projectDto : p
          );
        }
        return [...prev, projectDto].sort((a, b) => a.projectId - b.projectId);
      });
      const projIssues = await issueApi.getProjectIssues(projectDto.projectId);
      setIssuesByProject((prev) => ({
        ...prev,
        [projectDto.projectId]: projIssues.map((iss) => ({
          ...iss,
          projectId: projectDto.projectId,
          projectName: projectDto.projectName,
        })),
      }));
    },
    [knownProjectIds, persistKnownProjectIds]
  );



  const createProject = async ({ projectName, description }) => {
    const created = await projectApi.createProject({
      projectName,
      description,
      createdBy: user?.username || '',
    });
    await registerProjectInWorkspace(created);
    return created;
  };

  const lookupAndImportProject = async ({ id, projectName }) => {
    const found = id
      ? await projectApi.getProjectById(Number(id))
      : await projectApi.getProjectByName(projectName.trim());
    await registerProjectInWorkspace(found);
    return found;
  };

  const deleteProject = async (projectId) => {
    const res = await projectApi.deleteProject(projectId);
    const nextIds = knownProjectIds.filter((id) => Number(id) !== Number(projectId));
    persistKnownProjectIds(nextIds);
    setProjects((prev) => prev.filter((p) => Number(p.projectId) !== Number(projectId)));
    setIssuesByProject((prev) => {
      const copy = { ...prev };
      delete copy[projectId];
      return copy;
    });
    persistMembersCache((prev) => {
      const copy = { ...prev };
      delete copy[projectId];
      return copy;
    });
    return res;
  };

  const addProjectMember = async ({ projectId, userId, projectRole }) => {
    const dto = await projectMemberApi.addProjectMember({
      projectId,
      userId,
      projectRole,
    });
    persistMembersCache((prev) => {
      const existing = prev[projectId] || [];
      const filtered = existing.filter((m) => Number(m.userId) !== Number(dto.userId));
      return {
        ...prev,
        [projectId]: [...filtered, dto],
      };
    });
    return dto;
  };

  const removeProjectMember = async ({ projectId, userId }) => {
    const res = await projectMemberApi.deleteProjectMember({ projectId, userId });
    persistMembersCache((prev) => {
      const existing = prev[projectId] || [];
      return {
        ...prev,
        [projectId]: existing.filter((m) => Number(m.userId) !== Number(userId)),
      };
    });
    return res;
  };

  const refreshProjectIssues = useCallback(
    async (projectId) => {
      const proj = projects.find((p) => Number(p.projectId) === Number(projectId));
      const projIssues = await issueApi.getProjectIssues(projectId);
      const enriched = projIssues.map((iss) => ({
        ...iss,
        projectId: Number(projectId),
        projectName: proj?.projectName || `Project #${projectId}`,
      }));
      setIssuesByProject((prev) => ({
        ...prev,
        [projectId]: enriched,
      }));
      return enriched;
    },
    [projects]
  );

  // Optimistic status update for Kanban drag & drop
  const updateIssueStatusOptimistic = async (projectId, issueId, newStatus) => {
    const currentList = issuesByProject[projectId] || [];
    const target = currentList.find((i) => Number(i.issueId) === Number(issueId));
    if (!target || target.issueStatus === newStatus) return;

    const previousSnapshot = [...currentList];

    // 1. Immediately update UI
    setIssuesByProject((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map((item) =>
        Number(item.issueId) === Number(issueId)
          ? { ...item, issueStatus: newStatus }
          : item
      ),
    }));

    try {
      // 2. Persist to backend
      await issueApi.changeStatus(issueId, newStatus);
    } catch (err) {
      // 3. Rollback on error
      setIssuesByProject((prev) => ({
        ...prev,
        [projectId]: previousSnapshot,
      }));
      throw err;
    }
  };

  const allIssues = useMemo(() => {
    return Object.values(issuesByProject).flat();
  }, [issuesByProject]);

  // Known directory of users derived from issues & project members (since backend has no GET /users endpoint)
  // Known directory of users derived from current user, issues & project members
  const knownUsers = useMemo(() => {
    const map = new Map();

    if (user?.userId && user?.username) {
      map.set(Number(user.userId), {
        userId: Number(user.userId),
        userName: user.username,
      });
    }

    allIssues.forEach((iss) => {
      if (iss.reporterId && iss.reporterName) {
        map.set(Number(iss.reporterId), {
          userId: Number(iss.reporterId),
          userName: iss.reporterName,
        });
      }
      if (iss.assigneeId && iss.assigneeName) {
        map.set(Number(iss.assigneeId), {
          userId: Number(iss.assigneeId),
          userName: iss.assigneeName,
        });
      }
    });

    Object.values(membersByProject)
        .flat()
        .forEach((m) => {
          if (m.userId && m.userName) {
            map.set(Number(m.userId), {
              userId: Number(m.userId),
              userName: m.userName,
            });
          }
        });

    return Array.from(map.values()).sort((a, b) => a.userId - b.userId);
  }, [user, allIssues, membersByProject]);

  // Read current user's numeric ID directly from GET /api/getuser
  const currentUserId = useMemo(() => {
    if (user?.userId) return Number(user.userId);
    if (!user?.username) return null;
    const match = knownUsers.find(
        (u) => u.userName.toLowerCase() === user.username.toLowerCase()
    );
    return match ? match.userId : null;
  }, [user, knownUsers]);

  const value = {
    projects,
    issuesByProject,
    allIssues,
    membersByProject,
    knownUsers,
    currentUserId,
    loadingWorkspace,
    workspaceError,
    syncWorkspace,
    createProject,
    lookupAndImportProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
    refreshProjectIssues,
    updateIssueStatusOptimistic,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
