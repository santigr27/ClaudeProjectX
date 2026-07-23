"use client";

import dynamic from "next/dynamic";

const PropertyLocationMap = dynamic(
  () => import("./PropertyLocationMap").then((mod) => mod.PropertyLocationMap),
  { ssr: false, loading: () => <div className="h-72 w-full rounded-2xl bg-ink-100" /> },
);

export { PropertyLocationMap as PropertyLocationMapLoader };
