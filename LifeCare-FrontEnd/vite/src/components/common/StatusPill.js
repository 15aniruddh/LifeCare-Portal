const TONES = {
  approved: "pill-success",
  accepted: "pill-success",
  rejected: "pill-danger",
  declined: "pill-danger",
  pending: "pill-warning",
};

/** Renders a request status as a coloured pill. */
export default function StatusPill({ status }) {
  const key = String(status || "").toLowerCase();
  return (
    <span className={`pill ${TONES[key] || "pill-neutral"} text-capitalize`}>
      {status || "unknown"}
    </span>
  );
}
