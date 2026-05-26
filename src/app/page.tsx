import {
  BarChart3,
  Bug,
  CheckCircle2,
  FileSpreadsheet,
  Image,
  LayoutDashboard,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const features = [
  ["Project-wise QA management", LayoutDashboard],
  ["Test case writing", ListChecks],
  ["Pass/Fail execution tracking", CheckCircle2],
  ["Bug report management", Bug],
  ["Screenshot proof upload", Image],
  ["Severity and priority tracking", ShieldCheck],
  ["Excel export", FileSpreadsheet],
  ["Simple dashboard analytics", BarChart3],
];

export default function LandingPage() {
  return (
    <main className="bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <a className="text-xl font-black text-slate-950" href="/">
          QATrackr
        </a>
        <div className="flex items-center gap-3">
          <LinkButton href="/login" variant="ghost">
            Login
          </LinkButton>
          <LinkButton href="/signup">Start Free</LinkButton>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
            Simple QA Test Case and Bug Report Manager
          </span>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-tight tracking-tight text-slate-950 md:text-7xl">
            Simple QA Test Case & Bug Report Manager
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Create test cases, log bugs, attach proof screenshots, track pass/fail status, and export clean QA reports
            without maintaining messy Excel sheets.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/signup">Start Free</LinkButton>
            <LinkButton href="/dashboard" variant="secondary">
              View Demo
            </LinkButton>
          </div>
        </div>
        <Card className="p-4 shadow-xl">
          <div className="rounded-lg bg-slate-950 p-5 text-white">
            <div className="mb-8 flex items-center justify-between">
              <p className="font-bold">QA Dashboard</p>
              <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-200">Live</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["24 Test Cases", "18 Passed", "4 Open Bugs", "2 Critical"].map((item) => (
                <div key={item} className="rounded-lg bg-white/10 p-4">
                  <p className="text-2xl font-black">{item.split(" ")[0]}</p>
                  <p className="text-sm text-slate-300">{item.replace(/^\S+\s/, "")}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg bg-white p-4 text-slate-950">
              <p className="font-bold">Recent bug</p>
              <p className="mt-2 text-sm text-slate-600">Payment page accepts invalid CVV</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-black uppercase tracking-wide text-slate-500">Problem</p>
          <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-slate-950">
            Excel works until the work gets serious.
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            Manual testers need a clean place to manage evidence, pass/fail status, bug severity, project reports, and
            client-ready exports without losing context across sheets and folders.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm font-black uppercase tracking-wide text-slate-500">Features</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Everything a small QA team needs.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(([label, Icon]) => (
            <Card key={label as string}>
              <Icon className="h-6 w-6 text-slate-950" />
              <h3 className="mt-4 font-bold">{label as string}</h3>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {["Create projects", "Execute QA", "Export reports"].map((step, index) => (
            <div key={step} className="rounded-xl border border-white/10 p-6">
              <span className="text-sm font-black text-slate-400">Step {index + 1}</span>
              <h3 className="mt-3 text-2xl font-black">{step}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Keep test cases, bugs, screenshots, and summary reporting in one client-ready workspace.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-8 text-center">
          <p className="text-sm font-black uppercase tracking-wide text-slate-500">Pricing</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Start free, upgrade when your QA work grows.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {["Free", "Pro", "Team"].map((plan) => (
            <Card key={plan} className={plan === "Pro" ? "border-slate-950 shadow-lg" : ""}>
              <h3 className="text-2xl font-black">{plan}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {plan === "Free" ? "1 project, 20 test cases, 10 bugs." : "More capacity for serious QA delivery."}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl rounded-2xl bg-slate-950 p-10 text-center text-white">
          <h2 className="text-4xl font-black">Ship cleaner QA reports this week.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Replace messy spreadsheets with a focused test case and bug report manager built for manual QA workflows.
          </p>
          <div className="mt-8">
            <LinkButton href="/signup" className="bg-white text-slate-950 hover:bg-slate-100">
              Start Free
            </LinkButton>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-6 py-8 text-center text-sm text-slate-500">
        QATrackr. Built for manual testers and small QA teams.
      </footer>
    </main>
  );
}
