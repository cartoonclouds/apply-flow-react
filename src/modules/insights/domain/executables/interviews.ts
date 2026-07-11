import { DrizzleAppDatabase } from "@/db";
import { Waves } from "lucide-react";
import { IInsight, InsightViewDefinition } from "../../types";

export class Interviews implements IInsight {
  constructor(private readonly db: DrizzleAppDatabase) {}

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
