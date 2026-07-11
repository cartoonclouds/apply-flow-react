import { Activity, TrendingDown } from "lucide-react";
import { IInsight, InsightViewDefinition } from "../../types";

export class ResponseRate implements IInsight {
  public execute(): Promise<number> {
    return Promise.resolve(85);
  }

  public toView(): InsightViewDefinition {
    return {
      title: "Response Rate",
      description:
        "The percentage of applications that have received a response.",
      value: 85,
      subValue: {
        text: "-5% since last month",
        direction: "down",
        icon: TrendingDown, // Replace with the actual icon component or identifier
      },
      icon: Activity, // Replace with the actual icon component or identifier
      color: "blue",
    };
  }
}
