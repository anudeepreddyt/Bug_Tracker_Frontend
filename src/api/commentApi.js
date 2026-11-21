import api from './axios';

/**
 * Backend CommentController endpoints:
 * - POST   /api/addcomment?projectId=...&issueId=...
 *          Body: AddCommentDTO { comment }
 *          Returns: DisplayCommentDTO { commentId, projectId, projectName, issueId, issueTitle, issueDescription, comment }
 * - GET    /api/projectcomments?projectId=...
 *          Returns: List<DisplayCommentDTO>
 * - GET    /api/getallcomments
 *          Returns: List<DisplayCommentDTO>
 * - PATCH  /api/editcomment?commentId=...&newComment=...
 *          Returns: DisplayCommentDTO
 * - DELETE /api/deletecomment?commentId=...
 *          Returns: String
 */
export const commentApi = {
  addComment: async ({ projectId, issueId, comment }) => {
    const response = await api.post(
      '/addcomment',
      { comment },
      {
        params: {
          projectId: Number(projectId),
          issueId: Number(issueId),
        },
      }
    );
    return response.data;
  },

  getProjectComments: async (projectId) => {
    const response = await api.get('/projectcomments', {
      params: { projectId: Number(projectId) },
    });
    return Array.isArray(response.data) ? response.data : [];
  },

  getAllComments: async () => {
    const response = await api.get('/getallcomments');
    return Array.isArray(response.data) ? response.data : [];
  },

  editComment: async (commentId, newComment) => {
    const response = await api.patch('/editcomment', null, {
      params: {
        commentId: Number(commentId),
        newComment,
      },
    });
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete('/deletecomment', {
      params: { commentId: Number(commentId) },
    });
    return response.data;
  },
};
