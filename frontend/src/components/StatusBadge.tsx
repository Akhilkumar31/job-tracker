import type { Status } from "../types";

type Props = {
  status?: Status | string | null;
};

const styles: Record<
  Status,
  { label: string; bg: string; text: string; ring?: string }
> = {
  SAVED: {
    label: "Saved",
    bg: "bg-gray-100",
    text: "text-gray-700",
    ring: "ring-gray-200",
  },
  APPLIED: {
    label: "Applied",
    bg: "bg-blue-100",
    text: "text-blue-700",
    ring: "ring-blue-200",
  },
  PHONE_SCREEN: {
    label: "Phone Screen",
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    ring: "ring-indigo-200",
  },
  INTERVIEW: {
    label: "Interview",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    ring: "ring-yellow-200",
  },
  OFFER: {
    label: "Offer",
    bg: "bg-green-100",
    text: "text-green-700",
    ring: "ring-green-200",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-red-100",
    text: "text-red-700",
    ring: "ring-red-200",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    bg: "bg-slate-100",
    text: "text-slate-700",
    ring: "ring-slate-200",
  },
};

const fallback = {
  label: "Unknown",
  bg: "bg-gray-100",
  text: "text-gray-700",
  ring: "ring-gray-200",
};

export default function StatusBadge({ status }: Props) {
  // Normalize whatever comes in:
  // - handle undefined/null
  // - trim spaces
  // - uppercase so "applied" becomes "APPLIED"
  const normalized = (status ?? "")
    .toString()
    .trim()
    .toUpperCase() as Status;

  // Key line that prevents crashing:
  const st = styles[normalized] ?? fallback;

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
        st.bg,
        st.text,
        st.ring ?? "ring-gray-200",
      ].join(" ")}
      title={status ?? ""}
    >
      {st.label}
    </span>
  );
}
