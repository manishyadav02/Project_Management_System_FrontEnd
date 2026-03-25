import { useEffect, useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import {
  downloadTeacherFile,
  getTeacherFiles,
} from "../../store/slices/teacherSlice";

import { toast } from "react-toastify";

import {
  ArrowDownToLine,
  FileText,
  FileSpreadsheet,
  FileArchive,
  File,
  LayoutGrid,
  List,
} from "lucide-react";

const TeacherFiles = () => {
  const dispatch = useDispatch();

  const { authUser } = useSelector((state) => state.auth);

  const [viewMode, setViewMode] = useState("grid");

  const [filterType, setFilterType] = useState("all");

  const [searchTerm, setSearchTerm] = useState("");

  const filesFromStore = useSelector((state) => state.teacher.files || []);

  useEffect(() => {
    dispatch(getTeacherFiles(authUser.id));
  }, [dispatch, authUser.id]);

  const deriveTypeFormatName = (name) => {
    if (!name) return "Other";

    const parts = name.split(".");

    return (parts[parts.length - 1] || "").toLowerCase();
  };

  const normalizeFile = (f) => {
    const type = deriveTypeFormatName(f.fileName) || f.file || "other";

    let category = "other";

    if (["pdf", "doc", "docx", "txt"].includes(type)) {
      category = "report";
    } else if (["ppt", "pptx", "xls", "xlsx"].includes(type)) {
      category = "presentation";
    } else if (
      [
        "zip",

        "rar",

        "7z",

        "html",

        "css",

        "js",

        "jsx",

        "ts",

        "tsx",

        "json",
      ].includes(type)
    ) {
      category = "code";
    } else if (["jpeg", "jpg", "png", "gif", "bmp"].includes(type)) {
      category = "image";
    }

    return {
      id: f._id,

      name: f.fileName,

      type: f.fileType,

      size: f.size || "-",

      student: f.studentName || "-",

      uploadDate: f.uploadedAt || f.createdAt || new Date().toISOString(),

      category: category,

      projectId: f.projectId || f.project?._id,

      fileId: f._id,
    };
  };

  const files = useMemo(() => {
    return (filesFromStore || []).map(normalizeFile);
  }, [filesFromStore]);

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return <FileText className="w-8 h-8 text-red-500" />;

      case "doc":

      case "docx":
        return <FileText className="w-8 h-8 text-blue-500" />;

      case "ppt":

      case "pptx":
        return <FileSpreadsheet className="w-8 h-8 text-orange-500" />;

      case "zip":

      case "rar":
        return <FileArchive className="w-8 h-8 text-yellow-500" />;

      default:
        return <File className="w-8 h-8 text-slate-500" />;
    }
  };

  const filteredFiles = files.filter((file) => {
    const matchesType = filterType === "all" || file.category === filterType;

    const matchesSearch = (file.name || "")

      .toLowerCase()

      .includes(searchTerm.toLowerCase());

    return matchesType && matchesSearch;
  });

  const handleDownload = async (file) => {
    try {
      const res = await dispatch(
        downloadTeacherFile({
          projectId: file.projectId,

          fileId: file._id || file.id,
        }),
      ).unwrap();

      const fileUrl = res.fileUrl || file.fileUrl;
      window.location.href = fileUrl;
    } catch (error) {
      console.error("Enter downloading file", error);
      toast.error("Failed to download file.Please try again...");
    }
  };

  const fileStats = [
    {
      label: "Total Files",

      count: files.length,

      bg: "bg-blue-50",

      text: "text-blue-600",

      value: "text-blue-700",
    },

    {
      label: "Reports",

      count: files.filter((f) => f.category === "report").length,

      bg: "bg-green-50",

      text: "text-green-600",

      value: "text-green-700",
    },

    {
      label: "Presentations",

      count: files.filter((f) => f.category === "presentation").length,

      bg: "bg-orange-50",

      text: "text-orange-600",

      value: "text-orange-700",
    },

    {
      label: "Code Files",

      count: files.filter((f) => f.category === "code").length,

      bg: "bg-purple-50",

      text: "text-purple-600",

      value: "text-purple-700",
    },

    {
      label: "Images",

      count: files.filter((f) => f.category === "image").length,

      bg: "bg-pink-50",

      text: "text-pink-600",

      value: "text-pink-700",
    },
  ];

  const tableHeadData = [
    "File Name",

    "Student",

    "Type",

    "Upload Date",

    "Actions",
  ];

  return (
    <>
      <div className="space-y-6 ">
        {/* 1. Page Header */}

        <div className="card">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white p-6 md:p-8 flex items-center gap-5">
              <div className="p-3.5 bg-white text-indigo-600 rounded-xl shadow-sm border border-slate-100">
                <FileArchive className="w-8 h-8" />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-slate-800">
                  Student Submissions
                </h1>

                <p className="text-slate-500 mt-1 font-medium">
                  Access and review all documentation and source code uploaded
                  by your assigned students.
                </p>
              </div>
            </div>
          </div>

          {/* Controler */}

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <select
                className="input w-56"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Files</option>

                <option value="report">Reports</option>

                <option value="presentation">Presentation</option>

                <option value="code">Code Files</option>

                <option value="image">Images</option>
              </select>

              <input
                type="text"
                className="input w-96"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-blue-100 text-blue-500" : "bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}
                onClick={() => setViewMode("grid")}>
                <LayoutGrid className="w-4 h-4" />
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-blue-100 text-blue-500" : "bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. File Statistics */}

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
            {fileStats.map((stat, idx) => (
              <div
                key={idx}
                className={`${stat.bg} rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300`}>
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${stat.text}`}>
                  {stat.label}
                </p>

                <p className={`text-3xl font-black mt-1 ${stat.value}`}>
                  {stat.count}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Files List/Grid */}

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                    {getFileIcon(deriveTypeFormatName(file.name))}
                  </div>

                  <button
                    onClick={() => handleDownload(file)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <ArrowDownToLine className="w-5 h-5" />
                  </button>
                </div>

                <h3
                  className="font-bold text-slate-800 truncate mb-1"
                  title={file.name}>
                  {file.name}
                </h3>

                <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                  {file.student}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400">
                    {new Date(file.uploadDate).toLocaleDateString()}
                  </span>

                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase">
                    {file.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    {tableHeadData.map((head) => (
                      <th
                        key={head}
                        className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {filteredFiles.map((file) => (
                    <tr
                      key={file.id}
                      className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                            {getFileIcon(deriveTypeFormatName(file.name))}
                          </div>

                          <span
                            className="font-bold text-slate-700 text-sm truncate max-w-[200px]"
                            title={file.name}>
                            {file.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                        {file.student}
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded uppercase">
                          {file.category}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDownload(file)}
                          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold text-sm transition-colors">
                          <ArrowDownToLine className="w-4 h-4" /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TeacherFiles;
