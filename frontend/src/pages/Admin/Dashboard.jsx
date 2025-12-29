import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import AvatarGroup from "../../components/layouts/AvatarGroup";
import { MdAccessTime, MdWork, MdCheckCircle, MdFlag, MdCalendarToday } from "react-icons/md";

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [inProgressTasks, setInProgressTasks] = useState([]);
  const [myPriorities, setMyPriorities] = useState([]);

  // Fetch Dashboard Stats
  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_DASHBOARD_DATA);
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Widget A: Team Workload (In Progress Tasks)
  const getInProgressTasks = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: { status: "In Progress" }
      });
      setInProgressTasks(response.data.tasks || []);
    } catch (error) {
      console.error("Error fetching in-progress tasks", error);
    }
  };

  // Widget B: My Upcoming Priorities
  const getMyPriorities = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: {
          assignedTo: 'me',
          status: "Pending", // Or just exclude Completed
          sort: 'dueDate'
        }
      });
      // Frontend filtering just in case, but backend should handle 'assignedTo=me'
      const tasks = response.data.tasks?.filter(t => t.status !== 'Completed') || [];
      setMyPriorities(tasks.slice(0, 5)); // Top 5
    } catch (error) {
      console.error("Error fetching my priorities", error);
    }
  };

  useEffect(() => {
    getDashboardData();
    getInProgressTasks();
    getMyPriorities();
  }, []);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 space-y-8">

        {/* Header */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Welcome back, {user?.name?.split(" ")[0]}!</h2>
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <MdCalendarToday className="mr-2" /> {moment().format("dddd, MMMM Do YYYY")}
          </p>
        </div>

        {/* Widget C: Project Overview Cards (Top Row) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoCard
            label="Total tasks"
            value={dashboardData?.statistics?.totalTasks || 0}
            icon={<MdWork className="text-white text-lg" />}
            color="bg-blue-600"
          />
          <InfoCard
            label="In Progress"
            value={dashboardData?.charts?.taskDistribution?.InProgress || 0}
            icon={<MdAccessTime className="text-white text-lg" />}
            color="bg-yellow-500"
          />
          <InfoCard
            label="High Priority"
            value={dashboardData?.statistics?.highPriorityTasks || 0}
            icon={<MdFlag className="text-white text-lg" />}
            color="bg-red-500"
          />
          <InfoCard
            label="Completed Today"
            value={dashboardData?.statistics?.completedTodayTasks || 0}
            icon={<MdCheckCircle className="text-white text-lg" />}
            color="bg-green-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Widget A: Team Workload */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Team Workload <span className="text-gray-400 font-normal text-sm">(Active Tasks)</span></h3>
            <div className="space-y-4">
              {inProgressTasks.length > 0 ? (
                inProgressTasks.map((task) => (
                  <div key={task._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                    <div className="flex items-center gap-4">
                      <AvatarGroup avatars={task.assignedTo || []} maxVisible={2} />
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm">{task.title}</h4>
                        <p className="text-xs text-gray-500">
                          {/* Org Name technically not in task unless populated, but we can show status or priority */}
                          {task.priority} Priority
                        </p>
                      </div>
                    </div>

                    <div className={`text-xs px-2 py-1 rounded font-medium ${moment(task.dueDate).isBefore(moment(), 'day') ? 'bg-red-100 text-red-700' :
                      moment(task.dueDate).isSame(moment(), 'day') ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                      {moment(task.dueDate).format("MMM D")}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">Everyone is free! No active tasks.</p>
              )}
            </div>
          </div>

          {/* Widget B: My Upcoming Priorities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">My Upcoming Priorities</h3>
            <div className="space-y-3">
              {myPriorities.length > 0 ? (
                myPriorities.map((task) => (
                  <div key={task._id} className="p-3 border-l-4 border-l-primary bg-blue-50/50 rounded-r-md">
                    <h4 className="font-medium text-gray-800 text-sm mb-1 line-clamp-1">{task.title}</h4>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{moment(task.dueDate).calendar(null, {
                        sameDay: '[Today]',
                        nextDay: '[Tomorrow]',
                        nextWeek: 'dddd',
                        lastDay: '[Yesterday]',
                        lastWeek: '[Last] dddd',
                        sameElse: 'MMM D'
                      })}</span>
                      <span className={`capitalize ${task.priority === 'High' ? 'text-red-600 font-bold' : ''
                        }`}>{task.priority}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <MdCheckCircle className="text-xl" />
                  </div>
                  <p className="text-sm text-gray-500">You're all caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
