import { useState } from "react";
import { Link, Navigate } from "react-router";
import {
  Fingerprint,
  LockKeyhole,
  Mail,
  Mountain,
  ShieldCheck,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useNotification } from "../context/NotificationContext";
import { useUserAccess } from "../context/UserAccessContext";

export function Login() {
  const { isAuthenticated, signInWithEmail } = useUserAccess();
  const { showNotification } = useNotification();

  const [email, setEmail] = useState("rudie@xtrail.app");
  const [password, setPassword] = useState("password");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = () => {
    try {
      signInWithEmail(email, password);

      showNotification({
        title: "Signed in",
        message: "Welcome back to XTrail.",
        variant: "success",
      });
    } catch (error) {
      showNotification({
        title: "Login failed",
        message:
          error instanceof Error
            ? error.message
            : "Unable to sign in with those details.",
        variant: "error",
      });
    }
  };

  const handlePasskeyLogin = () => {
    showNotification({
      title: "Passkey login coming soon",
      message:
        "Face ID, fingerprint, and passkey login will be connected when backend authentication is added.",
      variant: "info",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 px-5 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/10 text-red-500">
            <Mountain className="h-8 w-8" />
          </div>

          <h1 className="text-3xl font-bold">Welcome to XTrail</h1>

          <p className="mt-2 text-sm text-neutral-400">
            Sign in to track rides, manage your garage, discover trails, and sync your progress.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <LockKeyhole className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">Sign in</h2>
              <p className="text-xs text-neutral-400">
                Use email or username and password.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-neutral-300">Email or username</Label>

              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

                <Input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="rudie@xtrail.app"
                  className="border-neutral-700 bg-neutral-800 pl-10 text-white placeholder:text-neutral-500"
                />
              </div>
            </div>

            <div>
              <Label className="text-neutral-300">Password</Label>

              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Enter password"
                className="mt-1 border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500"
              />
            </div>

            <Button
              type="button"
              onClick={handleLogin}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Sign In
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handlePasskeyLogin}
              className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              <Fingerprint className="mr-2 h-4 w-4" />
              Use Face ID / Fingerprint
            </Button>
          </div>

          <div className="mt-5 flex items-center justify-between text-xs">
            <Link
              to="/forgot-password"
              className="text-neutral-400 hover:text-white"
            >
              Forgot password?
            </Link>

            <Link
              to="/register"
              className="font-semibold text-red-400 hover:text-red-300"
            >
              Create account
            </Link>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-400" />

            <div>
              <p className="text-sm font-semibold">Secure sign-in planned</p>

              <p className="mt-1 text-xs text-neutral-400">
                2FA will be used on first sign-in, new devices, and sensitive actions.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
          <p className="text-xs font-semibold text-orange-400">Demo accounts</p>

          <p className="mt-1 text-xs text-neutral-400">
            Use rudie@xtrail.app, admin@xtrail.app, contributor@xtrail.app, paiduser@xtrail.app, or freeuser@xtrail.app. Any password works for now.
          </p>
        </div>
      </div>
    </div>
  );
}