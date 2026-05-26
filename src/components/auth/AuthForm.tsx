"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { validateEmail, validatePassword } from "@/lib/validators";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) return setError(emailValidation.message);
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) return setError(passwordValidation.message);

    setLoading(true);
    const supabase = createClient();
    const result = isSignup
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { workspace_name: "My Workspace" } },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (result.error) return setError(result.error.message);

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <Card className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center text-2xl font-black">
          QATrackr
        </Link>
        <h1 className="text-2xl font-black">{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-2 text-sm text-slate-600">
          {isSignup ? "Start managing QA projects without spreadsheets." : "Log in to continue to your workspace."}
        </p>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error ? <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p> : null}
          <Button disabled={loading}>{loading ? "Please wait..." : isSignup ? "Start Free" : "Login"}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-600">
          {isSignup ? "Already have an account?" : "Need an account?"}{" "}
          <Link className="font-bold text-slate-950" href={isSignup ? "/login" : "/signup"}>
            {isSignup ? "Login" : "Sign up"}
          </Link>
        </p>
      </Card>
    </main>
  );
}
