import { AlertCircle } from "lucide-react";

interface ErrorBannerProps {
  message?: string;
  title?: string;
}

export default function ErrorBanner({ message, title = "Something went wrong" }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div role="alert" className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
      <div>
        <p className="font-semibold text-red-800">{title}</p>
        <p className="text-sm text-red-700">{message}</p>
      </div>
    </div>
  );
}