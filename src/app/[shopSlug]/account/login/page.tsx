"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, KeyRound, ArrowRight, AlertTriangle, ShieldCheck } from "lucide-react";
import { useRequestOtp, useVerifyOtp } from "@/hooks/useCustomerAuth";
import { useShop } from "@/hooks/useStorefront";
import { ApiError } from "@/lib/api/client";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const shopSlug = params.shopSlug as string;

  const { data: shop } = useShop(shopSlug);
  const requestOtp = useRequestOtp(shopSlug);
  const verifyOtp = useVerifyOtp(shopSlug);

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    requestOtp.mutate({ identifier: email }, {
      onSuccess: () => {
        setStep("otp");
      },
      onError: (err) => {
        const apiErr = err as ApiError;
        setErrorMsg(apiErr.message || "Failed to send code. Please try again.");
      }
    });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    verifyOtp.mutate({ identifier: email, otp }, {
      onSuccess: () => {
        // The backend automatically sets the HttpOnly session cookie here!
        router.push(`/${shopSlug}/account/orders`);
      },
      onError: (err) => {
        const apiErr = err as ApiError;
        setErrorMsg(apiErr.message || "Invalid or expired code.");
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 bg-gray-50/50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            {step === "email" ? <Mail className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === "email" ? "Sign in to your account" : "Enter Verification Code"}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {step === "email" 
              ? `Track your orders and checkout faster at ${shop?.name || "our store"}.` 
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-red-800">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-1.5">Email address</label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={requestOtp.isPending || !email}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {requestOtp.isPending ? "Sending code..." : "Continue with Email"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-gray-900 mb-1.5">6-Digit Code</label>
              <input
                type="text"
                id="otp"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                className="block w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-center text-2xl tracking-[0.5em] font-bold text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={verifyOtp.isPending || otp.length < 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyOtp.isPending ? "Verifying..." : "Verify & Sign In"}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Use a different email
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4 text-gray-400" />
          <span>Secure, passwordless authentication</span>
        </div>
      </div>
    </div>
  );
}