import { supabase } from '../src/lib/supabase';

export interface LoginHistoryEntry {
  id: string;
  user_id: string;
  email: string;
  user_name: string;
  login_time: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

class LoginHistoryService {
  // Record a new login
  async recordLogin(userId: string, email: string): Promise<void> {
    try {
      // Get user's IP address and user agent
      const userAgent = navigator.userAgent;
      
      // Note: Getting real IP address requires server-side implementation
      // For now, we'll use a placeholder
      const ipAddress = 'Client IP'; // In production, get from server
      
      const { error } = await supabase
        .from('admin_login_history')
        .insert({
          user_id: userId,
          email: email,
          ip_address: ipAddress,
          user_agent: userAgent
        });

      if (error) {
        console.error('ログイン履歴の記録に失敗:', error);
      }
    } catch (error) {
      console.error('ログイン履歴サービスエラー:', error);
    }
  }

  // Get login history with pagination
  async getLoginHistory(limit: number = 50, offset: number = 0): Promise<LoginHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('admin_login_history')
        .select('*')
        .order('login_time', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('ログイン履歴の取得に失敗:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('ログイン履歴取得エラー:', error);
      return [];
    }
  }

  // Get login history for a specific user
  async getUserLoginHistory(userId: string, limit: number = 20): Promise<LoginHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('admin_login_history')
        .select('*')
        .eq('user_id', userId)
        .order('login_time', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('ユーザーログイン履歴の取得に失敗:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('ユーザーログイン履歴取得エラー:', error);
      return [];
    }
  }

  // Get login statistics
  async getLoginStats(): Promise<{
    totalLogins: number;
    uniqueUsers: number;
    todayLogins: number;
    thisWeekLogins: number;
  }> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get total logins
      const { count: totalLogins } = await supabase
        .from('admin_login_history')
        .select('*', { count: 'exact', head: true });

      // Get unique users
      const { data: uniqueUsersData } = await supabase
        .from('admin_login_history')
        .select('user_id')
        .group('user_id');

      // Get today's logins
      const { count: todayLogins } = await supabase
        .from('admin_login_history')
        .select('*', { count: 'exact', head: true })
        .gte('login_time', today.toISOString());

      // Get this week's logins
      const { count: thisWeekLogins } = await supabase
        .from('admin_login_history')
        .select('*', { count: 'exact', head: true })
        .gte('login_time', weekAgo.toISOString());

      return {
        totalLogins: totalLogins || 0,
        uniqueUsers: uniqueUsersData?.length || 0,
        todayLogins: todayLogins || 0,
        thisWeekLogins: thisWeekLogins || 0
      };
    } catch (error) {
      console.error('ログイン統計の取得に失敗:', error);
      return {
        totalLogins: 0,
        uniqueUsers: 0,
        todayLogins: 0,
        thisWeekLogins: 0
      };
    }
  }

  // Format date for display
  formatLoginTime(loginTime: string): string {
    const date = new Date(loginTime);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // Get short user agent info
  getShortUserAgent(userAgent?: string): string {
    if (!userAgent) return '不明';
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    
    return 'その他';
  }
}

export const loginHistoryService = new LoginHistoryService();
