import { useState } from "react";
import { FilterBar } from "./FilterBar";

/**
 * FilterBar Example - Demonstrates usage for tasks and issues
 */
export default function FilterBarExample() {
  const [taskFilters, setTaskFilters] = useState<{
    status?: string[];
    priority?: string[];
  }>({});

  const [issueFilters, setIssueFilters] = useState<{
    status?: string[];
    priority?: string[];
    severity?: string[];
  }>({});

  return (
    <div className="p-8 space-y-8 bg-[#1a1b26]">
      {/* Task Filters Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#c0caf5]">
          Task Filters Example
        </h2>
        <FilterBar
          filters={taskFilters}
          onChange={setTaskFilters}
          showSeverity={false}
        />
        <div className="mt-4 p-4 bg-[#24283b] rounded-lg">
          <h3 className="text-sm font-medium text-[#7aa2f7] mb-2">
            Active Filters:
          </h3>
          <pre className="text-xs text-[#c0caf5]">
            {JSON.stringify(taskFilters, null, 2)}
          </pre>
        </div>
      </div>

      {/* Issue Filters Example */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#c0caf5]">
          Issue Filters Example (with Severity)
        </h2>
        <FilterBar
          filters={issueFilters}
          onChange={setIssueFilters}
          showSeverity={true}
        />
        <div className="mt-4 p-4 bg-[#24283b] rounded-lg">
          <h3 className="text-sm font-medium text-[#7aa2f7] mb-2">
            Active Filters:
          </h3>
          <pre className="text-xs text-[#c0caf5]">
            {JSON.stringify(issueFilters, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
