import { DrizzleAppDatabase } from "@/db";
import { Activity, Minus } from "lucide-react";
import { IInsight, InsightViewDefinition } from "../../types";

export class ResponseRate implements IInsight {
  private value = 0;

  constructor(private readonly db: DrizzleAppDatabase) {}

  public async execute(): Promise<number> {
    const [applications, contacts] = await Promise.all([
      this.db.query.applications.findMany(),
      this.db.query.applicationContacts.findMany(),
    ]);

    const activeApplications = applications.filter((application) => {
      const isArchived = Boolean(application.isArchived);
      const isDeleted = Boolean(application.deletedAt);
      return !isArchived && !isDeleted;
    });

    if (activeApplications.length === 0) {
      this.value = 0;
      return this.value;
    }

    const activeIds = new Set(
      activeApplications.map((application) => application.id),
    );
    const respondedIds = new Set<string>();

    for (const relation of contacts) {
      if (activeIds.has(relation.applicationId)) {
        respondedIds.add(relation.applicationId);
      }
    }

    this.value = Math.round(
      (respondedIds.size / activeApplications.length) * 100,
    );
    return this.value;
  }

  public toView(): InsightViewDefinition {
    return {
      title: "Response Rate",
      description:
        "The percentage of applications that have received a response.",
      value: `${this.value}%`,
      subValue: {
        text: `${this.value}% of active applications have responses`,
        direction: "neutral",
        icon: Minus,
      },
      icon: Activity,
      color: "blue",
    };
  }
}
