"use client";

import LoginForm from "@/features/login/components/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div>
      <LoginForm />
      <div className="text-center mt-4">
        <Link href="/register" className="text-blue-600 hover:underline">
          Don't have an account? Register
        </Link>
      </div>
    </div>
  );
}
