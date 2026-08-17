export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr
          key={idx}
          className="animate-pulse border-b border-tr-outline-variant/10"
        >
          <td className="px-5 py-4">
            <div className="h-4 w-36 rounded bg-tr-surface-container-high/60" />
            <div className="mt-2 h-3 w-20 rounded bg-tr-surface-container-high/40" />
          </td>
          <td className="px-5 py-4">
            <div className="h-4 w-28 rounded bg-tr-surface-container-high/60" />
            <div className="mt-2 h-3 w-24 rounded bg-tr-surface-container-high/40" />
          </td>
          <td className="px-5 py-4">
            <div className="h-4 w-16 rounded bg-tr-surface-container-high/60" />
          </td>
          <td className="px-5 py-4 text-center">
            <div className="mx-auto h-6 w-20 rounded-full bg-tr-surface-container-high/50" />
          </td>
          <td className="px-5 py-4 text-right">
            <div className="ml-auto h-8 w-20 rounded-lg bg-tr-surface-container-high/60" />
          </td>
        </tr>
      ))}
    </>
  );
}
