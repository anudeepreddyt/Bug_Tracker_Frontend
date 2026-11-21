import api from './axios';

/**
 * Backend IssueController endpoints:
 * - POST   /api/createissue?status=TODO&priority=MEDIUM
 *          Body: CreateIssueDTO { projectId, userId, issueTitle, issueDescription, assigneeId }
 *          Returns: DisplayIssuseDTO
 * - PUT    /api/changeissue?status=...&priority=...
 *          Body: ChangeIssueDTO { issueId, issueTitle, issueDescription, assigneeId }
 *          Returns: DisplayIssuseDTO
 * - PATCH  /api/changestatus?issueId=...&status=...
 *          Returns: String
 * - PATCH  /api/changepriority?issueId=...&priority=...
 *          Returns: String
 * - DELETE /api/deleteissue?issueId=...
 *          Returns: String
 * - GET    /api/getprojectissue?projectId=...
 *          Returns: List<ProjectIssueDTO>
 */
export const issueApi = {
  createIssue: async ({
    projectId,
    userId,
    issueTitle,
    issueDescription,
    assigneeId,
    status = 'TODO',
    priority = 'MEDIUM',
  }) => {
    const payload = {
      projectId: Number(projectId),
      userId: Number(userId),
      issueTitle,
      issueDescription,
      assigneeId: Number(assigneeId),
    };
    const response = await api.post('/createissue', payload, {
      params: { status, priority },
    });
    return response.data;
  },

  updateIssue: async ({
    issueId,
    issueTitle,
    issueDescription,
    assigneeId,
    status,
    priority,
  }) => {
    const payload = {
      issueId: Number(issueId),
      issueTitle,
      issueDescription,
      assigneeId: assigneeId !== null && assigneeId !== '' ? Number(assigneeId) : null,
    };
    const params = {};
    if (status) params.status = status;
    if (priority) params.priority = priority;

    const response = await api.put('/changeissue', payload, { params });
    return response.data;
  },

  changeStatus: async (issueId, status) => {
    const response = await api.patch('/changestatus', null, {
      params: { issueId: Number(issueId), status },
    });
    return response.data;
  },

  changePriority: async (issueId, priority) => {
    const response = await api.patch('/changepriority', null, {
      params: { issueId: Number(issueId), priority },
    });
    return response.data;
  },

  deleteIssue: async (issueId) => {
    const response = await api.delete('/deleteissue', {
      params: { issueId: Number(issueId) },
    });
    return response.data;
  },

  getProjectIssues: async (projectId) => {
    const response = await api.get('/getprojectissue', {
      params: { projectId: Number(projectId) },
    });
    return Array.isArray(response.data) ? response.data : [];
  },
};
