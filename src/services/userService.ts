import api from '../lib/apiClient';
import type { 
  UpdateUserRequest, 
  RoleAssignmentRequest, 
  ResetPasswordRequest, 
  ChangePasswordRequest 
} from '../types/api';

export const userService = {
  getCurrentProfile() {
    return api.get('/api/v1/users/me');
  },
  getAllUsers() {
    return api.get('/api/v1/users');
  },
  getUserByUsername(username: string) {
    return api.get(`/api/v1/users/${encodeURIComponent(username)}`);
  },
  updateUser(username: string, payload: UpdateUserRequest) {
    return api.put(`/api/v1/users/${encodeURIComponent(username)}`, payload);
  },
  deleteUser(username: string) {
    return api.delete(`/api/v1/users/${encodeURIComponent(username)}`);
  },
  enableUser(username: string) {
    return api.post(`/api/v1/users/${encodeURIComponent(username)}/enable`);
  },
  disableUser(username: string) {
    return api.post(`/api/v1/users/${encodeURIComponent(username)}/disable`);
  },
  unlockUser(username: string) {
    return api.post(`/api/v1/users/${encodeURIComponent(username)}/unlock`);
  },
  manageUserRole(username: string, payload: RoleAssignmentRequest) {
    return api.post(`/api/v1/users/${encodeURIComponent(username)}/roles`, payload);
  },
  resetUserPassword(username: string, payload: ResetPasswordRequest) {
    return api.post(`/api/v1/users/${encodeURIComponent(username)}/reset-password`, payload);
  },
  changeCurrentUserPassword(payload: ChangePasswordRequest) {
    return api.post('/api/v1/users/me/change-password', payload);
  },
};

export default userService;
