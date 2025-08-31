type Props = { title?: string; message?: string };
export default function ErrorBanner({ title = "Something went wrong", message }: Props) {
  if (!message) return null;
  return (
    <div role="alert" className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-800">
      <p className="font-semibold">{title}</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}
