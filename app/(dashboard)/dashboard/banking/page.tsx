"use client";

import { Landmark, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export default function BankingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banking</h1>
          <p className="text-gray-600">Connect your bank accounts and reconcile transactions</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Connect Bank
        </Button>
      </div>

      {/* Empty State */}
      <div className="rounded-xl border bg-white shadow-sm">
        <EmptyState
          icon={Landmark}
          title="No bank accounts connected"
          description="Connect your bank account to automatically import and categorize transactions."
          action={{
            label: "Connect Bank Account",
            onClick: () => console.log("Connect bank"),
          }}
        />
      </div>
    </div>
  );
}
