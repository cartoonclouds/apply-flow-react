import React from "react";

function Main({ children }: { children: React.ReactNode }) {
  return <main className="flex flex-col flex-1 p-4 gap-6">{children}</main>;
}

export default Main;
