import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Share2, Copy, Loader2, Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { setPresentationPublic, getPresentationById } from "../services/presentationService";

// Share dialog: toggles public visibility for a deck and copies the read-only
// share link. Only usable when the deck has a saved id (presentationId).
export function ShareDialog({ presentationId, onOpenChange }) {
  const [isPublic, setIsPublic] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Load the deck's current sharing state when opened.
  useEffect(() => {
    let active = true;
    if (!presentationId) return;
    getPresentationById(presentationId)
      .then((res) => {
        if (active) setIsPublic(!!res?.data?.isPublic);
      })
      .catch(() => {
        /* keep default off */
      });
    return () => {
      active = false;
    };
  }, [presentationId]);

  const shareUrl = presentationId
    ? `${window.location.origin}/share/${presentationId}`
    : null;

  const handleToggle = async (checked) => {
    if (!presentationId) {
      toast.error("Save the presentation first to enable sharing.");
      return;
    }
    setToggling(true);
    try {
      await setPresentationPublic(presentationId, checked);
      setIsPublic(checked);
      toast.success(checked ? "Sharing enabled" : "Sharing disabled");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update sharing");
    } finally {
      setToggling(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard");
    } catch (error) {
      toast.error("Could not copy the link automatically");
    }
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-orange-500" />
            Share this presentation
          </DialogTitle>
          <DialogDescription>
            Anyone with the link can view your deck in read-only mode.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-sidebar-accent p-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-foreground">
                Public link
              </span>
              <span className="text-xs text-muted-foreground">
                {isPublic ? "Your deck is visible to anyone with the link." : "Turn this on to generate a shareable link."}
              </span>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={handleToggle}
              disabled={toggling || !presentationId}
              aria-label="Enable public sharing"
            />
          </div>

          {isPublic && shareUrl && (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 rounded-xl border border-border/80 bg-muted px-3 py-2.5 min-w-0">
                <Link2 className="w-4 h-4 shrink-0 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate select-all">
                  {shareUrl}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                title="Copy share link"
                className="shrink-0 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}

          {toggling && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Updating...
            </div>
          )}

          {!presentationId && (
            <p className="text-xs text-muted-foreground">
              Save this presentation first, then you can share it.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}