import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  Printer,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';
import { exportToJson, exportToMarkdown, importFromJson } from '../../lib/storage';
import type { DreamlineState } from '../../types/dreamline';

interface ExportModalProps {
  isOpen: boolean;
  state: DreamlineState;
  isSamplePreview: boolean;
  onImportState: (next: DreamlineState) => void;
  onResetState: () => void;
  onClose: () => void;
}

export function ExportModal({
  isOpen,
  state,
  isSamplePreview,
  onImportState,
  onResetState,
  onClose,
}: ExportModalProps) {
  const [copiedMd, setCopiedMd] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setCopiedMd(false);
    setImportError(null);
    setConfirmReset(false);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handlePrint() {
    onClose();
    requestAnimationFrame(() => {
      window.print();
    });
  }

  async function handleCopyMarkdown() {
    const md = exportToMarkdown(state);
    try {
      await navigator.clipboard.writeText(md);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2500);
    } catch {
      // Fallback download if clipboard permission denied
      downloadFile(md, `dreamline-${state.startDate}.md`, 'text/markdown');
    }
  }

  function downloadFile(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadJson() {
    downloadFile(
      exportToJson(state),
      `dreamline-backup-${state.startDate}.json`,
      'application/json',
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importFromJson(String(reader.result ?? ''));
      if (!result.ok) {
        setImportError(result.error);
        return;
      }
      setImportError(null);
      onImportState(result.state);
      onClose();
    };
    reader.readAsText(file);
  }

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border-warm bg-surface shadow-xl dark:border-[#2c2a27] dark:bg-[#1a1917]">
        <div className="flex items-center justify-between border-b border-border-warm px-5 py-4 dark:border-[#2c2a27]">
          <h2
            id="export-modal-title"
            className="font-serif text-2xl text-ink dark:text-[#f4f1ec]"
          >
            Export, Print &amp; Backup
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Export modal"
            className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink dark:text-[#a69f95] dark:hover:bg-[#272522]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-5">
          <button
            type="button"
            onClick={handlePrint}
            className="flex w-full items-center justify-between rounded-xl border border-border-warm bg-canvas px-4 py-3 text-left transition hover:border-terracotta dark:border-[#2c2a27] dark:bg-[#141312]"
          >
            <div>
              <div className="text-sm font-semibold text-ink dark:text-[#f4f1ec]">
                Print / Save 1-Page PDF Worksheet
              </div>
              <div className="text-xs text-ink-muted dark:text-[#a69f95]">
                Formatted for fridge, desk, or journal
              </div>
            </div>
            <Printer className="h-4 w-4 text-terracotta" />
          </button>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="flex w-full items-center justify-between rounded-xl border border-border-warm bg-canvas px-4 py-3 text-left transition hover:border-terracotta dark:border-[#2c2a27] dark:bg-[#141312]"
          >
            <div>
              <div className="text-sm font-semibold text-ink dark:text-[#f4f1ec]">
                {copiedMd ? 'Copied Markdown!' : 'Copy Markdown Summary'}
              </div>
              <div className="text-xs text-ink-muted dark:text-[#a69f95]">
                Paste directly into Notion, Obsidian, or Apple Notes
              </div>
            </div>
            {copiedMd ? (
              <Check className="h-4 w-4 text-sage dark:text-[#6ec49a]" />
            ) : (
              <Copy className="h-4 w-4 text-ink-muted" />
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="flex w-full items-center justify-between rounded-xl border border-border-warm bg-canvas px-4 py-3 text-left transition hover:border-terracotta dark:border-[#2c2a27] dark:bg-[#141312]"
          >
            <div>
              <div className="text-sm font-semibold text-ink dark:text-[#f4f1ec]">
                Download JSON Backup
              </div>
              <div className="text-xs text-ink-muted dark:text-[#a69f95]">
                Save a portable local copy of all timelines &amp; Fear-Setting
              </div>
            </div>
            <Download className="h-4 w-4 text-ink-muted" />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-between rounded-xl border border-border-warm bg-canvas px-4 py-3 text-left transition hover:border-terracotta dark:border-[#2c2a27] dark:bg-[#141312]"
          >
            <div>
              <div className="text-sm font-semibold text-ink dark:text-[#f4f1ec]">
                Restore from JSON File
              </div>
              <div className="text-xs text-ink-muted dark:text-[#a69f95]">
                Import a previously exported Dreamline backup
              </div>
            </div>
            <Upload className="h-4 w-4 text-ink-muted" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
          />

          {importError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-400/50 bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {!isSamplePreview && (
            <div className="border-t border-border-warm pt-3 dark:border-[#2c2a27]">
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-warm px-4 py-2 text-xs font-medium text-ink-muted transition hover:border-red-400 hover:text-red-600 dark:border-[#2c2a27] dark:text-[#a69f95]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset My Dreamline</span>
                </button>
              ) : (
                <div className="rounded-xl border border-red-400/50 bg-red-50/70 p-3 text-center dark:bg-red-950/20">
                  <p className="text-xs font-medium text-red-800 dark:text-red-200">
                    Erase your saved dreams and expenses?
                  </p>
                  <div className="mt-2 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="rounded-lg border border-border-warm bg-surface px-3 py-1 text-xs font-medium text-ink dark:border-[#2c2a27] dark:bg-[#1a1917] dark:text-[#f4f1ec]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onResetState();
                        onClose();
                      }}
                      className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Yes, Reset Everything
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
