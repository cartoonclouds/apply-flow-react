import { ItemGroup } from "@/components/ui/item";
import InsightCard from "@/modules/insights/components/InsightCard";

import { db } from "@/db";
import * as React from "react";
import { useEffect, useState } from "react";
import { INSIGHTS } from "../domain/executables";
import { InsightViewDefinition } from "../types";

function InsightsSection() {
  const [insights, setInsights] = useState<InsightViewDefinition[]>([]);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const nextInsights = await Promise.all(
        INSIGHTS.map(async (InsightConstructor) => {
          const insight = new InsightConstructor(db);
          await insight.execute();
          return insight.toView();
        }),
      );

      if (isMounted) {
        setInsights(nextInsights);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ItemGroup className="grid grid-cols-1 gap-4 @md/main:grid-cols-2 @lg/main:grid-cols-3">
      {insights.map((insight, index) => (
        <InsightCard
          key={index}
          title={insight.title}
          value={insight.value}
          subValue={insight.subValue}
          icon={insight.icon} // Replace with the actual icon component
          color={insight.color}
        />
      ))}
    </ItemGroup>
  );
}

export default InsightsSection;
