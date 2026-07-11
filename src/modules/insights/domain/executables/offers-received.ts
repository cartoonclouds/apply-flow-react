import { DrizzleAppDatabase } from "@/db";
import { BriefcaseBusiness, TrendingUp } from "lucide-react";
import { IInsight, InsightViewDefinition } from "../../types";

export class OffersReceived implements IInsight {
  private value = 0;

  constructor(private readonly db: DrizzleAppDatabase) {}

  public async execute(): Promise<number> {
    const rows = await this.db.query.applicationDocuments.findMany({
      with: {
        document: true,
      },
    });

    const offerApplicationIds = new Set<string>();
    for (const row of rows) {
      const kind = row.document?.kind;
      if (!kind) {
        continue;
      }

      if (kind.toLowerCase().includes("offer")) {
        offerApplicationIds.add(row.applicationId);
      }
    }

    this.value = offerApplicationIds.size;
    return this.value;
  }

  public toView(): InsightViewDefinition {
    return {
      title: "Offers Received",
      description: "The number of offer-stage opportunities recorded.",
      value: this.value,
      subValue: {
        text: `${this.value} total offers logged`,
        direction: "neutral",
        icon: TrendingUp,
      },
      icon: BriefcaseBusiness,
      color: "emerald",
    };
  }
}
