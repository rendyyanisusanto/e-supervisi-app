export class NotificationMapper {
  static toFrontend(apiNotif: any) {
    if (!apiNotif) return {} as any;
    return {
      id: String(apiNotif.id),
      userId: apiNotif.user_id ? String(apiNotif.user_id) : undefined,
      title: apiNotif.title,
      message: apiNotif.message,
      type: apiNotif.type,
      isRead: apiNotif.is_read,
      link: apiNotif.link,
      createdAt: apiNotif.created_at,
    };
  }
}
