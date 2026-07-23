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
  fluent: {
    primary: '#0078d4',
    accent: '#ffb900',
    background: '#ffffff',
    text: '#201f1e',
  },
  dalibio: {
    primary: '#c2410c',
    accent: '#22d3ee',
    background: '#ffffff',
    text: '#1e1b4b',
  },
  noir: {
    primary: '#18181b',
    accent: '#facc15',
    background: '#ffffff',
    text: '#09090b',
  },
  terra: {
    primary: '#b45309',
    accent: '#0d9488',
    background: '#fffbf5',
    text: '#451a03',
  },
  indigo: {
    primary: '#ea580c',
    accent: '#f43f5e',
    background: '#ffffff',
    text: '#7c2d12',
  },
  orbit: {
    primary: '#7c3aed',
    accent: '#34d399',
    background: '#ffffff',
    text: '#2e1065',
  },
  midnight: {
    primary: '#f8fafc',
    accent: '#22d3ee',
    background: '#0f172a',
    text: '#e2e8f0',
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
                background: `linear-gradient(135deg, ${palette.primary}, ${palette.accent})`,
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
              <Button variant="destructive" onClick={() => openPresentation(item._id)}>
                Open
              </Button>
              <Button
                variant="destructive"
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
