import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddTeacher from "../../components/modal/AddTeacher";
import {
  getAllUsers,
  updateTeacher,
  deleteTeacher,
} from "../../store/slices/adminSlice";
import { toggleTeacherModal } from "../../store/slices/popupSlice.js";
import {
  AlertTriangle,
  BadgeCheck,
  Plus,
  Users,
  X,
  Search,
  Filter,
  Edit2,
  Trash2,
  Briefcase,
  UserCheck,
  BookOpen
} from "lucide-react";

const ManageTeachers = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.admin);
  const { isCreateTeacherModalOpen } = useSelector((state) => state.popup);
  
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeachers] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    expertise: "",
    maxStudents: 10,
  });

  const teachers = useMemo(() => {
    return (users || []).filter(
      (user) => user && user.role?.toLowerCase() === "teacher",
    );
  }, [users]);

  const departments = useMemo(() => {
    const set = new Set(
      (teachers || []).map((t) => t.department).filter(Boolean),
    );
    return Array.from(set);
  }, [teachers]);

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      (teacher.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      // ✨ FIX: Changed teacher.mail to teacher.email
      (teacher.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterDepartment === "all" || teacher.department === filterDepartment;
    return matchesSearch && matchesFilter;
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeachers(null);
    setFormData({
      name: "",
      email: "",
      department: "",
      expertise: "",
      maxStudents: 10,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTeacher) {
      dispatch(updateTeacher({ id: editingTeacher._id, data: formData }));
      setEditingTeachers(null);
    }
    handleCloseModal();
  };

  const handleEdit = (teacher) => {
    setEditingTeachers(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      expertise:
        Array.isArray(teacher.expertise) && teacher.expertise.length > 0
          ? teacher.expertise[0]
          : teacher.expertise || "",
      maxStudents:
        typeof teacher.maxStudents === "number" ? teacher.maxStudents : 10,
    });
    setShowModal(true);
  };

  const handleDelete = (teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (teacherToDelete) {
      dispatch(deleteTeacher(teacherToDelete._id));
    }
    setShowDeleteModal(false);
    setTeacherToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setTeacherToDelete(null);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      
      {/* 1. Premium Dark Header */}
      <div className="bg-slate-900 rounded-3xl shadow-xl overflow-hidden relative border border-slate-800 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center gap-5">
          <div className="p-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl">
            <Briefcase className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Faculty Roster
            </h1>
            <p className="text-indigo-200/80 font-medium mt-1.5 max-w-xl">
              Add, edit, and manage all Teacher accounts and capacities.
            </p>
          </div>
        </div>

        <button
          onClick={() => dispatch(toggleTeacherModal())}
          className="relative z-10 flex items-center gap-2 px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-5 h-5" />
          Add New Teacher
        </button>
      </div>

      {/* 2. Floating Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Faculty</p>
            <div className="p-2.5 rounded-xl bg-blue-50 transition-transform group-hover:scale-110">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{teachers.length}</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Supervised Students</p>
            <div className="p-2.5 rounded-xl bg-emerald-50 transition-transform group-hover:scale-110">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800">
            {teachers.reduce((count, teacher) => count + (teacher.assignedStudents?.length || 0), 0)}
          </h3>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Departments</p>
            <div className="p-2.5 rounded-xl bg-purple-50 transition-transform group-hover:scale-110">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800">{departments.length}</h3>
        </div>
      </div>

      {/* 3. Sleek Filters Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-5">
        <div className="flex-1 relative">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> Search Faculty
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-400"
            placeholder="Search by teacher name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-72">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Department
          </label>
          <select
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-semibold text-slate-700 appearance-none cursor-pointer"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Beautiful Data Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Teachers List</h2>
        </div>

        <div className="overflow-x-auto">
          {filteredTeachers && filteredTeachers.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Expertise</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((teacher) => {
                  const studentCount = teacher.assignedStudents?.length || 0;
                  const maxCount = teacher.maxStudents || 10;
                  const isFull = studentCount >= maxCount;

                  return (
                    <tr key={teacher._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-900 text-sm mb-0.5">{teacher.name}</div>
                        <div className="text-xs text-slate-500 font-medium">{teacher.email}</div>
                      </td>
                      
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-800 text-sm">{teacher.department || "-"}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide mt-0.5">
                          Joined {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : "-"}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        {Array.isArray(teacher.expertise) && teacher.expertise.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {teacher.expertise.slice(0, 2).map((exp, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold">
                                {exp}
                              </span>
                            ))}
                            {teacher.expertise.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold">
                                +{teacher.expertise.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm font-semibold text-slate-500">{teacher.expertise || "-"}</span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${isFull ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          <Users className="w-3.5 h-3.5" />
                          {studentCount} / {maxCount} Students
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors tooltip-trigger"
                            title="Edit Teacher"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher)}
                            className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-lg transition-colors tooltip-trigger"
                            title="Delete Teacher"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-bold text-lg">No teachers found</p>
              <p className="text-slate-400 text-sm mt-1 font-medium">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Sleek Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-500" />
                Edit Faculty Profile
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="" disabled>Select...</option>
                    {["CSE", "EEE", "ECE", "MECH", "CIVIL", "EE", "IT", "DIPLOMA", "OTHER"].map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max Students</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={50}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Expertise</label>
                <select
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                >
                  <option value="" disabled>Select Area of Expertise</option>
                  <optgroup label="CSE / IT">
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="Database Management">Database Management (DBMS)</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Operating Systems">Operating Systems</option>
                    <option value="Big Data Analytics">Big Data Analytics</option>
                  </optgroup>
                  <optgroup label="Electronics (ECE/EEE)">
                    <option value="Internet of Things (IoT)">Internet of Things (IoT)</option>
                    <option value="Embedded Systems">Embedded Systems</option>
                    <option value="Power Systems">Power Systems</option>
                    <option value="Control Systems">Control Systems</option>
                  </optgroup>
                  <optgroup label="Core (MECH/CIVIL)">
                    <option value="Thermodynamics">Thermodynamics</option>
                    <option value="CAD/CAM & AutoCAD">CAD/CAM & AutoCAD</option>
                    <option value="Structural Engineering">Structural Engineering</option>
                    <option value="Surveying & Geomatics">Surveying & Geomatics</option>
                  </optgroup>
                  <optgroup label="Diploma & Others">
                    <option value="Engineering Drawing">Engineering Drawing</option>
                    <option value="Workshop Technology">Workshop Technology</option>
                  </optgroup>
                  <optgroup label="General / Other">
                    <option value="Engineering Mathematics">Engineering Mathematics</option>
                    <option value="Communication Skills">Communication Skills</option>
                  </optgroup>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm hover:shadow-indigo-500/30 active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Danger Delete Modal */}
      {showDeleteModal && teacherToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in zoom-in-95 duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-rose-50">
              <AlertTriangle className="w-8 h-8 text-rose-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Remove Faculty?</h3>
            <p className="text-sm font-medium text-slate-500 mb-6 px-4">
              Are you sure you want to permanently remove <span className="font-bold text-slate-800">{teacherToDelete.name}</span>? This action cannot be undone.
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmDelete}
                className="w-full px-4 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm hover:shadow-rose-500/30"
              >
                Yes, Delete Account
              </button>
              <button
                onClick={handleCancelDelete}
                className="w-full px-4 py-3 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* External Create Modal */}
      {isCreateTeacherModalOpen && <AddTeacher />}
    </div>
  );
};

export default ManageTeachers;