import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000";

function App() {
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // "info" | "error" | "success"

  async function fetchLinks() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/links`);
      const data = await res.json();
      setLinks(data);
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage("Failed to load links");
    }
  }

  useEffect(() => {
    fetchLinks();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setMessageType("info");
    setLoading(true);

    try {
      const body = { url };
      if (code.trim()) body.code = code.trim();

      const res = await fetch(`${API_BASE_URL}/api/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessageType("error");
        setMessage(data.message || "Error creating link");
      } else {
        setMessageType("success");
        setMessage(`Short URL created: ${data.short_url}`);
        setUrl("");
        setCode("");
        fetchLinks();
      }
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(codeToDelete) {
    setMessage("");
    setMessageType("info");
    try {
      const res = await fetch(`${API_BASE_URL}/api/links/${codeToDelete}`, {
        method: "DELETE",
      });
      if (res.status === 204) {
        setMessageType("success");
        setMessage("Link deleted");
        fetchLinks();
      } else {
        setMessageType("error");
        setMessage("Failed to delete link");
      }
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage("Failed to delete link");
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setMessageType("success");
    setMessage("Copied to clipboard");
  }

  const messageColor =
    messageType === "error"
      ? "text-red-700 bg-red-100 border-red-300"
      : messageType === "success"
      ? "text-green-700 bg-green-100 border-green-300"
      : "text-sky-700 bg-sky-100 border-sky-300";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 py-3 shadow">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 font-bold">
              T
            </span>
            <div>
              <h1 className="text-lg font-semibold">TinyLink</h1>
              <p className="text-xs text-slate-300">
                Simple URL shortener (React + Node + Postgres)
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-xs text-slate-300">
            Backend: <span className="font-mono">{API_BASE_URL}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-5xl space-y-6">
          {/* Form card */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Create Short Link
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Long URL input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Long URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/very/long/url"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 bg-slate-50"
                />
              </div>

              {/* Custom code input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Custom code{" "}
                  <span className="text-xs text-slate-400">
                    (optional, 6–8 chars A–Z, a–z, 0–9)
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    maxLength={8}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 bg-slate-50"
                    placeholder="e.g. yt2025"
                  />
                </div>
              </div>

              {/* Submit button */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create short link"}
                </button>
                <p className="text-xs text-slate-500">
                  Leave custom code empty to auto-generate one.
                </p>
              </div>
            </form>

            {/* Message box */}
            {message && (
              <div
                className={`mt-4 rounded-lg border px-3 py-2 text-xs sm:text-sm ${messageColor}`}
              >
                {message}
              </div>
            )}
          </section>

          {/* Links table */}
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-800">
                All Links
              </h2>
              <span className="text-xs text-slate-500">
                Total: {links.length}
              </span>
            </div>

            {links.length === 0 ? (
              <p className="text-sm text-slate-500">
                No links yet. Create your first short URL above.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs sm:text-sm border-t border-slate-200">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 font-medium">Code</th>
                      <th className="px-3 py-2 font-medium">Short URL</th>
                      <th className="px-3 py-2 font-medium">Original URL</th>
                      <th className="px-3 py-2 font-medium text-center">
                        Clicks
                      </th>
                      <th className="px-3 py-2 font-medium">Last clicked</th>
                      <th className="px-3 py-2 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {links.map((link) => (
                      <tr key={link.id} className="hover:bg-slate-50/60">
                        <td className="px-3 py-2 font-mono text-xs sm:text-sm">
                          {link.code}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <a
                              href={link.short_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sky-600 hover:underline break-all text-xs sm:text-sm"
                            >
                              {link.short_url}
                            </a>
                            <button
                              onClick={() => copyToClipboard(link.short_url)}
                              className="rounded-full border border-slate-300 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-600 hover:bg-slate-100"
                            >
                              Copy
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2 max-w-xs">
                          <a
                            href={link.original_url}
                            target="_blank"
                            rel="noreferrer"
                            title={link.original_url}
                            className="block truncate text-slate-700 hover:underline"
                          >
                            {link.original_url}
                          </a>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                            {link.clicks}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-500">
                          {link.last_clicked_at
                            ? new Date(
                                link.last_clicked_at
                              ).toLocaleString()
                            : "Never"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => handleDelete(link.code)}
                            className="text-xs text-red-600 hover:text-red-700 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
