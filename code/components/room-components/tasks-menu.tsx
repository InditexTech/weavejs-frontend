import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ListTodo } from "lucide-react";
import { TaskMetadata, useCollaborationRoom } from "@/store/store";
import { TASKS_TYPES_MAP } from "./ai-tasks/constants";

export const TasksMenu = () => {
  const [tasksMenuOpen, setTasksMenuOpen] = React.useState(false);

  const tasks = useCollaborationRoom((state) => state.tasks);

  const finishedTasks = React.useMemo(() => {
    return tasks.filter((task: TaskMetadata) =>
      ["completed"].includes(task.status)
    );
  }, [tasks]);

  const recentTasks = React.useMemo(() => {
    return tasks.filter((task: TaskMetadata) =>
      ["new", "processing", "completed", "failed"].includes(task.status)
    );
  }, [tasks]);

  return (
    <DropdownMenu open={tasksMenuOpen} onOpenChange={setTasksMenuOpen}>
      <DropdownMenuTrigger asChild>
        <div
          className="relative w-full h-[32px] flex gap-1 justify-start items-center"
          role="button"
        >
          <button className="relative cursor-pointer">
            {finishedTasks.length > 0 && (
              <Badge
                className="absolute top-[-12px] right-[-12px] h-5 min-w-5 rounded-full px-1 font-inter tabular-nums"
                variant="destructive"
              >
                {finishedTasks.length}
              </Badge>
            )}
            <ListTodo size={20} strokeWidth={1} />
          </button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        sideOffset={12}
        className="rounded-none p-0"
      >
        <DropdownMenuLabel className="px-2 py-1 pt-2 text-zinc-600 font-inter text-xs">
          Tasks
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {recentTasks.length === 0 && (
          <DropdownMenuLabel className="px-2 py-1 pt-2 text-zinc-600 font-inter text-xs">
            No tasks available
          </DropdownMenuLabel>
        )}
        {recentTasks.length > 0 && (
          <DropdownMenuGroup>
            {recentTasks.map((task, index, arr) => (
              <React.Fragment key={task.jobId}>
                <DropdownMenuItem className="text-foreground cursor-default hover:rounded-none w-full text-xs">
                  <div className="w-[320px] flex flex-col gap-1">
                    <div className="font-inter text-xs text-foreground">
                      {TASKS_TYPES_MAP[task.type]}
                    </div>
                    <div className="font-inter text-sm">{task.status}</div>
                  </div>
                </DropdownMenuItem>
                {index < arr.length - 1 && <DropdownMenuSeparator />}
              </React.Fragment>
            ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
