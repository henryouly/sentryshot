import { Minus, Plus } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

// @ts-ignore: This module is legacy and has no types
import { newViewer } from "@/components/viewer/recordings";
// @ts-ignore: This module is legacy and has no types
import { newMonitorNameByID, setGlobals } from "@/components/viewer/libs/common";
import { useRecordingsViewer } from '@/hooks/useRecordings';
import { useEnvQuery } from '@/hooks/useEnv';

export default function Recordings() {
  const contentGridRef = useRef<HTMLDivElement>(null);
  const [gridSize, setGridSize] = useState(3); // Default grid size for recordings view

  const { data: envData, isLoading, isError } = useEnvQuery();

  useRecordingsViewer({ envData, contentGridRef, gridSize });

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
          onClick={() => setGridSize(Math.max(1, gridSize - 1))}
          disabled={gridSize <= 1}
        >
          <Plus className="h-4 w-4" />
        </Button>

        <Button
          className="mr-2"
          variant={"secondary"}
          aria-label="Increase grid size"
          onClick={() => setGridSize(Math.min(4, gridSize + 1))}
          disabled={gridSize >= 4}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      <div
        ref={contentGridRef}
        style={{ display: "grid", gridTemplateColumns: `repeat(${gridSize}, 1fr)`, overflowY: "auto" }}
      />
    </div>
  );
}
