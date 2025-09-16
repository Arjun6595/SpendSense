export function TwoByTwoGrid(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  )
}
