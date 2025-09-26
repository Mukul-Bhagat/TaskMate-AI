import React from "react";
import CustomPieChart from "./CustomPieChart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CustomBarChart = ({ data }) => {
  // Helper function to determine the color of each bar based on its priority
  const getBarColor = (entry) => {
    switch (entry?.priority) {
      case "Low":
        return "#00BC7D"; // Green for Low priority
      case "Medium":
        return "#FE9900"; // Orange for Medium priority
      case "High":
        return "#FF1F57"; // Red for High priority
      default:
        return "#00BC7D"; // Default color
    }
  };

  // Custom component to render the content of the tooltip on hover
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
          <p className="text-xs font-semibold text-purple-800 mb-1">
            {payload[0].payload.priority}
          </p>
          <p className="text-sm text-gray-600">
            Count:{" "}
            <span className="text-sm font-medium text-gray-900">
              {payload[0].payload.count}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Main return statement for the chart component
  return (
    <div className="bg-white mt-6">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid stroke="none" />
          
          <XAxis
            dataKey="priority"
            tick={{ fontSize: 12, fill: "#555" }}
            stroke="none"
          />
          
          <YAxis tick={{ fontSize: 12, fill: "#555" }} stroke="none" />
          
          <Tooltip content={<CustomTooltip/>} cursor={{ fill: "transparent" }} />
          
          <Bar
            dataKey="count"
            nameKey="priority"
            radius={[10, 10, 0, 0]}
            activeDot={{ r: 8, fill: "yellow" }}
            activeStyle={{ fill: "green" }}
          >
            {/* Map over the data to apply a custom color to each bar's Cell */}
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
            ))}
          </Bar>

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;