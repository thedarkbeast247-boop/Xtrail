import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Clipboard,
  Database,
  Download,
  FileUp,
  RefreshCcw,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { useNotification } from "../context/NotificationContext";

interface XTrailDataExport {
  app: "xtrail";
  version: 1;
  exportedAt: string;
  storage: Record<string, string>;
}

const XTRAIL_STORAGE_PREFIX = "xtrail";

function getXTrailStorageSnapshot(): Record<string, string> {
  const snapshot: Record<string, string> = {};

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (!key) continue;

    if (key.startsWith(XTRAIL_STORAGE_PREFIX)) {
      const value = localStorage.getItem(key);

      if (value !== null) {
        snapshot[key] = value;
      }
    }
  }

  return snapshot;
}

function buildExportPayload(): XTrailDataExport {
  return {
    app: "xtrail",
    version: 1,
    exportedAt: new Date().toISOString(),
    storage: getXTrailStorageSnapshot(),
  };
}

function validateImportPayload(value: unknown): XTrailDataExport {
  if (!value || typeof value !== "object") {
    throw new Error("The import file is not valid XTrail data.");
  }

  const data = value as Partial<XTrailDataExport>;

  if (data.app !== "xtrail") {
    throw new Error("This does not look like an XTrail export.");
  }

  if (data.version !== 1) {
    throw new Error("This XTrail export version is not supported.");
  }

  if (!data.storage || typeof data.storage !== "object") {
    throw new Error("This export does not contain storage data.");
  }

  return data as XTrailDataExport;
}

