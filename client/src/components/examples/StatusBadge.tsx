import StatusBadge from "../StatusBadge";

export default function StatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="pending" />
      <StatusBadge status="in-progress" />
      <StatusBadge status="done" />
      <StatusBadge status="blocked" />
      <StatusBadge status="deferred" />
      <StatusBadge status="cancelled" />
    </div>
  );
}
