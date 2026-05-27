import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type NotificationVariant = "success" | "info" | "warning" | "error";

type AppNotification = {
  id: number;
  title: string;
  message?: string;
  variant: NotificationVariant;
};

type ShowNotificationInput = {
  title: string;
  message?: string;
  variant?: NotificationVariant;
};

type NotificationContextValue = {
  notification: AppNotification | null;
  showNotification: (notification: ShowNotificationInput) => void;
  clearNotification: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<AppNotification | null>(null);

  const showNotification = ({
    title,
    message,
    variant = "info",
  }: ShowNotificationInput) => {
    setNotification({
      id: Date.now(),
      title,
      message,
      variant,
    });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    if (!notification) return;

    const timeoutId = window.setTimeout(() => {
      setNotification(null);
    }, 3500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notification]);

  const value = useMemo(
    () => ({
      notification,
      showNotification,
      clearNotification,
    }),
    [notification]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification must be used inside NotificationProvider");
  }

  return context;
}

function getNotificationStyles(variant: NotificationVariant) {
  if (variant === "success") {
    return {
      icon: CheckCircle2,
      iconClass: "bg-emerald-500 text-black",
      borderClass: "border-emerald-500/25",
    };
  }

  if (variant === "warning") {
    return {
      icon: AlertTriangle,
      iconClass: "bg-orange-500 text-black",
      borderClass: "border-orange-500/30",
    };
  }

  if (variant === "error") {
    return {
      icon: XCircle,
      iconClass: "bg-red-500 text-white",
      borderClass: "border-red-500/30",
    };
  }

  return {
    icon: Info,
    iconClass: "bg-orange-500 text-black",
    borderClass: "border-neutral-800",
  };
}

export function AppNotificationViewport() {
  const { notification, clearNotification } = useNotification();

  if (!notification) return null;

  const styles = getNotificationStyles(notification.variant);
  const Icon = styles.icon;

  return (
    <div className="pointer-events-none absolute left-4 right-4 top-5 z-[90] sm:top-10">
      <div
        className={`pointer-events-auto rounded-2xl border ${styles.borderClass} bg-neutral-950/95 px-4 py-3 shadow-2xl backdrop-blur`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${styles.iconClass}`}
          >
            <Icon className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">
              {notification.title}
            </p>

            {notification.message && (
              <p className="mt-1 text-xs leading-5 text-neutral-400">
                {notification.message}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={clearNotification}
            className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}