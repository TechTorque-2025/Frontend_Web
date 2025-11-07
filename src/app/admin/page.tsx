"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import userService from "../../services/userService";
import authService from "../../services/authService";
import type { UserDto } from "../../types/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Failed to load users. You may not have admin privileges.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (username: string) => {
    try {
      setDeletingUser(username);
      setError(null);
      setSuccess(null);

      await userService.deleteUser(username);

      setSuccess(`User "${username}" has been deleted successfully.`);
      setDeleteConfirm(null);

      // Reload the user list
      await loadUsers();
    } catch (err: unknown) {
      console.error("Failed to delete user:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        (err instanceof Error
          ? err.message
          : `Failed to delete user \"${username}.\"`);
      setError(message);
    } finally {
      setDeletingUser(null);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push("/auth/login");
  };

  const getRoleBadgeColor = (roles: string[]) => {
    if (roles.includes("SUPER_ADMIN")) return "bg-red-100 text-red-800";
    if (roles.includes("ADMIN")) return "bg-orange-100 text-orange-800";
    if (roles.includes("EMPLOYEE")) return "bg-blue-100 text-blue-800";
    return "bg-green-100 text-green-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 theme-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="theme-text-muted">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 theme-bg-primary">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold theme-text-primary">
              Admin Dashboard
            </h1>
            <p className="text-lg theme-text-muted mt-2">User Management</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/profile")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              My Profile
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-600 dark:text-green-400">
              {success}
            </p>
          </div>
        )}

        <div className="automotive-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold theme-text-primary">
              All Users ({users.length})
            </h2>
            <button
              onClick={loadUsers}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="theme-text-muted">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b theme-border">
                    <th className="text-left py-3 px-4 theme-text-primary font-semibold">
                      Username
                    </th>
                    <th className="text-left py-3 px-4 theme-text-primary font-semibold">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 theme-text-primary font-semibold">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 theme-text-primary font-semibold">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 theme-text-primary font-semibold">
                      Joined
                    </th>
                    <th className="text-center py-3 px-4 theme-text-primary font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b theme-border hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-4 theme-text-primary font-medium">
                        {user.username}
                      </td>
                      <td className="py-3 px-4 theme-text-secondary">
                        {user.email}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            user.roles
                          )}`}
                        >
                          {user.roles.join(", ")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.enabled
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {user.enabled ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="py-3 px-4 theme-text-secondary text-sm">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setDeleteConfirm(user.username)}
                          disabled={deletingUser === user.username}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingUser === user.username
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="automotive-card p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold theme-text-primary mb-4">
                Confirm Deletion
              </h3>
              <p className="theme-text-secondary mb-6">
                Are you sure you want to delete user{" "}
                <strong>&quot;{deleteConfirm}&quot;</strong>? This action cannot
                be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDeleteUser(deleteConfirm)}
                  disabled={deletingUser === deleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {deletingUser === deleteConfirm
                    ? "Deleting..."
                    : "Delete User"}
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
