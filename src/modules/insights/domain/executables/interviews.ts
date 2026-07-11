import { Waves } from "lucide-react";
import { IInsight, InsightViewDefinition } from "../../types";

export class Interviews implements IInsight {
  public execute(): Promise<number> {
    return Promise.resolve(12);
  }

  public toView(): InsightViewDefinition {
    return {
      title: "Interviews",
      description: "The number of interviews that are currently scheduled.",
      value: 12,
      icon: Waves, // Replace with the actual icon component or identifier
      color: "green",
    };
  }
}
