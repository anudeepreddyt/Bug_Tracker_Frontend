import api from './axios';

/**
 * Backend ProjectController endpoints:
 * - POST   /api/createproject              (Body: CreateProjectDTO { projectName, description, createdBy }) -> DisplayProjectDTO
 * - DELETE /api/deleteproject?id=...       -> String
 * - GET    /api/getprojectbyid?id=...      -> DisplayProjectDTO
 * - GET    /api/getprojectbyname?projectName=... -> DisplayProjectDTO
 *
 * Note: Backend does not yet expose GET /api/getallprojects.
 * We track known project IDs in localStorage and also discover project IDs from /api/getallcomments.
 */
export const projectApi = {
  createProject: async ({ projectName, description, createdBy = '' }) => {
    const response = await api.post('/createproject', {
      projectName,
      description,
      createdBy,
    });
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete('/deleteproject', {
      params: { id },
    });
    return response.data;
  },

  getProjectById: async (id) => {
    const response = await api.get('/getprojectbyid', {
      params: { id },
    });
    return response.data;
  },

  getProjectByName: async (projectName) => {
    const response = await api.get('/getprojectbyname', {
      params: { projectName },
    });
    return response.data;
  },
};
