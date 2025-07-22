// src/app/login/layout.tsx
import React from "react";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>; // or add a wrapper layout if needed
}
