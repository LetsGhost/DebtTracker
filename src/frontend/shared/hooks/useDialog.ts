"use client";

import { useContext } from "react";
import { DialogContext } from "@/frontend/shared/providers/DialogProvider";

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};
