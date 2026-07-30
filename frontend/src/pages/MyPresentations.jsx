import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRightIcon, FileText, Eye, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  deletePresentation,
  getMyPresentations,
  getPresentationById,
} from "../services/presentationService";

export default function MyPresentations() {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getMyPresentations();
        setPresentations(response?.data || []);
      } catch (error) {
        alert(error.message || "Failed to load presentations");
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
      alert(error.message || "Failed to open presentation");
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
    } catch (error) {
      alert(error.message || "Failed to delete presentation");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">My Presentations</h1>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {!loading && presentations.length === 0 && (
        <p className="text-muted-foreground">No saved presentations yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presentations.map((item) => (
          <Card key={item._id} size="sm" className="mx-auto w-full max-w-md bg-muted/30">
            <CardHeader>
              <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
                <FileText className="size-3.5" />
                <span>Saved deck</span>
              </div>
              <CardTitle className="text-base font-semibold line-clamp-2">
                {item.title}
              </CardTitle>
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
