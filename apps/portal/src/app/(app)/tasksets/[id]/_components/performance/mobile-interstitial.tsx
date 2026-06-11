"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/components/button";

interface MobileInterstitialProps {
  tasksetId: string;
}

export default function MobileInterstitial({
  tasksetId,
}: MobileInterstitialProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tab");
    const qs = params.toString();
    router.replace(
      qs ? `/tasksets/${tasksetId}?${qs}` : `/tasksets/${tasksetId}`,
      { scroll: false },
    );
  };
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-12 text-center md:hidden">
      <p className="text-body text-foreground">
        Performance analysis is designed for larger screens.
      </p>
      <Button type="button" variant="secondary" onClick={handleBack}>
        <ArrowLeft aria-hidden="true" />
        View Overview
      </Button>
    </div>
  );
}
