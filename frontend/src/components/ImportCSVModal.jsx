import React, { useState } from 'react';
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { FaFileCsv, FaCloudUploadAlt, FaDownload, FaSpinner, FaFileUpload } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';

const ImportCSVModal = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    if (!isOpen) return null;

    const handleDownloadSample = () => {
        // Create a dummy CSV string
        const csvContent = "data:text/csv;charset=utf-8,Email\njohn@example.com";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sample_emails.csv");
        document.body.appendChild(link);
        link.click();
    };

    const handleUpload = async () => {
        if (!file) return alert("Please select a file");

        const formData = new FormData();
        formData.append('file', file);
        formData.append('file', file);

        setUploading(true);
        try {
            await axiosInstance.post(API_PATHS.USERS.BULK_IMPORT, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Import Successful! Emails have been sent.');
            onSuccess();
            onClose();
        } catch (err) {
            alert('Import Failed');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <FaFileCsv className="mr-2 text-red-500" />
                        Bulk Import Users via CSV
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><MdClose size={24} /></button>
                </div>

                <div className="p-6 flex flex-col md:flex-row gap-6">
                    {/* Left: File Drop */}
                    <div className="w-full md:w-1/2">
                        <h4 className="font-semibold mb-2">CSV File</h4>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center h-40 bg-gray-50 hover:bg-gray-100 transition relative">
                            <FaCloudUploadAlt className="text-3xl text-gray-400 mb-2" />
                            {file ? (
                                <span className="text-green-600 font-medium break-all px-2">{file.name}</span>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-500">Drag & drop CSV file here</p>
                                    <span className="text-xs text-gray-400 my-1">- or -</span>
                                    <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50">
                                        Choose File
                                        <input type="file" className="hidden" accept=".csv" onChange={e => setFile(e.target.files[0])} />
                                    </label>
                                </>
                            )}
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-800 border border-blue-100">
                            <p className="font-bold mb-1">CSV Requirements:</p>
                            <p>Columns: FirstName, LastName, Email, Phone</p>
                            <button onClick={handleDownloadSample} className="mt-2 text-blue-600 underline flex items-center">
                                <FaDownload className="mr-1" /> Download Sample CSV
                            </button>
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="w-full md:w-1/2">
                        <h4 className="font-semibold mb-2">Instructions</h4>
                        <div className="p-4 bg-blue-50 rounded text-sm text-blue-800 border border-blue-100 h-40">
                            <p className="font-bold mb-2">Simple Format:</p>
                            <p className="mb-4">Your CSV needs only ONE column:</p>
                            <ul className="list-disc ml-5 mb-4 text-xs font-mono">
                                <li>Email</li>
                            </ul>
                            <button onClick={handleDownloadSample} className="text-blue-600 underline flex items-center hover:text-blue-800">
                                <FaDownload className="mr-1" /> Download Sample File
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            * System will auto-generate names and unique temporary passwords for all imported users.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm">Cancel</button>
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium flex items-center disabled:opacity-50"
                    >
                        {uploading ? <FaSpinner className="animate-spin mr-2" /> : <FaFileUpload className="mr-2" />}
                        Upload & Create Users
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportCSVModal;
