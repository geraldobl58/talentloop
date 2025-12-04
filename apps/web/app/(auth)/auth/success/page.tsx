"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Inner component that uses useSearchParams
function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(4);
  const [progress, setProgress] = useState(100);
  const hasRedirected = useRef(false);

  // Check if this is a candidate or company signup
  // Candidates with FREE plan don't go through Stripe
  const isCompanySignup = searchParams.get("type") === "company";

  useEffect(() => {
    if (hasRedirected.current) return;

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
      setProgress((prev) => Math.max(0, prev - 25));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Separate effect for redirect
  useEffect(() => {
    if (countdown <= 0 && !hasRedirected.current) {
      hasRedirected.current = true;
      router.push("/auth/sign-in");
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-slate-700/25 mask-[radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-md mx-auto text-center space-y-8">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-500 to-purple-500 opacity-75 blur-lg animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-white animate-in fade-in zoom-in duration-1000"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
            {isCompanySignup ? "Pagamento Confirmado!" : "Cadastro Confirmado!"}
          </h1>

          <p className="text-slate-300 text-lg leading-relaxed">
            {isCompanySignup
              ? "Sua empresa está sendo criada e configurada. Você receberá um email com as informações de acesso em instantes."
              : "Sua conta foi criada com sucesso! Você receberá um email com as informações de acesso em instantes."}
          </p>

          <div className="pt-4 space-y-3 text-sm text-slate-400">
            {isCompanySignup ? (
              <>
                <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span>Processando dados de pagamento</span>
                </div>
                <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse animation-delay-1000" />
                  <span>Criando sua empresa</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>Configurando sua conta</span>
              </div>
            )}
            <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse animation-delay-2000" />
              <span>Enviando email com acesso</span>
            </div>
          </div>
        </div>

        {/* Loading animation */}
        <div className="flex justify-center gap-2 pt-6">
          <div
            className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-700/50 rounded-full h-1 overflow-hidden border border-slate-600/30 mt-8">
          <div
            className="h-full bg-linear-to-r from-blue-400 to-purple-400 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Footer text with countdown */}
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold bg-linear-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            Redirecionando em {countdown} segundo{countdown !== 1 ? "s" : ""}...
          </p>
          <p className="text-xs text-slate-500">
            Você será redirecionado para o login
          </p>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.7;
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
            opacity: 0.5;
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
            opacity: 0.6;
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-1000 {
          animation-delay: 1000ms;
        }

        .animation-delay-2000 {
          animation-delay: 2000ms;
        }

        .animation-delay-4000 {
          animation-delay: 4000ms;
        }
      `}</style>
    </div>
  );
}

// Loading fallback
function SuccessLoading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex justify-center gap-2">
        <div
          className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

const SuccessPage = () => {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent />
    </Suspense>
  );
};

export default SuccessPage;
