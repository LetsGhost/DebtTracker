"use client";

import { createContext, useState } from "react";
import { Dialog, DialogProps } from "@/frontend/shared/components/Dialog";

export interface DialogContextType {
  open: (config: Omit<DialogProps, "open" | "onOpenChange">) => Promise<boolean>;
}

export const DialogContext = createContext<DialogContextType | undefined>(undefined);

interface DialogState extends Omit<DialogProps, "open" | "onOpenChange"> {
  id: string;
  resolver?: (value: boolean) => void;
}

export const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [dialogs, setDialogs] = useState<DialogState[]>([]);

  const open = async (config: Omit<DialogProps, "open" | "onOpenChange">): Promise<boolean> => {
    return new Promise((resolve) => {
      const id = Math.random().toString(36).substr(2, 9);
      setDialogs((prev) => [
        ...prev,
        {
          ...config,
          id,
          resolver: resolve,
        },
      ]);
    });
  };

  const closeDialog = (id: string, result: boolean) => {
    const dialog = dialogs.find((d) => d.id === id);
    if (dialog?.resolver) {
      dialog.resolver(result);
    }
    setDialogs((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <DialogContext.Provider value={{ open }}>
      {children}
      {dialogs.map((dialog) => {
        const { id, resolver, ...props } = dialog;
        return (
          <Dialog
            key={id}
            open={true}
            onOpenChange={(openState) => {
              if (!openState) {
                closeDialog(id, false);
              }
            }}
            {...props}
            actions={props.actions?.map((action) => ({
              ...action,
              onClick: () => {
                action.onClick();
                closeDialog(id, true);
              },
            }))}
          />
        );
      })}
    </DialogContext.Provider>
  );
};
