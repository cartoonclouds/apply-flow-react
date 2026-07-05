import { ItemGroup } from "@/components/ui/item";
import InsightCard from "@/modules/insights/components/InsightCard";
import {
    Activity,
    ChartArea,
    TrendingDown,
    TrendingUp,
    Waves,
} from "lucide-react";

import React from "react";

function InsightsSection() {
  const insights = [
    {
      title: "Active Applications",
      value: 28,
      subValue: {
        text: "<b>+6</b> since last week",
        direction: "up" as const,
        icon: TrendingUp,
      },
      icon: Activity, // Replace with the actual icon component
      color: "blue",
    },
    {
      title: "Interviews",
      value: 42,
      icon: Waves, // Replace with the actual icon component
      color: "green",
    },
    {
      title: "Follow-ups due",
      value: 15,
      icon: ChartArea, // Replace with the actual icon component
      color: "red",
    },
    {
      title: "Response Rate",
      value: 75,
      subValue: {
        text: "-5% since last month",
        direction: "down" as const,
        icon: TrendingDown,
      },
      icon: Activity, // Replace with the actual icon component
      color: "blue",
    },
  ];

  return (
    <ItemGroup className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
