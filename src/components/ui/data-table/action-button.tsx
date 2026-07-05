import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import React from "react";

interface ActionButtonItem {
  label: string;
  onClick?: () => void;
}

const ACTION_BUTTON_SEPARATOR = "ActionButtonSeparator" as const;

type ActionButtonSeparator = typeof ACTION_BUTTON_SEPARATOR;
type ActionButtonChild = ActionButtonItem | ActionButtonSeparator;

interface ActionButtonProps {
  children: ActionButtonChild[] | ActionButtonChild;
}

function isActionButtonSeparator(
  child: ActionButtonChild,
): child is ActionButtonSeparator {
  return child === ACTION_BUTTON_SEPARATOR;
}

function ActionButton({ children }: ActionButtonProps) {
  const actionButtonChildren = Array.isArray(children) ? children : [children];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-fit">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="" inset={false}>
            Actions
          </DropdownMenuLabel>

          {actionButtonChildren.map((child, index) => {
            if (isActionButtonSeparator(child)) {
              return <DropdownMenuSeparator key={index} className="" />;
            } else {
              return (
                <DropdownMenuItem
                  key={index}
                  className=""
                  inset={false}
                  onClick={child.onClick ?? (() => {})}
                >
                  {child.label}
                </DropdownMenuItem>
              );
            }
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ACTION_BUTTON_SEPARATOR, ActionButton };
export type { ActionButtonItem, ActionButtonSeparator };

