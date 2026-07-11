import Sidebar from "@/components/layout/Sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Outlet } from "@tanstack/react-router";
import React from "react";
import Header from "./components/layout/Header";
import Main from "./components/layout/Main";
import { AppProviders } from "./providers/AppProviders";

function App() {
  return (
    <AppProviders>
      <ResizablePanelGroup
        orientation="horizontal"
        className="min-h-lvh w-full rounded-lg border"
      >
        <ResizablePanel
          defaultSize="15%"
          minSize="15%"
          maxSize="50%"
          className="min-w-[15%]!"
        >
          <Sidebar />
        </ResizablePanel>

        <ResizableHandle withHandle className={undefined} />

        <ResizablePanel defaultSize="85%">
          <Header />
          <Main>
            <Outlet />
          </Main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </AppProviders>
  );
}

export default App;
