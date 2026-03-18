"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/splash");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A2540]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00C9A7]"></div>
    </div>
  );
}
