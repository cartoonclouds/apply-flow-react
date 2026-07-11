import { DrizzleAppDatabase } from "@/db";
import { Minus, Waves } from "lucide-react";
import { IInsight, InsightViewDefinition } from "../../types";

export class Interviews implements IInsight {
  private value = 0;

  constructor(private readonly db: DrizzleAppDatabase) {}

  public async execute(): Promise<number> {
    const applications = await this.db.query.applications.findMany();

    this.value = applications.filter((application) => {
      const process = application.interviewProcess?.trim();
      return Boolean(process);
    }).length;

    return this.value;
  }

  public toView(): InsightViewDefinition {
    return {
      title: "Interviews",
      description: "The number of interviews that are currently scheduled.",
      value: this.value,
      subValue: {
        text: `${this.value} applications include interview tracking`,
        direction: "neutral",
        icon: Minus,
      },
      icon: Waves,
      color: "green",
    };
  }
}
