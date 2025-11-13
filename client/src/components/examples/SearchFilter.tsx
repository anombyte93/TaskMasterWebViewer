import { useState } from "react";
import SearchFilter from "../SearchFilter";
import { type TaskStatus, type TaskPriority } from "@shared/schema";

export default function SearchFilterExample() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");

  const handleClear = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  return (
    <div className="w-full max-w-4xl">
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        onClearFilters={handleClear}
      />
      <div className="mt-4 text-sm text-muted-foreground">
        Active filters: {searchQuery && `Search: "${searchQuery}"`} 
        {statusFilter !== "all" && `, Status: ${statusFilter}`}
        {priorityFilter !== "all" && `, Priority: ${priorityFilter}`}
      </div>
    </div>
  );
}
