import React from 'react';
import {
    FaTimes, FaClock, FaLink, FaExternalLinkAlt,
    FaFileImage, FaFilePdf, FaFileWord, FaFileExcel,
    FaFile, FaDownload, FaCheck, FaBuilding, FaUser
} from 'react-icons/fa';
import { BASE_URL } from '../utils/apiPaths'; // Ensure we have base url for images

const TaskDetailsModal = ({ task, onClose }) => {
    if (!task) return null;

    // Helper to determine file icon based on extension
    const getFileIcon = (filename) => {
        const ext = filename?.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <FaFileImage className="text-purple-500" />;
        if (['pdf'].includes(ext)) return <FaFilePdf className="text-red-500" />;
        if (['doc', 'docx'].includes(ext)) return <FaFileWord className="text-blue-500" />;
        if (['xls', 'xlsx'].includes(ext)) return <FaFileExcel className="text-green-500" />;
        return <FaFile className="text-gray-400" />;
    };

    // Helper to separate attachments
    const links = task.attachments?.filter(a => a.type === 'link') || [];
    const files = task.attachments?.filter(a => a.type === 'file') || [];

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Slide-over Panel */}
            <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50 flex-shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide 
                    ${task.status === 'Completed' ? 'bg-green-100 text-green-600' :
                                    task.status === 'In Progress' ? 'bg-orange-100 text-orange-600' :
                                        task.status === 'In Review' ? 'bg-purple-100 text-purple-600' :
                                            'bg-red-100 text-red-600'}`}>
                                {task.status}
                            </span>
                            {task.priority && (
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide 
                       ${task.priority === 'High' ? 'bg-red-50 text-red-600' :
                                        task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {task.priority} Priority
                                </span>
                            )}
                            {task.dueDate && (
                                <span className="text-gray-500 text-xs font-medium flex items-center">
                                    <FaClock className="mr-1" /> Due {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 break-words">{task.title}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                <div className="p-8 space-y-8 flex-grow">

                    {/* Description */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Description</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
                            {task.description || "No description provided."}
                        </p>
                    </div>

                    {/* Assignees */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Assigned To</h3>
                        <div className="flex flex-wrap gap-3">
                            {task.assignedTo && task.assignedTo.length > 0 ? task.assignedTo.map(user => (
                                <div key={user._id || Math.random()} className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
                                    <div className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs font-bold">
                                        {user.name ? user.name.charAt(0) : <FaUser className='text-xs' />}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{user.name || 'Unknown User'}</span>
                                </div>
                            )) : (
                                <span className="text-sm text-gray-400 italic">Unassigned</span>
                            )}
                        </div>
                    </div>

                    {/* Attachments Section */}
                    {(links.length > 0 || files.length > 0) && (
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Attachments & Resources</h3>
                            <div className="grid grid-cols-1 gap-3">

                                {/* Links */}
                                {links.map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-blue-50 hover:bg-blue-100 transition group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-500 shadow-sm text-lg">
                                            <FaLink />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-blue-700 truncate">{link.name || link.url}</h4>
                                            <p className="text-xs text-blue-400">External Link</p>
                                        </div>
                                        <FaExternalLinkAlt className="text-gray-300 group-hover:text-blue-500" />
                                    </a>
                                ))}

                                {/* Files */}
                                {files.map((file, idx) => {
                                    const fileUrl = file.url.startsWith('http') ? file.url : `${BASE_URL}${file.url}`;
                                    return (
                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:shadow-md transition group bg-white">
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-lg">
                                                {getFileIcon(file.name)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-gray-700 truncate">{file.name}</h4>
                                                <p className="text-xs text-gray-400">File Attachment</p>
                                            </div>
                                            <a
                                                href={fileUrl}
                                                download
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-500 hover:text-white transition"
                                                title="Download"
                                            >
                                                <FaDownload className="text-xs" />
                                            </a>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Checklist Section */}
                    {task.todoChecklist && task.todoChecklist.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Checklist</h3>
                                <span className="text-xs font-semibold text-gray-500">
                                    {task.todoChecklist.filter(i => i.completed).length}/{task.todoChecklist.length} Completed
                                </span>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                {task.todoChecklist.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center
                             ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>
                                            {item.completed && <FaCheck className="text-white text-[10px]" />}
                                        </div>
                                        <span className={`text-sm break-words ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                            {item.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0 flex-shrink-0">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-200 transition text-sm">
                        Close
                    </button>
                    {/* If editing allowed, add Edit button here */}
                </div>
            </div>
        </div>
    );
};

export default TaskDetailsModal;
