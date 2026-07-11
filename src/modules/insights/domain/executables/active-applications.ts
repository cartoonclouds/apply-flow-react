import { Activity, TrendingUp } from "lucide-react";
import { IInsight, InsightViewDefinition } from "../../types";

export class ActiveApplications implements IInsight {
  public execute(): Promise<number> {
    return Promise.resolve(28);
  }

  public toView(): InsightViewDefinition {
    return {
      title: "Active Applications",
      description: "The number of applications that are currently active.",
      value: 28,
      subvalue: {
        text: "<b>+6</b> since last week",
        direction: "up",
        icon: TrendingUp, // Replace with the actual icon component or identifier
      },
      icon: Activity, // Replace with the actual icon component or identifier
      color: "blue",
    };
  }
}