export function DevDataTransfer() {
  const { showNotification } = useNotification();

  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [clearArmed, setClearArmed] = useState(false);
  const [lastExportKeyCount, setLastExportKeyCount] = useState(0);

  const currentStorageCount = Object.keys(getXTrailStorageSnapshot()).length;

  const handleCreateExport = () => {
    const payload = buildExportPayload();
    const text = JSON.stringify(payload, null, 2);

    setExportText(text);
    setLastExportKeyCount(Object.keys(payload.storage).length);

    showNotification({
      title: "Export created",
      message: `${Object.keys(payload.storage).length} XTrail data item${
        Object.keys(payload.storage).length === 1 ? "" : "s"
      } prepared for transfer.`,
      variant: "success",
    });
  };

  const handleCopyExport = async () => {
    const payloadText =
      exportText || JSON.stringify(buildExportPayload(), null, 2);

    setExportText(payloadText);

    try {
      await navigator.clipboard.writeText(payloadText);

      showNotification({
        title: "Export copied",
        message: "Paste this data into the import box on your phone.",
        variant: "success",
      });
    } catch (error) {
      console.error("Clipboard copy failed:", error);

      showNotification({
        title: "Copy blocked",
        message:
          "Your browser blocked automatic copy. Select the export text and copy it manually.",
        variant: "warning",
      });
    }
  };

  const handleDownloadExport = () => {
    const payloadText =
      exportText || JSON.stringify(buildExportPayload(), null, 2);

    setExportText(payloadText);

    const blob = new Blob([payloadText], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `xtrail-dev-data-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showNotification({
      title: "Export downloaded",
      message: "Move this JSON file to your phone and import it there.",
      variant: "success",
    });
  };

  const applyImportPayload = (payload: XTrailDataExport) => {
    const entries = Object.entries(payload.storage).filter(([key, value]) => {
      return key.startsWith(XTRAIL_STORAGE_PREFIX) && typeof value === "string";
    });

    entries.forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    showNotification({
      title: "Data imported",
      message: `${entries.length} XTrail data item${
        entries.length === 1 ? "" : "s"
      } imported. Reloading app now.`,
      variant: "success",
    });

    window.setTimeout(() => {
      window.location.href = "/profile";
    }, 700);
  };

  const handleImportFromText = () => {
    try {
      const parsed = JSON.parse(importText);
      const payload = validateImportPayload(parsed);

      applyImportPayload(payload);
    } catch (error) {
      console.error("Import failed:", error);

      showNotification({
        title: "Import failed",
        message:
          error instanceof Error
            ? error.message
            : "The pasted data could not be imported.",
        variant: "error",
      });
    }
  };

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const payload = validateImportPayload(parsed);

      applyImportPayload(payload);
    } catch (error) {
      console.error("File import failed:", error);

      showNotification({
        title: "File import failed",
        message:
          error instanceof Error
            ? error.message
            : "The selected file could not be imported.",
        variant: "error",
      });
    } finally {
      event.target.value = "";
    }
  };

  const handleClearLocalData = () => {
    if (!clearArmed) {
      setClearArmed(true);

      showNotification({
        title: "Tap again to clear",
        message:
          "This will remove XTrail test data from this browser only. Tap Clear Local Data again to confirm.",
        variant: "warning",
      });

      window.setTimeout(() => {
        setClearArmed(false);
      }, 5000);

      return;
    }

    const keysToRemove = Object.keys(getXTrailStorageSnapshot());

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    showNotification({
      title: "Local data cleared",
      message: `${keysToRemove.length} XTrail data item${
        keysToRemove.length === 1 ? "" : "s"
      } removed from this browser.`,
      variant: "info",
    });

    window.setTimeout(() => {
      window.location.href = "/login";
    }, 700);
  };

  if (!import.meta.env.DEV) {
    return (
      <div className="min-h-full bg-neutral-950 px-4 py-5 text-white">
        <Link to="/profile">
          <Button
            variant="ghost"
            className="mb-4 text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
        </Link>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h1 className="text-xl font-semibold">Dev Data Transfer</h1>
          <p className="mt-2 text-sm text-neutral-400">
            This tool is only available in development mode.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-neutral-950 text-white">
      <div className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to="/profile">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div>
            <h1 className="text-xl font-semibold">Dev Data Transfer</h1>
            <p className="text-sm text-neutral-400">
              Move local XTrail test data between desktop and phone.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 py-5">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
              <Database className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-300">
                Current browser data
              </p>
              <p className="mt-1 text-sm text-neutral-300">
                This browser currently has {currentStorageCount} XTrail data
                item{currentStorageCount === 1 ? "" : "s"} stored.
              </p>
              <p className="mt-2 text-xs text-neutral-500">
                Desktop and phone browsers do not share localStorage. This tool
                copies your local test data manually until the backend is added.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <Download className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-white">Export data</h2>
              <p className="text-sm text-neutral-400">
                Do this on your desktop first.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button
              type="button"
              onClick={handleCreateExport}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Database className="mr-2 h-4 w-4" />
              Create Export
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleCopyExport}
              className="border-neutral-700 text-neutral-200 hover:bg-neutral-800"
            >
              <Clipboard className="mr-2 h-4 w-4" />
              Copy Export Text
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadExport}
              className="border-neutral-700 text-neutral-200 hover:bg-neutral-800"
            >
              <FileUp className="mr-2 h-4 w-4" />
              Download JSON File
            </Button>
          </div>

          {lastExportKeyCount > 0 && (
            <p className="mt-3 text-xs text-emerald-400">
              Last export prepared {lastExportKeyCount} data item
              {lastExportKeyCount === 1 ? "" : "s"}.
            </p>
          )}

          <textarea
            value={exportText}
            readOnly
            placeholder="Your export text will appear here..."
            className="mt-4 h-44 w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950 p-3 font-mono text-xs text-neutral-300 outline-none focus:border-neutral-600"
          />
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
              <Upload className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-white">Import data</h2>
              <p className="text-sm text-neutral-400">
                Do this on your phone after exporting from desktop.
              </p>
            </div>
          </div>

          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder="Paste XTrail export text here..."
            className="h-44 w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950 p-3 font-mono text-xs text-neutral-300 outline-none focus:border-neutral-600"
          />

          <div className="mt-3 grid grid-cols-1 gap-3">
            <Button
              type="button"
              onClick={handleImportFromText}
              disabled={!importText.trim()}
              className="bg-orange-600 hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Pasted Data
            </Button>

            <label className="flex h-11 cursor-pointer items-center justify-center rounded-md border border-neutral-700 text-sm text-neutral-200 transition hover:bg-neutral-800">
              <FileUp className="mr-2 h-4 w-4" />
              Import JSON File
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
              <Trash2 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-white">Clear local test data</h2>
              <p className="text-sm text-neutral-400">
                Clears XTrail data from this browser only.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleClearLocalData}
            className={`w-full border-red-500/40 text-red-300 hover:bg-red-500/10 ${
              clearArmed ? "bg-red-500/20" : ""
            }`}
          >
            {clearArmed ? (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Confirm Clear Local Data
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Local Data
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}