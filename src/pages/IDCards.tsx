import { useEffect, useState } from "react";

interface StoredDocument {
  id: string;
  fileName: string;
  displayName: string;
  docType: string;
  ocrText: string;
  previewUrl: string;
  createdAt: number;
}

export default function IDCards() {
  const [docs, setDocs] = useState<StoredDocument[]>([]);
  const [view, setView] = useState<"type" | "name">("type");

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem("documents") || "[]") as StoredDocument[];
    setDocs(stored);
  }, []);

  const byType = docs.reduce<Record<string, StoredDocument[]>>((acc, doc) => {
    acc[doc.docType] = acc[doc.docType] || [];
    acc[doc.docType].push(doc);
    return acc;
  }, {});

  const byName = docs.reduce<Record<string, StoredDocument[]>>((acc, doc) => {
    acc[doc.displayName] = acc[doc.displayName] || [];
    acc[doc.displayName].push(doc);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setView("type")}
          className={view === "type" ? "font-bold" : ""}
        >
          By Type
        </button>
        <button
          onClick={() => setView("name")}
          className={view === "name" ? "font-bold" : ""}
        >
          By Name
        </button>
      </div>

      {view === "type" &&
        Object.entries(byType).map(([type, items]) => (
          <Section key={type} title={type} items={items} />
        ))}

      {view === "name" &&
        Object.entries(byName).map(([name, items]) => (
          <Section key={name} title={name} items={items} />
        ))}
    </div>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: StoredDocument[];
}) {
  return (
    <div className="mb-6">
      <h2 className="font-semibold mb-2">{title}</h2>
      <div className="grid grid-cols-2 gap-3">
        {items.map((doc) => (
          <div
            key={doc.id}
            className="border rounded-lg p-2 bg-background"
          >
            {doc.previewUrl && (
              <img
                src={doc.previewUrl}
                alt=""
                className="w-full h-28 object-cover rounded mb-2"
              />
            )}
            <div className="text-sm font-medium">{doc.fileName}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(doc.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
