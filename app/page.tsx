import { ArrowRight, ShieldCheck, UserPlus, QrCode, Clock, Shield } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-white border-b">
        <div className="container relative z-10 px-4 mx-auto max-w-7xl sm:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm font-medium text-blue-700 rounded-full bg-blue-50 border border-blue-100">
              <ShieldCheck className="w-4 h-4" />
              <span>Next Generation Visitor Control</span>
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl max-w-3xl">
              Secure & Seamless <span className="text-blue-600">Visitor Management</span> for SM
            </h1>
            <p className="mb-10 text-lg text-slate-500 max-w-2xl">
              A comprehensive QR-based system designed to streamline visitor requests, 
              enhance security at entrances, and maintain digital records of every visit.
            </p>
            <div className="flex flex-col items-center justify-center w-full gap-4 sm:flex-row">
              <Link 
                href="/request" 
                className="flex items-center justify-center w-full gap-2 px-8 py-4 text-base font-bold text-white transition-all bg-blue-600 rounded-2xl sm:w-auto hover:bg-blue-500 shadow-lg shadow-blue-200 active:scale-95"
              >
                Request a Visitor Pass
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/security/dashboard" 
                className="flex items-center justify-center w-full gap-2 px-8 py-4 text-base font-bold text-slate-700 transition-all bg-slate-100 rounded-2xl sm:w-auto hover:bg-slate-200 active:scale-95"
              >
                Security Entrance
                <Shield className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50 -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10" />
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50">
        <div className="container px-4 mx-auto max-w-7xl sm:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard 
              icon={<QrCode className="w-8 h-8 text-blue-600" />}
              title="QR-Based Entry"
              description="Visitors receive a secure QR code linked to their request for instant verification at the gate."
            />
            <FeatureCard 
              icon={<UserPlus className="w-8 h-8 text-indigo-600" />}
              title="Easy Pre-Registration"
              description="Apply for visits online from any device, reducing wait times and improving visitor experience."
            />
            <FeatureCard 
              icon={<Clock className="w-8 h-8 text-emerald-600" />}
              title="Real-time Tracking"
              description="Security staff can track every entry and exit with accurate digital timestamps."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-6 p-3 w-fit bg-slate-50 rounded-2xl">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-500 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
