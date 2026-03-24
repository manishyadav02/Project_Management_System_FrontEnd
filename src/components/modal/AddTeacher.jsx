import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toggleTeacherModal } from "../../store/slices/popupSlice.js";
import { createTeacher } from "../../store/slices/adminSlice";
import { X } from "lucide-react";

const AddTeacher = () => {
  const dispatch = useDispatch();
  
  // 1. Set Defaults here to avoid "empty string" errors
  const initialState = {
    name: "",
    email: "",
    password: "",
    department: "CSE", // ✅ Default
    maxStudents: 10,   // ✅ Default reasonable number
    expertise: "",     // ✅ Starts empty, but we force selection below
  };

  const [formData, setFormData] = useState(initialState);

  const handleCreateTeacher = (e) => {
    e.preventDefault();
    dispatch(createTeacher(formData));
    
    // 2. Reset to SAFE defaults (not empty strings)
    setFormData(initialState); 
    dispatch(toggleTeacherModal());
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Add Teacher
            </h3>
            <button
              onClick={() => dispatch(toggleTeacherModal())}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleCreateTeacher} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                className="input-field w-full py-1 border-b border-slate-300 focus:outline-none focus:border-blue-500"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                name="email"
                className="input-field w-full py-1 border-b border-slate-300 focus:outline-none focus:border-blue-500"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                name="password"
                className="input-field w-full py-1 border-b border-slate-300 focus:outline-none focus:border-blue-500"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select
                className="input-field w-full py-1 border-b border-slate-300 focus:outline-none focus:border-blue-500"
                value={formData.department}
                name="department"
                required
                onChange={handleChange}
              >
                <option value="CSE">CSE</option>
                <option value="EEE">EEE</option>
                <option value="ECE">ECE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="EE">EE</option>
                <option value="IT">IT</option>
                <option value="DIPLOMA">DIPLOMA</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            {/* Expertise (Updated with Groups & Placeholder) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expertise</label>
              <select
                className="input-field w-full py-1 border-b border-slate-300 focus:outline-none focus:border-blue-500"
                value={formData.expertise}
                required
                name="expertise"
                onChange={handleChange}
              >
                {/* 3. This forces the user to pick something! */}
                <option value="" disabled>Select Area of Expertise</option>
                
                <optgroup label="CSE / IT">
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="Database Management">Database Management</option>
                    <option value="Software Engineering">Software Engineering</option>
                </optgroup>

                <optgroup label="Electronics (ECE/EEE)">
                    <option value="Internet of Things (IoT)">IoT</option>
                    <option value="Embedded Systems">Embedded Systems</option>
                    <option value="Power Systems">Power Systems</option>
                    <option value="Control Systems">Control Systems</option>
                </optgroup>

                <optgroup label="Core (MECH/CIVIL)">
                    <option value="Thermodynamics">Thermodynamics</option>
                    <option value="CAD/CAM & AutoCAD">CAD/CAM</option>
                    <option value="Structural Engineering">Structural Engineering</option>
                    <option value="Surveying & Geomatics">Surveying</option>
                </optgroup>
                <optgroup label="General / Other">
                    <option value="Engineering Mathematics">Engineering Mathematics</option>
                    <option value="Communication Skills">Communication Skills</option>
                </optgroup>
              </select>
            </div>

            {/* Max Students */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Students</label>
              <input
                type="number"
                required
                name="maxStudents"
                className="input-field w-full py-1 border-b border-slate-300 focus:outline-none focus:border-blue-500"
                value={formData.maxStudents}
                min={1}
                max={50}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => dispatch(toggleTeacherModal())}
                className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50 transition-colors"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
                Add Teacher
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddTeacher;