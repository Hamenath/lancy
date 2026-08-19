import { apiFetch } from "./apiConfig";

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
  readAt?: string | null;
  createdAt: string;
}

export const notificationService = {
  async getMyNotifications(): Promise<AppNotification[]> {
    const res = await apiFetch<AppNotification[]>('/notifications');
    return res || [];
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiFetch<{ count: number }>('/notifications/unread-count');
    return res?.count || 0;
  },

  async markAsRead(id: string): Promise<AppNotification | null> {
    return apiFetch<AppNotification>(`/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  async markAllAsRead(): Promise<void> {
    await apiFetch('/notifications/read-all', {
      method: 'POST',
    });
  },
};
