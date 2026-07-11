import { DrizzleAppDatabase } from "@/db";
import { Activity, Minus } from "lucide-react";
import { IInsight, InsightViewDefinition } from "../../types";

export class ActiveApplications implements IInsight {
  private value = 0;

  constructor(private readonly db: DrizzleAppDatabase) {}

  public async execute(): Promise<number> {
    const applications = await this.db.query.applications.findMany();
    this.value = applications.filter((application) => {
      const isArchived = Boolean(application.isArchived);
      const isDeleted = Boolean(application.deletedAt);
      return !isArchived && !isDeleted;
    }).length;

    return this.value;
  }

  public toView(): InsightViewDefinition {
    return {
      title: "Active Applications",
      description: "The number of applications that are currently active.",
      value: this.value,
      subValue: {
        text: `${this.value} active in pipeline`,
        direction: "neutral",
        icon: Minus,
      },
      icon: Activity,
      color: "blue",
    };
  }
}
