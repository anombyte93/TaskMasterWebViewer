import IssueForm from "../IssueForm";

export default function IssueFormExample() {
  return (
    <div className="max-w-md">
      <IssueForm
        onSubmit={(issue) => console.log("New issue:", issue)}
        taskIds={["1", "2", "3", "1.1", "1.2"]}
      />
    </div>
  );
}
