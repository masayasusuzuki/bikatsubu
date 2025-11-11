import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { loginHistoryService } from '../services/loginHistoryService';

const MAX_ATTEMPTS = 3;
const PERMANENTLY_LOCKED = 9999999999999; // 永久ロック（開発者に連絡が必要）

interface LoginAttempt {
  count: number;
  lockedUntil: number | null;
}

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    checkLockStatus();
    const interval = setInterval(checkLockStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const getLoginAttempts = (): LoginAttempt => {
    const stored = localStorage.getItem('loginAttempts');
    if (!stored) {
      return { count: 0, lockedUntil: null };
    }
    return JSON.parse(stored);
  };

  const setLoginAttempts = (attempts: LoginAttempt) => {
    localStorage.setItem('loginAttempts', JSON.stringify(attempts));
  };

  const checkLockStatus = () => {
    const attempts = getLoginAttempts();

    if (attempts.lockedUntil) {
      setIsLocked(true);
      setRemainingTime(0); // タイマー表示は不要
    } else {
      setIsLocked(false);
      setRemainingTime(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // ロック状態を再確認（localStorageから直接取得）
    const attempts = getLoginAttempts();

    if (attempts.lockedUntil) {
      setError('アカウントがロックされています。開発者に連絡してロックを解除してください。');
      setIsLocked(true);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // ログイン失敗時の処理
      const currentAttempts = getLoginAttempts();
      const newCount = currentAttempts.count + 1;

      if (newCount >= MAX_ATTEMPTS) {
        // 永久ロック
        const lockData = { count: newCount, lockedUntil: PERMANENTLY_LOCKED };
        setLoginAttempts(lockData);
        setIsLocked(true);
        setError(`ログイン試行回数が上限に達しました。アカウントがロックされています。開発者に連絡してロックを解除してください。`);
      } else {
        setLoginAttempts({ count: newCount, lockedUntil: null });
        const remaining = MAX_ATTEMPTS - newCount;
        setError(`メールアドレスまたはパスワードが正しくありません（残り${remaining}回）`);
      }
      return;
    }

    // ログイン成功時
    // ロックされている場合は成功してもログインさせない
    const finalCheck = getLoginAttempts();

    if (finalCheck.lockedUntil) {
      await supabase.auth.signOut();
      setError('アカウントがロックされています。開発者に連絡してロックを解除してください。');
      setIsLocked(true);
      return;
    }

    // ロックされていない場合のみカウントリセット
    setLoginAttempts({ count: 0, lockedUntil: null });

    // Record login history
    if (data.user) {
      await loginHistoryService.recordLogin(data.user.id, email);
    }

    window.location.href = '/admin/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-primary mb-2">美活部</h1>
          <h2 className="text-xl font-semibold text-gray-800">管理者ログイン</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLocked}
            className={`w-full py-2 px-4 rounded-md transition-colors font-semibold ${
              isLocked
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-brand-primary text-white hover:bg-opacity-90'
            }`}
          >
            {isLocked ? 'アカウントロック中' : 'ログイン'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-600 hover:text-brand-primary">
            サイトトップに戻る
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;