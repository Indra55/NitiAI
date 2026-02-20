"use client";

import { Toast, Toaster } from "@ark-ui/react/toast";
import { Portal } from "@ark-ui/react/portal";
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from "lucide-react";
import { toaster } from "@/lib/toaster";

const toastTypes = [
  {
    type: "success" as const,
    title: "Success!",
    description: "Your changes have been saved.",
    icon: CheckCircle,
    colors: "bg-green-50/80 dark:bg-green-900/40 border-l-4 border-green-500 text-green-800 dark:text-green-100 backdrop-blur-md",
    iconColor: "text-green-500",
  },
  {
    type: "error" as const,
    title: "Error occurred",
    description: "Something went wrong. Please try again.",
    icon: AlertCircle,
    colors: "bg-red-50/80 dark:bg-red-900/40 border-l-4 border-red-500 text-red-800 dark:text-red-100 backdrop-blur-md",
    iconColor: "text-red-500",
  },
  {
    type: "warning" as const,
    title: "Warning",
    description: "This action cannot be undone.",
    icon: AlertTriangle,
    colors: "bg-yellow-50/80 dark:bg-yellow-900/40 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-100 backdrop-blur-md",
    iconColor: "text-yellow-500",
  },
  {
    type: "info" as const,
    title: "New update available",
    description: "Version 2.1.0 is now available for download.",
    icon: Info,
    colors: "bg-blue-50/80 dark:bg-blue-900/40 border-l-4 border-blue-500 text-blue-800 dark:text-blue-100 backdrop-blur-md",
    iconColor: "text-blue-500",
  },
];

export default function ToastTypes() {
  return (
    <div className="bg-white dark:bg-gray-800 w-full px-4 py-12 rounded-xl flex flex-col items-center">
      <div className="flex flex-wrap gap-2 justify-center">
        {toastTypes.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() =>
              toaster.create({
                title: item.title,
                description: item.description,
                type: item.type,
              })
            }
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs font-medium capitalize"
          >
            {item.type}
          </button>
        ))}
      </div>

      <Portal>
        <Toaster toaster={toaster}>
          {(toast) => {
            const toastConfig = toastTypes.find((t) => t.type === toast.type);
            const Icon = toastConfig?.icon || Info;

            return (
              <Toast.Root
                className={`rounded-lg shadow-lg min-w-80 p-4 relative overflow-anywhere transition-all duration-300 ease-default will-change-transform h-(--height) opacity-(--opacity) translate-x-(--x) translate-y-(--y) scale-(--scale) z-(--z-index) ${
                  toastConfig?.colors || "bg-white/80 backdrop-blur-md"
                }`}
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
                <Toast.CloseTrigger className="absolute top-3 right-3 p-1 hover:bg-black/10 rounded transition-colors">
                  <X className="w-3 h-3" />
                </Toast.CloseTrigger>
              </Toast.Root>
            );
          }}
        </Toaster>
      </Portal>
    </div>
  );
}
