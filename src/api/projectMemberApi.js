import api from './axios';

/**
 * Backend ProjectMemController endpoints:
 * - POST   /api/addprojectmem?projectRole=MANAGER|DEVELOPER
 *          Body: ProjectMemDTO { projectid, userid } (NOTE exact lowercase field names in Java DTO!)
 *          Returns: DisplayProjectMemDTO { userId, userName, projectId, projectName, joinedAt, projectRole }
 * - DELETE /api/deleteprojectmem
 *          Body: DeleteProjectMemDTO { userId, projectId } (NOTE camelCase field names in Java DTO!)
 *          Returns: String
 *
 * Note: Backend does not expose GET /api/getprojectmembers.
 * Added members are returned as DisplayProjectMemDTO and persisted per project in localStorage so teams stay visible.
 */
export const projectMemberApi = {
  addProjectMember: async ({ projectId, userId, projectRole }) => {
    const response = await api.post(
      '/addprojectmem',
      {
        projectid: Number(projectId),
        userid: Number(userId),
      },
      {
        params: { projectRole },
      }
    );
    return response.data;
  },

  deleteProjectMember: async ({ projectId, userId }) => {
    const response = await api.delete('/deleteprojectmem', {
      data: {
        userId: Number(userId),
        projectId: Number(projectId),
      },
    });
    return response.data;
  },
};
