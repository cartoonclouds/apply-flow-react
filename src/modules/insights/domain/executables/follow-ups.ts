import { DrizzleAppDatabase } from "@/db";
import { MessageSquare, Minus } from "lucide-react";
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

export class FollowUps implements IInsight {
  private value = 0;

  constructor(private readonly db: DrizzleAppDatabase) {}

  public async execute(): Promise<number> {
    const [applications, contacts] = await Promise.all([
      this.db.query.applications.findMany(),
      this.db.query.applicationContacts.findMany(),
    ]);

    const respondedIds = new Set(
      contacts.map((relation) => relation.applicationId),
    );
    const followUpThreshold = Date.now() - 7 * 24 * 60 * 60 * 1000;

    this.value = applications.filter((application) => {
      const isArchived = Boolean(application.isArchived);
      const isDeleted = Boolean(application.deletedAt);
      if (isArchived || isDeleted) {
        return false;
      }

      if (respondedIds.has(application.id)) {
        return false;
      }

      const appliedAt = toDate(application.appliedAt);
      if (!appliedAt) {
        return false;
      }

      return appliedAt.getTime() <= followUpThreshold;
    }).length;

    return this.value;
  }

  public toView(): InsightViewDefinition {
    return {
      title: "Follow-Ups",
      description: "The number of follow-ups that are currently pending.",
      value: this.value,
      subValue: {
        text: `${this.value} applications need follow-up`,
        direction: "neutral",
        icon: Minus,
      },
      icon: MessageSquare,
      color: "orange",
    };
  }
}
