import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type LucideIcon } from "lucide-react";
import React from "react";
import { InsightDirection } from "../types";

interface InsightSubValue {
  text: string;
  direction: InsightDirection;
  icon: LucideIcon;
}

interface InsightCardProps {
  title: string;
  value: number | string;
  subValue?: InsightSubValue;
  icon: LucideIcon;
  color?: string;
}

function insightIconStyles(color?: string) {
  switch (color) {
    case "blue":
      return "bg-blue-100 text-blue-500";
    case "green":
      return "bg-green-100 text-green-500";
    case "red":
      return "bg-red-100 text-red-500";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

function InsightCard({
  title,
  value,
  subValue,
  icon: Icon,
  color,
}: InsightCardProps) {
  let subValueColor = "currentColor";

  switch (subValue?.direction) {
    case "up":
      subValueColor = "text-green-500";
      break;
    case "down":
      subValueColor = "text-red-500";
      break;
    default:
      subValueColor = "currentColor";
  }

  return (
    <Item
      render={<article />}
      variant="outline"
      className="h-full p-4 gap-4 items-start rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <ItemMedia
        className={`flex items-center justify-center size-12 rounded-xl ${insightIconStyles(color)}`}
      >
        <Icon size={26} color={color} />
      </ItemMedia>

      <ItemContent className="grid h-full justify-between">
        <ItemTitle className="text-sm text-muted-foreground">{title}</ItemTitle>

        <ItemDescription className="text-2xl font-medium text-foreground">
          {value}
        </ItemDescription>

        {subValue ? (
          <ItemDescription className="text-sm whitespace-nowrap">
            <subValue.icon
              size={16}
              className={`${subValueColor} inline mr-1`}
            />
            <span className={subValueColor}>
              <Tooltip>
                <TooltipTrigger>{subValue.text}</TooltipTrigger>
                <TooltipContent className={undefined}>
                  {subValue.text}
                </TooltipContent>
              </Tooltip>
            </span>
          </ItemDescription>
        ) : (
          ""
        )}
      </ItemContent>
    </Item>
  );
}

export default InsightCard;
