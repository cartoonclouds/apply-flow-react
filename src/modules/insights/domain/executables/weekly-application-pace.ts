import { DrizzleAppDatabase } from "@/db";
import { Gauge, TrendingUp } from "lucide-react";
import { IInsight, InsightViewDefinition } from "../../types";

function toDate(value: unknown): Date | null {
  if (value == null) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const normalized = String(value).replace(" ", "T");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export class WeeklyApplicationPace implements IInsight {
  private value = 0;

  constructor(private readonly db: DrizzleAppDatabase) {}

  public async execute(): Promise<number> {
    const applications = await this.db.query.applications.findMany();
    const now = Date.now();
    const fourWeeksAgo = now - 28 * 24 * 60 * 60 * 1000;

    let inWindow = 0;
    for (const application of applications) {
      const appliedAt = toDate(application.appliedAt);
      if (!appliedAt) {
        continue;
      }

      if (appliedAt.getTime() >= fourWeeksAgo) {
        inWindow += 1;
      }
    }

    this.value = Number((inWindow / 4).toFixed(1));
    return this.value;
  }

  public toView(): InsightViewDefinition {
    return {
      title: "Weekly Application Pace",
      description: "Average number of applications submitted per week.",
      value: this.value,
      subValue: {
        text: `${this.value} applications/week`,
        direction: "neutral",
        icon: TrendingUp,
      },
      icon: Gauge,
      color: "violet",
    };
  }
}
