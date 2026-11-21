import api from './axios';

/**
 * Backend UserController endpoints:
 * - GET    /api/healthcheck
 * - POST   /api/signup?role=USER  (Body: SignUpDTO { username, password, email }) -> String
 * - POST   /api/signin            (Body: SignInDTO { username, password }) -> String (raw JWT)
 * - GET    /api/getuser           (Authenticated) -> GetUserDTO { username, email, isActive, role, createdAt, updatedAt }
 * - PATCH  /api/updatepassword?newPassword=... -> String
 * - PUT    /api/updatedetails?newUsername=...&newEmail=...&newPassword=... -> String
 * - DELETE /api/deleteuser -> String
 * - DELETE /api/signout (Header: Authorization: Bearer <token>) -> String
 */
export const authApi = {
  healthCheck: async () => {
    const response = await api.get('/healthcheck');
    return response.data;
  },

  signOut: async () => {
    const response = await api.delete('/signout');
    return response.data;
  },

  signIn: async ({ username, password }) => {
    const response = await api.post('/signin', { username, password });
    // Backend returns raw JWT string directly
    return typeof response.data === 'string'
      ? response.data.trim()
      : response.data?.authToken || response.data?.token || '';
  },

  signUp: async ({ username, email, password }, role = 'USER') => {
    const response = await api.post(
      '/signup',
      { username, email, password },
      { params: { role } }
    );
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/getuser');
    return response.data;
  },

  updatePassword: async (newPassword) => {
    const response = await api.patch('/updatepassword', null, {
      params: { newPassword },
    });
    return response.data;
  },

  updateDetails: async ({ newUsername, newEmail, newPassword }) => {
    const params = {};
    if (newUsername && newUsername.trim()) params.newUsername = newUsername.trim();
    if (newEmail && newEmail.trim()) params.newEmail = newEmail.trim();
    if (newPassword && newPassword.trim()) params.newPassword = newPassword.trim();

    const response = await api.put('/updatedetails', null, { params });
    return response.data;
  },

  deleteUser: async () => {
    const response = await api.delete('/deleteuser');
    return response.data;
  },
};
