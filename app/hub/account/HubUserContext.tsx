"use client";

import { createContext, useContext } from "react";

// Signed-in candidate's name/email, provided once by AppShell so deep
// components (e.g. the Calendly booking links) don't need prop threading.
const HubUserContext = createContext<{ name: string; email: string }>({ name: "", email: "" });

export const HubUserProvider = HubUserContext.Provider;

export function useHubUser() {
  return useContext(HubUserContext);
}
