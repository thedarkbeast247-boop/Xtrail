import { Link } from "react-router";
import { ArrowLeft, Mail, Mountain } from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useNotification } from "../context/NotificationContext";

export function ForgotPassword() {
  const { showNotification } = useNotification();

  const handleReset = () => {
    showNotification({
      title: "Reset link coming soon",
      message:
        "Password reset will be connected when backend authentication is added.",
      variant: "info",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 px-5 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <Link
          to="/login"
          className="mb-6 inline-flex items-center text-sm text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/10 text-red-500">
            <Mountain className="h-8 w-8" />
          </div>

          <h1 className="text-3xl font-bold">Reset password</h1>

          <p className="mt-2 text-sm text-neutral-400">
            Enter your email and we will send a reset link once authentication is connected.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
          <div>
            <Label className="text-neutral-300">Email address</Label>

            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

              <Input
                placeholder="you@example.com"
                className="border-neutral-700 bg-neutral-800 pl-10 text-white placeholder:text-neutral-500"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={handleReset}
            className="mt-5 w-full bg-red-600 hover:bg-red-700"
          >
            Send Reset Link
          </Button>
        </div>
      </div>
    </div>
  );
}