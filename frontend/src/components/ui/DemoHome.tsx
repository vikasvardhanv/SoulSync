import { Link } from "react-router-dom";

export default function DemoHome() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <div className="card">
        <h1 className="text-3xl font-bold mb-2">SoulSync</h1>
        <p className="helper mb-6">A clean, accessible starting point.</p>
        <Link to="/signup" className="btn">Create your profile</Link>
      </div>
    </main>
  );
}
