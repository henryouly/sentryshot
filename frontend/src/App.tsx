import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import LiveView from "./pages/LiveView";
import Recordings from "./pages/Recordings";
import Settings from "./pages/Settings";
import Logs from "./pages/Logs";


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter basename="/frontend">
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <SidebarTrigger />
            <header className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">
                <Routes>
                  <Route path="/" element={<span>Live View</span>} />
                  <Route path="/recordings" element={<span>Recordings</span>} />
                  <Route path="/settings" element={<span>Settings</span>} />
                  <Route path="/logs" element={<span>Logs</span>} />
                </Routes>
              </h2>
              <div />
            </header>
            <div className="flex-1 p-4 overflow-auto">
              <Routes>
                <Route path="/" element={<LiveView />} />
                <Route path="/recordings" element={<Recordings />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/logs" element={<Logs />} />
              </Routes>
            </div>
          </main>
        </SidebarProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;