import api from '../lib/apiClient';
import type { 
  UpdateUserRequest, 
  RoleAssignmentRequest, 
  ResetPasswordRequest, 
  ChangePasswordRequest 
} from '../types/api';

export const userService = {
  getCurrentProfile() {
    // Correct Path: /users/me
    return api.get('/users/me');
  },
  getAllUsers() {
    // Correct Path: /users
    return api.get('/users');
  },
  getUserByUsername(username: string) {
    // Correct Path: /users/{username}
    return api.get(`/users/${encodeURIComponent(username)}`);
  },
  updateUser(username: string, payload: UpdateUserRequest) {
    return api.put(`/users/${encodeURIComponent(username)}`, payload);
  },
  deleteUser(username: string) {
    return api.delete(`/users/${encodeURIComponent(username)}`);
  },
  enableUser(username: string) {
    return api.post(`/users/${encodeURIComponent(username)}/enable`);
  },
  disableUser(username: string) {
    return api.post(`/users/${encodeURIComponent(username)}/disable`);
  },
  unlockUser(username: string) {
    return api.post(`/users/${encodeURIComponent(username)}/unlock`);
  },
  manageUserRole(username: string, payload: RoleAssignmentRequest) {
    return api.post(`/users/${encodeURIComponent(username)}/roles`, payload);
  },
  resetUserPassword(username: string, payload: ResetPasswordRequest) {
    return api.post(`/users/${encodeURIComponent(username)}/reset-password`, payload);
  },
  changeCurrentUserPassword(payload: ChangePasswordRequest) {
    // Correct Path: /users/me/change-password
    return api.post('/users/me/change-password', payload);
  },
};

export default userService;
