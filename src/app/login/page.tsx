'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { Youtube, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Failed to sign in');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Youtube className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-wider text-white">VYRAL</span>
        </div>
        <h2 className="text-center text-sm font-medium text-zinc-400">
          YouTube Intelligence & Creator Operating System
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#12141c] py-8 px-6 shadow-2xl border border-zinc-800/80 sm:rounded-2xl sm:px-10 backdrop-blur-xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@vyral.ai"
                className="w-full px-3.5 py-2.5 bg-[#0b0c12] border border-zinc-700/80 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#0b0c12] border border-zinc-700/80 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-red-600 via-indigo-600 to-indigo-700 text-white font-medium text-sm hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#12141c] disabled:opacity-50 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <span>{submitting ? 'Signing in...' : 'Sign in to Operating System'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={async () => {
                setEmail('creator@vyral.ai');
                setPassword('password123');
                setSubmitting(true);
                const res = await login('creator@vyral.ai', 'password123');
                if (!res.success) {
                  setError(res.error || 'Failed demo sign in');
                  setSubmitting(false);
                }
              }}
              className="w-full py-2 px-4 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 font-medium text-xs border border-zinc-700/80 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant Demo Sign In (1-Click)</span>
            </button>
          </form>

          <div className="mt-6 border-t border-zinc-800/80 pt-6 text-center text-xs text-zinc-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create an account
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-3 gap-2 text-center text-xs text-zinc-500">
          <div className="flex items-center justify-center space-x-1.5 py-2 bg-zinc-900/40 rounded-lg border border-zinc-800/50">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Outlier Engine</span>
          </div>
          <div className="flex items-center justify-center space-x-1.5 py-2 bg-zinc-900/40 rounded-lg border border-zinc-800/50">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Channel DNA</span>
          </div>
          <div className="flex items-center justify-center space-x-1.5 py-2 bg-zinc-900/40 rounded-lg border border-zinc-800/50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Paywalls</span>
          </div>
        </div>
      </div>
    </div>
  );
}
