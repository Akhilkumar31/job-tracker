import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

type StatusDatum = { name: string; value: number }

// VS Code Dark Theme–inspired colors
const COLORS_BY_STATUS: Record<string, string> = {
  APPLIED:  '#569CD6', // VS Code blue
  INTERVIEW:'#4EC9B0', // VS Code teal
  OFFER:    '#C586C0', // VS Code purple
  REJECTED: '#D16969', // VS Code red
}

const FALLBACK_COLORS = [
  '#569CD6',
  '#4EC9B0',
  '#C586C0',
  '#D16969',
]

// VS Code–style tooltip (like a small popup notification)
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null

  const item = payload[0]
  const label = item?.payload?.name ?? 'Status'
  const value = item?.value ?? 0

  return (
    <div className="rounded-md border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs shadow-lg shadow-black/50 backdrop-blur-sm font-mono">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="font-semibold text-slate-100">{label}</span>
      </div>
      <div className="mt-1 text-slate-300">
        {value} application{value === 1 ? '' : 's'}
      </div>
    </div>
  )
}

// VS Code–like badge legend at the bottom
const CustomLegend = ({ payload }: any) => {
  if (!payload || !payload.length) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
      <div className="pointer-events-auto inline-flex flex-wrap items-center gap-3 rounded-md border border-slate-800 bg-slate-900/90 px-4 py-2 text-[11px] font-mono text-slate-200 shadow-md shadow-black/40">
        {payload.map((entry: any, idx: number) => {
          const label = entry?.payload?.name ?? entry.value

          return (
            <div
              key={`${label}-${idx}`}
              className="flex items-center gap-2 text-[11px]"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-slate-950/80"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-300">{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function StatusPie({ data }: { data: StatusDatum[] }) {
  const chartData = data ?? []
  const hasData = chartData.length > 0
  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  if (!hasData) {
    return (
      <div className="flex h-80 items-center justify-center">
        <div className="rounded-md border border-dashed border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-mono text-slate-400">
          No data yet — add applications to see your breakdown.
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-80 w-full md:h-96 rounded-xl border border-slate-800 bg-slate-950/70">
      {/* Center label */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center font-mono">
          <span className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
            TOTAL
          </span>
          <span className="text-3xl font-bold text-slate-100">
            {total}
          </span>
          <span className="mt-1 text-[10px] text-slate-600">
            applications
          </span>
        </div>
      </div>

      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={75}
            outerRadius={120}
            paddingAngle={3}
            cornerRadius={8}
            cx="50%"
            cy="50%"
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={900}
            animationEasing="ease-out"
            labelLine={false}
          >
            {chartData.map((entry, idx) => {
              const color =
                COLORS_BY_STATUS[entry.name] ??
                FALLBACK_COLORS[idx % FALLBACK_COLORS.length]

              return (
                <Cell
                  key={`cell-${idx}`}
                  fill={color}
                  stroke="#020617" // subtle outline
                  strokeWidth={1.5}
                />
              )
            })}
          </Pie>

          <Tooltip content={<CustomTooltip />} />
          <Legend content={(props) => <CustomLegend {...props} />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
