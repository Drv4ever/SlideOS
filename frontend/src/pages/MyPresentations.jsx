import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">My Presentations</h1>

      {loading && <p>Loading...</p>}
      {!loading && presentations.length === 0 && (
        <p>No saved presentations yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presentations.map((item) => (
          <Card key={item._id} className="p-5">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="text-sm opacity-70 mt-1">
              Theme: {item.theme || "N/A"}
            </p>
            <p className="text-sm opacity-70">
              Slides: {item.slidesCount || 0}
            </p>
            <p className="text-sm opacity-70">
              Updated: {new Date(item.updatedAt).toLocaleString()}
            </p>

            <Button className="mt-4" onClick={() => openPresentation(item._id)}>
              Open
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
