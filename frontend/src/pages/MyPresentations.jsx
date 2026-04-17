import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  deletePresentation,
  getMyPresentations,
  getPresentationById,
} from "../services/presentationService";

const themePalette = {
  dalibio: {
    primary: "#6366f1",
    secondary: "#818cf8",
    background: "#f0f4ff",
    text: "#1e1b4b",
  },
  noir: {
    primary: "#18181b",
    secondary: "#3f3f46",
    background: "#f5f5f5",
    text: "#09090b",
  },
  cornflower: {
    primary: "#6366f1",
    secondary: "#a5b4fc",
    background: "#eef2ff",
    text: "#312e81",
  },
  indigo: {
    primary: "#4f46e5",
    secondary: "#6366f1",
    background: "#e0e7ff",
    text: "#3730a3",
  },
  orbit: {
    primary: "#8b5cf6",
    secondary: "#a78bfa",
    background: "#faf5ff",
    text: "#581c87",
  },
  cosmos: {
    primary: "#ec4899",
    secondary: "#f472b6",
    background: "#fdf4ff",
    text: "#831843",
  },
};

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
    if (!confirmed) {
      return;
    }

    try {
      await deletePresentation(id);
      setPresentations((current) => current.filter((item) => item._id !== id));
    } catch (error) {
      alert(error.message || "Failed to delete presentation");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">My Presentations</h1>

      {loading && <p>Loading...</p>}
      {!loading && presentations.length === 0 && (
        <p>No saved presentations yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presentations.map((item) => (
          (() => {
            const palette = themePalette[item.theme] || themePalette.cornflower;
            return (
          <Card
            key={item._id}
            className="overflow-hidden border-0 p-0 shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
            style={{ background: palette.background }}
          >
            <div
              className="h-28 px-5 py-4"
              style={{
                background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                color: "#fff",
              }}
            >
              <div className="text-xs uppercase tracking-[0.18em] text-white/75">
                Saved deck
              </div>
              <h2 className="mt-3 text-lg font-semibold line-clamp-2">{item.title}</h2>
            </div>
            <div className="p-5" style={{ color: palette.text }}>
            <p className="text-sm opacity-70">
              Theme: {item.theme || "N/A"}
            </p>
            <p className="text-sm opacity-70">
              Slides: {item.slidesCount || 0}
            </p>
            <p className="text-sm opacity-70">
              Updated: {new Date(item.updatedAt).toLocaleString()}
            </p>

            <div className="mt-4 flex gap-3">
              <Button onClick={() => openPresentation(item._id)}>
                Open
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDeletePresentation(item._id, item.title)}
              >
                Delete
              </Button>
            </div>
            </div>
          </Card>
            );
          })()
        ))}
      </div>
    </div>
  );
}
