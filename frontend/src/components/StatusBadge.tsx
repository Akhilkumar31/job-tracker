import { Status } from '../types'

export default function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, { dot: string; text: string; bg: string }> = {
    APPLIED: {
      dot: 'bg-blue-400',
      text: 'text-blue-300',
      bg: 'bg-[rgba(30,60,120,0.35)]',
    },
    INTERVIEW: {
      dot: 'bg-amber-300',
      text: 'text-amber-300',
      bg: 'bg-[rgba(120,90,0,0.35)]',
    },
    REJECTED: {
      dot: 'bg-rose-400',
      text: 'text-rose-300',
      bg: 'bg-[rgba(120,20,40,0.35)]',
    },
    OFFER: {
      dot: 'bg-emerald-400',
      text: 'text-emerald-300',
      bg: 'bg-[rgba(0,70,40,0.35)]',
    },
  }

  const st = styles[status]

  return (
    <span
      className={`
        inline-flex items-center gap-2
        rounded-full px-3 py-1.5
        font-mono text-[10px] font-semibold
        ${st.bg} text-[#CCCCCC]
        border border-[#2A2D2E]
        shadow-[0_0_0_1px_#000_inset]
        hover:bg-[#2D2D2D] transition-colors
        ${st.text}
      `}
    >
      <span
        className={`h-2 w-2 rounded-full ${st.dot} shadow-[0_0_4px_rgba(0,0,0,0.4)]`}
      />
      {status}
    </span>
  )
}
