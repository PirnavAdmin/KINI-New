import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save } from "lucide-react";

const skillSchema = z.object({
  name: z.string().trim().min(2, "At least 2 characters"),
  category: z.string().min(1, "Category is required"),
  type: z.string().min(1, "Skill type is required"),
});

export default function SkillFormModal({ open, onClose, onSubmit, skill, categories, skillTypes }) {
  const isEdit = !!skill;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: "",
      category: "",
      type: "Technical",
    },
  });

  useEffect(() => {
    if (open && skill) {
      reset({ name: skill.name || "", category: skill.category || "", type: skill.type || "Technical" });
    } else if (open) {
      reset({ name: "", category: "", type: "Technical" });
    }
  }, [open, skill, reset]);

  const onFormSubmit = async (data) => {
    const saved = await onSubmit(data);
    if (saved === false) return;
    reset();
    onClose();
  };

  const inputClass = (hasError) =>
    `w-full px-3.5 py-2.5 bg-white dark:bg-slate-800/50 border rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
      hasError
        ? "border-red-300 dark:border-red-500/50 focus:ring-red-500/30"
        : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/30 focus:border-indigo-500"
    }`;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-4 border-b border-slate-100 dark:border-slate-700/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{isEdit ? "Edit Skill" : "Add New Skill"}</h2>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{isEdit ? "Update skill details" : "Create a new skill in the catalog"}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onFormSubmit)} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Skill ID</label>
                <input value={skill?.skillId ?? skill?.id ?? "Auto generated"} readOnly disabled className={inputClass(false)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Type <span className="text-red-500">*</span></label>
                <select {...register("type")} className={inputClass(errors.type)}>
                  {["Technical", "Soft Skill", ...skillTypes].filter((value, index, list) => list.indexOf(value) === index).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && <p className="text-[11px] text-red-500 mt-1">{errors.type.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Category <span className="text-red-500">*</span></label>
                <select {...register("category")} className={inputClass(errors.category)}>
                  <option value="">Select category</option>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
                {errors.category && <p className="text-[11px] text-red-500 mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Name <span className="text-red-500">*</span></label>
                <input {...register("name")} placeholder="e.g. React.js" className={inputClass(errors.name)} />
                {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                <button type="button" onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
                  <Save className="w-4 h-4" />
                  {isSubmitting ? "Saving..." : isEdit ? "Update Skill" : "Add Skill"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
