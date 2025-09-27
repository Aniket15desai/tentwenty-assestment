"use client";

import { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function AuthLayout({
  title,
  description,
  children,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 sm:px-10 lg:px-24 py-12">
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-6">{title}</h2>
          {children}
        </div>
      </div>

      {/* Right side - brand panel */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-blue-600 text-white px-10 lg:px-24">
        <div className="w-full">
          <h1 className="text-3xl font-bold mb-4">ticktock</h1>
          <p className="text-base leading-relaxed text-blue-100">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
