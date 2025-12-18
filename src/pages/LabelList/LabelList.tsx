import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { LabelTable } from "../../components/label-list";
import { labelAPI } from "../../services/api";
import { toast } from "react-hot-toast";

export default function LabelList() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      toast.loading("Triggering sync job...", { id: "sync-labels" });

      const response = await labelAPI.syncProdLabel();

      if (response.success) {
        toast.success(
          response.message || "Sync job has been started! The process will run in the background (~5 minutes).",
          { id: "sync-labels", duration: 6000 }
        );
        // Don't reload immediately since sync runs in background
        // User can manually refresh after a few minutes
      } else {
        toast.error(response.message || "Failed to start sync job", { id: "sync-labels" });
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to trigger sync", { id: "sync-labels" });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Label List"
        description="Label List"
      />
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Label List
          </h2>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-brand-500 rounded-lg hover:bg-brand-600 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isSyncing ? "Syncing..." : "Sync Prod Label"}
          </button>
        </div>
        <LabelTable />
      </div>
    </>
  );
}
