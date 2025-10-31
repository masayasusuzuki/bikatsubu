import { supabase } from '../src/lib/supabase';

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  operation_type: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  target_type: 'article' | 'page_section' | 'hero_slide';
  target_id: string;
  target_title: string;
  created_at: string;
}

export const activityLogService = {
  /**
   * アクティビティログを記録
   */
  async logActivity(params: {
    operationType: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
    targetType: 'article' | 'page_section' | 'hero_slide';
    targetId: string;
    targetTitle: string;
  }): Promise<void> {
    try {
      // 現在のセッションを取得
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No session found, skipping activity log');
        return;
      }

      // ユーザー情報を取得
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, email')
        .eq('id', session.user.id)
        .single();

      // アクティビティログを挿入
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: session.user.id,
          user_name: profile?.username || session.user.email?.split('@')[0] || 'Unknown',
          user_email: profile?.email || session.user.email || 'unknown@example.com',
          operation_type: params.operationType,
          target_type: params.targetType,
          target_id: params.targetId,
          target_title: params.targetTitle,
        });

      if (error) {
        console.error('Failed to log activity:', error);
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  },

  /**
   * アクティビティログを取得
   */
  async getActivityLogs(limit: number = 10, offset: number = 0): Promise<ActivityLog[]> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data as ActivityLog[];
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      return [];
    }
  },

  /**
   * 日時をフォーマット
   */
  formatActivityTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;

    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * 操作タイプを日本語に変換
   */
  getOperationTypeLabel(operationType: string): string {
    const labels: Record<string, string> = {
      create: '作成',
      update: '更新',
      delete: '削除',
      publish: '公開',
      unpublish: '非公開化'
    };
    return labels[operationType] || operationType;
  },

  /**
   * ターゲットタイプを日本語に変換
   */
  getTargetTypeLabel(targetType: string): string {
    const labels: Record<string, string> = {
      article: '記事',
      page_section: 'ページセクション',
      hero_slide: 'ヒーロースライド'
    };
    return labels[targetType] || targetType;
  }
};
