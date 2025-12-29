import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import moment from "moment";
import toast from "react-hot-toast";
import Modal from "../../components/Modal"; // Corrected path
import DeleteAlert from "../../components/DeleteAlert"; // Corrected path
import Progress from "../../components/layouts/Progress";

const MasterTaskView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [masterTask, setMasterTask] = useState(null);
  const [childTasks, setChildTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const getStatusTagColor = (status) => {
    switch (status) {
      case "In Progress":
        return "text-cyan-600 bg-cyan-100";
      case "Completed":
        return "text-green-600 bg-green-100";
      default: // For "Pending"
        return "text-violet-600 bg-violet-100";
    }
  };

  useEffect(() => {
    const getDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `${API_PATHS.TASKS.GET_MASTER_TASK_DETAILS}/${id}`
        );
        setMasterTask(response.data.masterTask);
        setChildTasks(response.data.childTasks);
      } catch (error) {
        console.error("Error fetching master task details:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      getDetails();
    }
  }, [id]);

  const deleteTask = async () => {
    try {
      await axiosInstance.delete(`${API_PATHS.TASKS.DELETE_MASTER_TASK}/${id}`);
      toast.success("Master task and all sub-tasks deleted.");
      navigate("/admin/tasks");
    } catch (error) {
      toast.error("Failed to delete task.");
    } finally {
      setOpenDeleteAlert(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="Manage Tasks">
        <div className="mt-5 text-center">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="mt-5">
        <div className="grid grid-cols-1">
          <div className="form-card">
            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-800">{masterTask?.title}</h2>
                <p className="text-slate-600 mt-1">{masterTask?.description}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <button
                  className="add-btn"
                  onClick={() => navigate("/admin/create-task", { state: { taskID: masterTask?._id } })}
                >
                  Update Task
                </button>
                <button
                  className="flex items-center gap-1.5 text-sm font-medium text-rose-500 bg-rose-50 rounded-lg px-3 py-2 border border-rose-100 hover:border-rose-300"
                  onClick={() => setOpenDeleteAlert(true)}
                >
                  Delete
                </button>
              </div>
            </div>

            {/* --- DETAILS SECTION --- */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 mt-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs mt-1 text-slate-800 font-medium">PRIORITY</p>
                <p className="font-medium mt-1 text-slate-500">{masterTask?.priority}</p>
              </div>
              <div>
                <p className="text-xs mt-1 text-slate-800 font-medium">DUE DATE</p>
                <p className="font-medium mt-1 text-slate-500">{moment(masterTask?.dueDate).format("Do MMM YYYY")}</p>
              </div>
            </div>

            {/* --- STUDENT PROGRESS TABLE --- */}
            <div className="mt-6">
              <h4 className="text-lg font-normal text-slate-800">Student Progress</h4>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Assigned To</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                      <th scope="col" className="px-6 py-3 w-48">Progress</th>
                      <th scope="col" className="px-6 py-3">Completed On</th>
                      <th scope="col" className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {childTasks.map((task) => (
                      <tr key={task._id} className="bg-white border-b hover:bg-gray-100">
                        <td className="px-6 py-4 font-medium text-gray-600 whitespace-nowrap">
                          {task.assignedTo[0]?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusTagColor(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Progress progress={task.progress || 0} status={task.status} />
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {task.status === "Completed"
                            ? moment(task.updatedAt).format("Do MMM YYYY")
                            : "Not Yet"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            className="card-btn"
                            onClick={() => navigate(`/user/task-details/${task._id}`)}
                          >
                            View Task
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={openDeleteAlert}
        onClose={() => setOpenDeleteAlert(false)}
        title="Delete Master Task"
      >
        <DeleteAlert
          content="Are you sure you want to delete this master task? This will also delete all individual tasks assigned to students."
          onDelete={deleteTask}
          onClose={() => setOpenDeleteAlert(false)}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default MasterTaskView;
