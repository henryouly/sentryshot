import { createContext, createResource, JSX, Resource, useContext, onCleanup } from 'solid-js';

export type EnvData = {
  flags?: Record<string, unknown>;
  monitorConfig?: Record<string, unknown>;
  monitorsInfo?: Record<string, unknown>;
  monitor_info?: Record<string, unknown>;
  monitorGroup?: Record<string, unknown>;
  logSources?: Array<unknown>;
  csrfToken?: string;
};

// Create a context and provide an initial value.
const DataContext = createContext<Resource<EnvData>>({} as Resource<EnvData>);

export const EnvDataProvider = (props: { children: JSX.Element }) => {
  const abortController = new AbortController();
  onCleanup(() => abortController.abort());

  // createResource is called once when the provider is created.
  const [envData] = createResource<EnvData>(async () => {
    const res = await fetch("/frontend/api/env", {
      signal: abortController.signal
    });
    if (!res.ok) {
      throw new Error(`API call failed with status: ${res.status}`);
    }
    return res.json() as Promise<EnvData>;
  });

  return (
    <DataContext.Provider value={envData}>
      {props.children}
    </DataContext.Provider>
  );
};

export const useEnvData = () => useContext(DataContext);
