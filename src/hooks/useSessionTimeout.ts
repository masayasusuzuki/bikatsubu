import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30分

export const useSessionTimeout = () => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    // 既存のタイマーをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // ログアウトまで残り5分で警告
    warningTimeoutRef.current = setTimeout(() => {
      const confirmed = confirm('セッションの有効期限が残り5分です。操作を続けますか？');
      if (confirmed) {
        resetTimeout(); // ユーザーが継続を選択したらタイマーリセット
      }
    }, SESSION_TIMEOUT - 5 * 60 * 1000); // 25分後

    // 30分後に自動ログアウト
    timeoutRef.current = setTimeout(async () => {
      alert('セッションがタイムアウトしました。再度ログインしてください。');
      await supabase.auth.signOut();
      window.location.href = '/admin';
    }, SESSION_TIMEOUT);
  };

  useEffect(() => {
    // 初期タイマー設定
    resetTimeout();

    // ユーザーアクティビティを検知してタイマーリセット
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // クリーンアップ
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);
};
