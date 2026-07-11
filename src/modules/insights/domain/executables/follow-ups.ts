import { DrizzleAppDatabase } from "@/db";
import { MessageSquare, TrendingUp } from "lucide-react";
import { IInsight, InsightViewDefinition } from "../../types";

export class FollowUps implements IInsight {
  constructor(private readonly db: DrizzleAppDatabase) {}

  public execute(): Promise<number> {
    return Promise.resolve(5);
  }

  public toView(): InsightViewDefinition {
    return {
      title: "Follow-Ups",
      description: "The number of follow-ups that are currently pending.",
      value: 5,
      subValue: {
        text: "<b>+2</b> since last week",
        direction: "up",
        icon: TrendingUp, // Replace with the actual icon component or identifier
      },
      icon: MessageSquare, // Replace with the actual icon component or identifier
      color: "orange",
    };
  }
}
