"use client";

import { usePathname } from "next/navigation";

const NO_PAD_PATHS = new Set(["/", "/register"]);
const NO_PAD_PREFIXES = ["/api-docs"];

export default function PageContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const needsPad =
    !NO_PAD_PATHS.has(pathname) &&
    !NO_PAD_PREFIXES.some((p) => pathname.startsWith(p));

  return <div className={needsPad ? "pt-14" : ""}>{children}</div>;
}
