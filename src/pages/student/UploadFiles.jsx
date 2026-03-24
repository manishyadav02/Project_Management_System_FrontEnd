import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  downloadFile,
  fetchProject,
  uploadFiles,
} from "../../store/slices/studentSlice.js";
import {
  Code2,
  File,
  FileText,
  Presentation,
  FolderUp,
  Download,
  FilePlus,
  Trash2,
  UploadCloud,
  CheckCircle2,
} from "lucide-react";

const UploadFiles = () => {
  const dispatch = useDispatch();
  const { project, files } = useSelector((state) => state.student);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const reportRef = useRef(null);
  const presRef = useRef(null);
  const codeRef = useRef(null);

  useEffect(() => {
    if (!project) {
      dispatch(fetchProject());
    }
  }, [dispatch, project]);

  const handleFilePick = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    e.target.value = ""; // Reset input
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    const pId = project?._id || project?.id;

    try {
      // Using your working logic, but adding a try/catch for the loading state
      await dispatch(
        uploadFiles({ projectId: pId, files: selectedFiles }),
      ).unwrap();
      setSelectedFiles([]);
      toast.success("Files uploaded successfully!");
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeSelected = (name) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== name),
    );
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <File className="w-8 h-8 text-slate-400" />;
    const ext = fileName.split(".").pop().toLowerCase();

    if (ext === "pdf") return <FileText className="w-8 h-8 text-rose-500" />;
    if (["doc", "docx"].includes(ext))
      return <FileText className="w-8 h-8 text-blue-500" />;
    if (["ppt", "pptx"].includes(ext))
      return <Presentation className="w-8 h-8 text-orange-500" />;
    if (["zip", "rar", "7z", "tar"].includes(ext))
      return <Code2 className="w-8 h-8 text-indigo-500" />;

    return <File className="w-8 h-8 text-slate-500" />;
  };

  
   const handleDownload = async (file) => {
    try {
      const res = await dispatch(
        downloadFile({
          projectId: project._id,
          fileId: file._id || file.id,
        }),
      ).unwrap();

      const fileUrl = res.payload?.fileUrl || res.fileUrl || file.fileUrl;
      
      // ✨ FIX: This downloads instantly in the background without opening an empty tab!
      window.location.href = fileUrl; 
      
    } catch (error) {
      console.error("Error downloading file", error);
      toast.error("Failed to download file. Please try again...");
    }
  };

  const actualFiles = files || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* 1. Page Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white p-6 md:p-8 flex items-center gap-5">
          <div className="p-3.5 bg-white text-indigo-600 rounded-xl shadow-sm border border-slate-100">
            <FolderUp className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">
              Project Workspace
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Securely upload and manage your project documentation and source
              code.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Upload Dropzones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Report Zone */}
        <div className="group relative bg-white border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-8 text-center hover:bg-blue-50/30 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">
          <div className="mx-auto w-16 h-16 bg-slate-50 group-hover:bg-blue-100 rounded-full flex items-center justify-center mb-4 transition-colors">
            <FileText className="w-8 h-8 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            Project Report
          </h3>
          <p className="text-xs font-semibold text-slate-400 mb-6 tracking-wide">
            PDF, DOC, DOCX
          </p>

          <label className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all cursor-pointer shadow-sm">
            Select Files
            <input
              type="file"
              ref={reportRef}
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFilePick}
              multiple
            />
          </label>
        </div>

        {/* Presentation Zone */}
        <div className="group relative bg-white border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-2xl p-8 text-center hover:bg-orange-50/30 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">
          <div className="mx-auto w-16 h-16 bg-slate-50 group-hover:bg-orange-100 rounded-full flex items-center justify-center mb-4 transition-colors">
            <Presentation className="w-8 h-8 text-slate-400 group-hover:text-orange-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            Presentation
          </h3>
          <p className="text-xs font-semibold text-slate-400 mb-6 tracking-wide">
            PPT, PPTX, PDF
          </p>

          <label className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all cursor-pointer shadow-sm">
            Select Files
            <input
              type="file"
              ref={presRef}
              className="hidden"
              accept=".ppt,.pptx,.pdf"
              onChange={handleFilePick}
              multiple
            />
          </label>
        </div>

        {/* Code Zone */}
        <div className="group relative bg-white border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-8 text-center hover:bg-indigo-50/30 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">
          <div className="mx-auto w-16 h-16 bg-slate-50 group-hover:bg-indigo-100 rounded-full flex items-center justify-center mb-4 transition-colors">
            <Code2 className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Source Code</h3>
          <p className="text-xs font-semibold text-slate-400 mb-6 tracking-wide">
            ZIP, RAR, TAR
          </p>

          <label className="inline-flex items-center justify-center w-full px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all cursor-pointer shadow-sm">
            Select Files
            <input
              type="file"
              ref={codeRef}
              className="hidden"
              accept=".zip,.rar,.7z,.tar"
              onChange={handleFilePick}
              multiple
            />
          </label>
        </div>
      </div>

      {/* 3. Staging Area (Files Ready to Upload) - ONLY SHOWS WHEN FILES ARE SELECTED */}
      {selectedFiles.length > 0 && (
        <div className="bg-indigo-50/50 rounded-2xl shadow-sm border border-indigo-100 overflow-hidden transition-all duration-500">
          <div className="px-6 py-4 border-b border-indigo-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-500" />
                Ready to Upload ({selectedFiles.length})
              </h2>
            </div>

            {/* THIS IS THE SMART UPLOAD BUTTON */}
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
            >
              {isUploading ? "Uploading..." : "Confirm Upload"}
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedFiles.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-200 transition-colors group"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="shrink-0 p-2 bg-slate-50 rounded-lg">
                      {getFileIcon(file.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">
                        {file.name}
                      </p>
                      <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSelected(file.name)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Remove file"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Uploaded Files Repository */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Your Repository
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Files currently saved and visible to your supervisor.
          </p>
        </div>

        <div className="p-6">
          {actualFiles.length === 0 ?
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FilePlus className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                No files uploaded yet
              </h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto font-medium">
                Select files from the options above. Once uploaded, they will
                securely appear in this repository.
              </p>
            </div>
          : <div className="space-y-3">
              {actualFiles.map((file) => (
                <div
                  key={file._id || file.fileUrl}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md hover:border-slate-300 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4 overflow-hidden">
                    <div className="shrink-0 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      {getFileIcon(file.fileName)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-base truncate">
                        {file.fileName}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded">
                        {file.fileType || "DOCUMENT"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(file)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default UploadFiles;
