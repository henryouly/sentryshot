import { Minus, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useEnvQuery } from "@/hooks/useEnv";
import { useLiveViewer } from "@/hooks/useLiveViewer";

export default function LiveView() {
  const contentGridRef = useRef<HTMLDivElement>(null);
  const [gridSize, setGridSize] = useState(3);

  const { data: envData, isLoading, isError } = useEnvQuery();
  useLiveViewer({ envData, contentGridRef, gridSize });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading environment data.</div>;
  }

  return (
    <div>
      <div className="mb-4 flex">
        <Button
          className="mr-2"
          variant={"secondary"}
          aria-label="Decrease grid size"
          onClick={() => setGridSize((v) => Math.max(1, v - 1))}
          disabled={gridSize <= 1}
        >
          <Plus className="h-4 w-4" />
        </Button>

        <Button
          className="mr-2"
          variant={"secondary"}
          aria-label="Increase grid size"
          onClick={() => setGridSize((v) => Math.min(4, v + 1))}
          disabled={gridSize >= 4}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={contentGridRef}
        style={{ display: "grid", gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      />
    </div>
  );
}
