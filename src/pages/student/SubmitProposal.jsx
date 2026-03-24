import { useState } from "react";
import { useDispatch } from "react-redux";
import { submitProposal } from "../../store/slices/studentSlice";
import {
  FileSignature,
  Type,
  AlignLeft,
  Send,
  Lightbulb,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const SubmitProposal = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Optional: to show a success state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);

    try {
      await dispatch(submitProposal(formData)).unwrap();
      setFormData({ title: "", description: "" });
      setIsSuccess(true);

      // Reset the success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.log("Submission failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-white p-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm border border-indigo-50">
              <FileSignature className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800">
                Submit Proposal
              </h1>
              <p className="text-slate-500 mt-1 font-medium">
                Draft and submit your project idea for supervisor approval.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Type className="w-4 h-4 text-indigo-500" />
                  Project Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400"
                  placeholder="e.g., AI-Based E-commerce Website"
                  required
                />
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <AlignLeft className="w-4 h-4 text-indigo-500" />
                  Project Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-800 min-h-[200px] resize-y placeholder:text-slate-400"
                  placeholder="Describe your project's main objectives, the tech stack you plan to use, and the problem it solves..."
                  required
                />
              </div>

              {/* Action Footer */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {isSuccess && (
                    <span className="flex items-center gap-2 text-emerald-600 font-bold text-sm transition-opacity duration-300">
                      <CheckCircle2 className="w-5 h-5" />
                      Proposal submitted!
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    !formData.title.trim() ||
                    !formData.description.trim()
                  }
                  className="group flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {isLoading ?
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  : <>
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      Submit Proposal
                    </>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar: Guidelines / Tips */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-md p-6 text-white h-full flex flex-col relative overflow-hidden">
            {/* Background decoration */}
            <Lightbulb className="absolute -bottom-6 -right-6 w-32 h-32 text-white opacity-10" />

            <div className="relative z-10 flex items-center gap-2 mb-6">
              <Lightbulb className="w-6 h-6 text-yellow-300" />
              <h3 className="text-lg font-bold">Writing a Great Proposal</h3>
            </div>

            <div className="relative z-10 space-y-4 flex-1">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                <h4 className="font-bold text-sm mb-1 text-blue-50">
                  1. Be Specific
                </h4>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Clearly define what your project will do. Avoid vague
                  statements. Mention the exact problem you are solving.
                </p>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                <h4 className="font-bold text-sm mb-1 text-blue-50">
                  2. Include Tech Stack
                </h4>
                <p className="text-xs text-blue-100 leading-relaxed">
                  List the core technologies you plan to use (e.g., MongoDB,
                  React, Node.js).
                </p>
              </div>

              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                <h4 className="font-bold text-sm mb-1 text-blue-50">
                  3. Define the Scope
                </h4>
                <p className="text-xs text-blue-100 leading-relaxed">
                  Keep it realistic. Mention the core features you guarantee to
                  deliver by the deadline.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitProposal;
