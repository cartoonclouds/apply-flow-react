import { DrizzleAppDatabase } from "@/db";
import { Archive, TrendingDown } from "lucide-react";
import { IInsight, InsightViewDefinition } from "../../types";

export class ArchivedApplications implements IInsight {
  constructor(private readonly db: DrizzleAppDatabase) {}

  public execute(): Promise<number> {
    return Promise.resolve(14);
  }

  public toView(): InsightViewDefinition {
    return {
      title: "Archived Applications",
      description: "Applications that are no longer active in your pipeline.",
      value: 14,
      subValue: {
        text: "-2 vs last month",
        direction: "down",
        icon: TrendingDown,
      },
      icon: Archive,
      color: "slate",
    };
  }
}
