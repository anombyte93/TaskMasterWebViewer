import ProgressBar from "../ProgressBar";

export default function ProgressBarExample() {
  return (
    <div className="space-y-4 w-64">
      <ProgressBar completed={3} total={5} />
      <ProgressBar completed={1} total={4} />
      <ProgressBar completed={5} total={5} />
    </div>
  );
}
