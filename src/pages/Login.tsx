// === 📁 src/pages/Login.tsx ===
// Login page for user authentication

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { configService } from '@/services/configService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const serverUrl = configService.getServerUrl();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Заполните все поля');
      return;
    }

    setIsLogging(true);

    try {
      const result = await login({
        username: username.trim(),
        password: password.trim(),
      });

      if (result.success) {
        console.log('✅ Login successful, navigating to home...');
        setTimeout(() => {
          navigate('/');
        }, 300);
      } else {
        setError(result.error || 'Ошибка авторизации');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка подключения');
    } finally {
      setIsLogging(false);
    }
  };

  const handleBackToSetup = () => {
    if (confirm('Вернуться к настройке сервера? Текущие настройки будут сброшены.')) {
      configService.resetConfig();
      navigate('/setup');
    }
  };

  return (
    <div className="min-h-screen bg-[#343436] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-[#e3e3dd] mb-2">
            Вход в систему
          </h1>
          <h2 className="text-sm text-[#a7a7a7] mb-4">
            Авторизуйтесь для доступа к приложению
          </h2>
          
          {/* Server Info */}
          <div className="bg-[#474747] rounded-lg p-3 inline-block">
            <p className="text-xs text-[#a7a7a7]">Сервер:</p>
            <p className="text-sm text-[#e3e3dd] font-mono">{serverUrl}</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="bg-[#474747] rounded-lg p-6 space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-[#e3e3dd] mb-2"
              >
                Имя пользователя
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-[#343436] border border-[#555] rounded-lg text-[#e3e3dd] placeholder-[#777] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Введите имя пользователя"
                  disabled={isLogging}
                />
                <span className="absolute left-3 top-3 text-[#777]">👤</span>
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#e3e3dd] mb-2"
              >
                Пароль
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-10 pr-12 bg-[#343436] border border-[#555] rounded-lg text-[#e3e3dd] placeholder-[#777] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Введите пароль"
                  disabled={isLogging}
                />
                <span className="absolute left-3 top-3 text-[#777]">🔒</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#777] hover:text-[#e3e3dd] transition-colors"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-3">
                <p className="text-sm text-red-400">⚠️ {error}</p>
              </div>
            )}

            {/* Dev Mode Hint */}
            <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-lg p-3">
              <p className="text-xs text-yellow-400">
                💡 Режим разработки: любые учетные данные будут приняты
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLogging || !username.trim() || !password.trim()}
              className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLogging ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Вход...
                </>
              ) : (
                'Войти →'
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToSetup}
              disabled={isLogging}
              className="w-full py-2 px-4 text-[#a7a7a7] hover:text-[#e3e3dd] text-sm transition-colors disabled:text-gray-700"
            >
              ← Изменить сервер
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-[#777]">
          <p>Cleverence Mobile SMARTS</p>
          <p className="mt-1">Защищенное соединение 🔒</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

