'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, AlertCircle, Lock } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [gisRendered, setGisRendered] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errorParam) {
      setErrorMessage(decodeURIComponent(errorParam));
    }

    fetch('/api/auth/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.clientId) setClientId(data.clientId);
      })
      .catch((err) => console.warn('Could not load client ID:', err));
  }, [errorParam]);

  // Handle Google Token response
  const handleCredentialResponse = async (response: any) => {
    if (!response || !response.credential) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/google/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push(data.redirect || '/student/dashboard');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message);
      setIsLoading(false);
    }
  };

  // Initialize Google Identity Services when script is ready
  const initGoogleIdentity = () => {
    if (typeof window === 'undefined' || !window.google || !clientId) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        hd: 'vitbhopal.ac.in',
      });

      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 340,
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
        setGisRendered(true);
      }
    } catch (err) {
      console.warn('Google Identity initialization error:', err);
    }
  };

  useEffect(() => {
    if (clientId && window.google) {
      initGoogleIdentity();
    }
  }, [clientId]);

  // Fallback direct OAuth URL
  const handleDirectOAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/auth/google/url?origin=${encodeURIComponent(window.location.origin)}`);
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Google OAuth is not configured yet.');
      }

      window.location.href = data.url;
    } catch (err: any) {
      setErrorMessage(err.message);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogleIdentity}
      />

      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          {/* University Crest */}
          <div className="relative w-20 h-20 mx-auto overflow-hidden rounded-2xl bg-white p-2 shadow-md border border-slate-200">
            <Image
              src="/vit-bhopal-logo.png"
              alt="VIT Bhopal Logo"
              fill
              sizes="80px"
              className="object-contain"
              priority
            />
          </div>

          <h2 className="mt-5 text-2xl sm:text-3xl font-extrabold text-[#002855] tracking-tight">
            VIT Bhopal University
          </h2>
          <p className="mt-1 text-sm text-slate-600 font-medium">
            Campus Grievance & Incident Redressal Portal
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 shadow-md rounded-2xl sm:px-10 border border-slate-200 space-y-6">
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs text-red-700 leading-relaxed font-medium">
                  {errorMessage}
                </div>
              </div>
            )}

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Sign In to Your Account</h3>
              <p className="text-xs text-slate-500">
                Authenticate securely using your university Google account.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-semibold text-[#002855]">
                <Shield className="w-3 h-3 text-blue-600" />
                <span>Restricted to @vitbhopal.ac.in only</span>
              </div>
            </div>

            {/* Official Google Identity Button Container */}
            <div className="flex flex-col items-center justify-center min-h-[44px]">
              <div ref={googleBtnRef} className="w-full flex justify-center" />

              {/* Google Sign-in button */}
              {!gisRendered && (
                <button
                  onClick={handleDirectOAuth}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all shadow-2xs hover:shadow-xs active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                </button>
              )}

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Server-side verified role & institutional access</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
            <p>Protected by University Information Security Policy</p>
            <p className="text-[11px] text-slate-400">VIT Bhopal University, Madhya Pradesh</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
