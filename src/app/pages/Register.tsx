import { Link } from "react-router";
import { ArrowLeft, Fingerprint, Mountain, UserPlus } from "lucide-react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useNotification } from "../context/NotificationContext";

export function Register() {
  const { showNotification } = useNotification();

  const handleCreateAccount = () => {
    showNotification({
      title: "Registration coming soon",
      message:
        "Account creation will be connected when backend authentication is added.",
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

          <h1 className="text-3xl font-bold">Create your XTrail account</h1>

          <p className="mt-2 text-sm text-neutral-400">
            Start tracking rides, saving trails, and building your garage.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <UserPlus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">Sign up</h2>
              <p className="text-xs text-neutral-400">
                Backend registration will be connected later.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-neutral-300">Name</Label>

              <Input
                placeholder="Your name"
                className="mt-1 border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500"
              />
            </div>

            <div>
              <Label className="text-neutral-300">Email</Label>

              <Input
                placeholder="you@example.com"
                className="mt-1 border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500"
              />
            </div>

            <div>
              <Label className="text-neutral-300">Password</Label>

              <Input
                type="password"
                placeholder="Create password"
                className="mt-1 border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500"
              />
            </div>

            <Button
              type="button"
              onClick={handleCreateAccount}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Create Account
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleCreateAccount}
              className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              <Fingerprint className="mr-2 h-4 w-4" />
              Set up passkey later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}