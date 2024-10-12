"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-12 items-start w-full">
      <Button className="ml-10 mt-10" onClick={() => {router.push("/")}}>Back</Button>
      {children}
    </div>
  );
}
