import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRightIcon,
  FileText,
  Eye,
  Trash2,
  Search,
  Pencil,
  Check,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import {
  deletePresentation,
  getMyPresentations,
  getPresentationById,
  updatePresentation,
} from "../services/presentationService";

export default function MyPresentations() {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getMyPresentations();
        setPresentations(response?.data || []);
      } catch (error) {
        toast.error(error.message || "Failed to load presentations");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openPresentation = async (id) => {
    try {
      const response = await getPresentationById(id);
      const record = response?.data;
      const content = record?.content;
      if (!content) {
        throw new Error("Presentation content is missing");
      }

      if (Array.isArray(content?.editorSlides)) {
        navigate("/presentation-view", {
          state: {
            editorSlides: content.editorSlides,
            slideNotes: content.slideNotes || [],
            textAmount: content.textAmount || "detailed",
            presentationId: record?._id || id,
            title: record?.title || "Untitled Presentation",
            themeId: record?.theme || "custom",
            theme: content.theme || null,
            fonts: content.fonts || null,
          },
        });
        return;
      }

      navigate("/preview", {
        state: {
          presentation: content,
          presentationId: record?._id || id,
          title: record?.title || "Untitled Presentation",
          themeId: record?.theme || "cornflower",
          textAmount: content?.textAmount || "detailed",
          theme: content?.theme || null,
        },
      });
    } catch (error) {
      toast.error(error.message || "Failed to open presentation");
    }
  };

  const handleDeletePresentation = async (id, title) => {
    const confirmed = window.confirm(
      `Delete "${title || "Untitled Presentation"}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deletePresentation(id);
      setPresentations((current) => current.filter((item) => item._id !== id));
      toast.success("Presentation deleted");
    } catch (error) {
      toast.error(error.message || "Failed to delete presentation");
    }
  };

  const startRename = (item) => {
    setEditingId(item._id);
    setEditTitle(item.title || "");
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const saveRename = async (id) => {
    const title = editTitle.trim();
    if (!title) {
      cancelRename();
      return;
    }
    try {
      await updatePresentation(id, { title });
      setPresentations((current) =>
        current.map((item) => (item._id === id ? { ...item, title } : item))
      );
      toast.success("Presentation renamed");
    } catch (error) {
      toast.error(error.message || "Failed to rename presentation");
    } finally {
      cancelRename();
    }
  };

  const filteredPresentations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return presentations;
    return presentations.filter((item) =>
      (item.title || "").toLowerCase().includes(q)
    );
  }, [presentations, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold">My Presentations</h1>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decks..."
            aria-label="Search presentations"
            className="w-full bg-sidebar-accent border border-border/80 rounded-xl pl-9 pr-3 py-2 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-1.5 focus:ring-orange-500/25 focus:border-orange-500 transition-all"
          />
        </div>
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {!loading && filteredPresentations.length === 0 && (
        <p className="text-muted-foreground">
          {searchQuery.trim()
            ? "No decks match your search."
            : "No saved presentations yet."}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPresentations.map((item) => (
          <Card key={item._id} size="sm" className="mx-auto w-full max-w-md bg-muted/30">
            <CardHeader>
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
                <FileText className="size-3.5" />
                <span>Saved deck</span>
              </div>
              {editingId === item._id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveRename(item._id);
                      if (e.key === "Escape") cancelRename();
                    }}
                    autoFocus
                    aria-label="Rename presentation"
                    className="w-full text-base font-semibold bg-transparent outline-none border-b border-orange-500/60 pb-0.5"
                  />
                  <button
                    onClick={() => saveRename(item._id)}
                    className="text-emerald-500 hover:text-emerald-600 cursor-pointer shrink-0"
                    title="Save name"
                  >
                    <Check className="size-4" />
                  </button>
                  <button
                    onClick={cancelRename}
                    className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                    title="Cancel"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <CardTitle className="text-base font-semibold line-clamp-2 flex-1">
                    {item.title}
                  </CardTitle>
                  <button
                    onClick={() => startRename(item)}
                    className="text-muted-foreground/60 hover:text-foreground hover:bg-muted p-1 rounded-md cursor-pointer shrink-0"
                    title="Rename"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 py-2 text-sm">
                <li className="flex gap-2">
                  <ChevronRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">Theme: {item.theme || "N/A"}</span>
                </li>
                <li className="flex gap-2">
                  <ChevronRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">Slides: {item.slidesCount || 0}</span>
                </li>
                <li className="flex gap-2">
                  <ChevronRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">Updated: {new Date(item.updatedAt).toLocaleString()}</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button size="sm" className="w-full" onClick={() => openPresentation(item._id)}>
                <Eye className="size-3.5 mr-1.5" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => handleDeletePresentation(item._id, item.title)}
              >
                <Trash2 className="size-3.5 mr-1.5" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
