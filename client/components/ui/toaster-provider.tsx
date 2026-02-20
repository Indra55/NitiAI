"use client";

import { Toast, Toaster } from "@ark-ui/react/toast";
import { Portal } from "@ark-ui/react/portal";
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from "lucide-react";
import { toaster } from "@/lib/toaster";

const toastTypes = [
  {
    type: "success" as const,
    icon: CheckCircle,
    colors: "bg-green-50/80 dark:bg-green-900/40 border-l-4 border-green-500 text-green-800 dark:text-green-100 backdrop-blur-md",
    iconColor: "text-green-500",
  },
  {
    type: "error" as const,
    icon: AlertCircle,
    colors: "bg-red-50/80 dark:bg-red-900/40 border-l-4 border-red-500 text-red-800 dark:text-red-100 backdrop-blur-md",
    iconColor: "text-red-500",
  },
  {
    type: "warning" as const,
    icon: AlertTriangle,
    colors: "bg-yellow-50/80 dark:bg-yellow-900/40 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-100 backdrop-blur-md",
    iconColor: "text-yellow-500",
  },
  {
    type: "info" as const,
    icon: Info,
    colors: "bg-blue-50/80 dark:bg-blue-900/40 border-l-4 border-blue-500 text-blue-800 dark:text-blue-100 backdrop-blur-md",
    iconColor: "text-blue-500",
  },
];

export function ToasterProvider() {
  return (
    <Portal>
      <div className="fixed inset-0 pointer-events-none z-10000">
        <Toaster toaster={toaster}>
          {(toast) => {
            const toastConfig = toastTypes.find((t) => t.type === toast.type);
            const Icon = toastConfig?.icon || Info;

            return (
              <Toast.Root
                className={`rounded-lg shadow-lg min-w-80 p-4 relative overflow-anywhere transition-all duration-300 ease-default will-change-transform pointer-events-auto ${
                  toastConfig?.colors || "bg-white/80 backdrop-blur-md"
                }`}
                style={{
                  opacity: "var(--opacity)",
                  transform: "translate3d(var(--x), var(--y), 0) scale(var(--scale))",
                  height: "var(--height)",
                }}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      toastConfig?.iconColor || "text-gray-500"
                    }`}
                  />
                  <div className="flex-1">
                    <Toast.Title className="font-semibold text-sm">
                      {toast.title}
                    </Toast.Title>
                    <Toast.Description className="text-sm opacity-80">
                      {toast.description}
                    </Toast.Description>
                  </div>
                </div>
                <Toast.CloseTrigger className="absolute top-3 right-3 p-1 hover:bg-black/10 rounded transition-colors text-foreground/50 hover:text-foreground">
                  <X className="w-3 h-3" />
                </Toast.CloseTrigger>
              </Toast.Root>
            );
          }}
        </Toaster>
      </div>
    </Portal>
  );
}
