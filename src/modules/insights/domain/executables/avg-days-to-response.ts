import { DrizzleAppDatabase } from "@/db";
import { Clock3, TrendingDown } from "lucide-react";
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

export class AvgDaysToResponse implements IInsight {
  private value = 0;

  constructor(private readonly db: DrizzleAppDatabase) {}

  public async execute(): Promise<number> {
    const [applications, contacts] = await Promise.all([
      this.db.query.applications.findMany(),
      this.db.query.applicationContacts.findMany(),
    ]);

    const firstContactByApplication = new Map<string, Date>();
    for (const relation of contacts) {
      const contactDate = toDate(relation.createdAt);
      if (!contactDate) {
        continue;
      }

      const existing = firstContactByApplication.get(relation.applicationId);
      if (!existing || contactDate < existing) {
        firstContactByApplication.set(relation.applicationId, contactDate);
      }
    }

    let totalDays = 0;
    let samples = 0;

    for (const application of applications) {
      const appliedAt = toDate(application.appliedAt);
      const firstResponse = firstContactByApplication.get(application.id);

      if (!appliedAt || !firstResponse || firstResponse < appliedAt) {
        continue;
      }

      const diffMs = firstResponse.getTime() - appliedAt.getTime();
      totalDays += diffMs / (1000 * 60 * 60 * 24);
      samples += 1;
    }

    this.value = samples === 0 ? 0 : Number((totalDays / samples).toFixed(1));
    return this.value;
  }

  public toView(): InsightViewDefinition {
    return {
      title: "Avg Days to Response",
      description: "Average wait time between application and first response.",
      value: `${this.value} days`,
      subValue: {
        text: `${this.value} day average response lag`,
        direction: "neutral",
        icon: TrendingDown,
      },
      icon: Clock3,
      color: "teal",
    };
  }
}
