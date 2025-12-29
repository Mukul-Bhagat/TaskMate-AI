import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import CustomBarChart from "../../components/Charts/CustomBarChart";

const COLORS = ["#8D51FF", "#00B8DB", "#7BCE00"];

const Analytics = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [pieChartData, setPieChartData] = useState([]);
    const [barChartData, setBarChartData] = useState([]);

    // Prepare Chart Data
    const prepareChartData = (data) => {
        const taskDistribution = data?.taskDistribution || null;
        const taskPriorityLevels = data?.taskPriorityLevels || null;

        const taskDistributionData = [
            { status: "Pending", count: taskDistribution?.Pending || 0 },
            { status: "In Progress", count: taskDistribution?.InProgress || 0 },
            { status: "Completed", count: taskDistribution?.Completed || 0 },
        ];

        setPieChartData(taskDistributionData);

        const PriorityLevelData = [
            { priority: "Low", count: taskPriorityLevels?.Low || 0 },
            { priority: "Medium", count: taskPriorityLevels?.Medium || 0 },
            { priority: "High", count: taskPriorityLevels?.High || 0 },
        ];

        setBarChartData(PriorityLevelData);
    };

    const getDashboardData = async () => {
        try {
            const response = await axiosInstance.get(
                API_PATHS.TASKS.GET_DASHBOARD_DATA
            );
            if (response.data) {
                setDashboardData(response.data);
                prepareChartData(response.data?.charts || null)
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };


    useEffect(() => {
        getDashboardData();
    }, []);

    return (
        <div className="p-8 bg-[#F8F9FA] dark:bg-[#0f172a] min-h-full font-sans transition-colors duration-300">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 dark:text-white">Performance Analytics</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
                {/* Pie Chart */}
                <div>
                    <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="font-medium text-gray-800 dark:text-white">Task Distribution</h5>
                        </div>

                        <CustomPieChart
                            data={pieChartData}
                            label="Total Tasks"
                            colors={COLORS}
                        />
                    </div>
                </div>

                {/* Bar Chart */}
                <div>
                    <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="font-medium text-gray-800 dark:text-white">Task Priority Level</h5>
                        </div>

                        <CustomBarChart
                            data={barChartData}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
