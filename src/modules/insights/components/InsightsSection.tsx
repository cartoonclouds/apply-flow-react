import { ItemGroup } from "@/components/ui/item";
import InsightCard from "@/modules/insights/components/InsightCard";

import React from "react";
import { INSIGHTS } from "../domain/executables";
import { InsightViewDefinition } from "../types";

function InsightsSection() {
  const insights: InsightViewDefinition[] = INSIGHTS.map((insight) =>
    new insight().toView(),
  );

  return (
    <ItemGroup className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {insights.map((insight, index) => (
        <InsightCard
          key={index}
          title={insight.title}
          value={insight.value}
          subvalue={insight.subvalue}
          icon={insight.icon} // Replace with the actual icon component
          color={insight.color}
        />
      ))}
    </ItemGroup>
  );
}

export default InsightsSection;
