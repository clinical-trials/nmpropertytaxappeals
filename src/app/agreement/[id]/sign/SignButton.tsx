"use client";

import { useState } from "react";

export function SignButton({
  agreementId,
  documentCount = 1,
}: {
  agreementId: string;
  documentCount?: number;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");

  async function sign() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/esign/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agreementId }),
      });
      if (!res.ok) throw new Error("Could not record your signature.");
      window.location.href = `/agreement/${agreementId}/done`;
    } catch (e: any) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <div className="card p-6">
      <p className="text-sm text-ink-soft">
        By typing your full name and clicking <strong>Adopt &amp; sign</strong>,
        you sign all {documentCount} document{documentCount === 1 ? "" : "s"} in
        this packet and consent to sign electronically. Your IP address and the
        time are recorded with your signature.
      </p>
      <input
        className="field mt-4"
        placeholder="Type your full legal name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        className="btn-primary mt-4 w-full py-3"
        disabled={busy || name.trim().length < 2}
        onClick={sign}
      >
        {busy ? "Recording…" : "Adopt & sign"}
      </button>
      <p className="mt-2 text-center text-xs text-ink-faint">
        Simulated e-signature (mock mode). Connect DocuSign to sign for real.
      </p>
    </div>
  );
}
