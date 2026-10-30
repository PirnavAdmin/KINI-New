import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Eye,
  Search,
  Video,
  FileCode,
  FileSpreadsheet,
  Edit3,
  Trash2,
  Upload,
  Save,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@shared/components/Modal";
import { resourceService } from "../services/mentorCrudService";

const MOCK_RESOURCES = [
  {
    id: 1,
    title: "React Hooks Cheat Sheet",
    type: "pdf",
    course: "Full Stack MERN",
    downloads: 18,
    size: "245 KB",
    date: "Jan 10, 2025",
    url: "#",
  },
  {
    id: 2,
    title: "Python Pandas Tutorial Code",
    type: "code",
    course: "Python for Data Science",
    downloads: 12,
    size: "89 KB",
    date: "Jan 8, 2025",
    url: "#",
  },
  {
    id: 3,
    title: "ML Model Evaluation Guide",
    type: "pdf",
    course: "AI & Machine Learning",
    downloads: 8,
    size: "1.2 MB",
    date: "Jan 6, 2025",
    url: "#",
  },
  {
    id: 4,
    title: "Express API Template",
    type: "code",
    course: "Full Stack MERN",
    downloads: 22,
    size: "156 KB",
    date: "Jan 3, 2025",
    url: "#",
  },
  {
    id: 5,
    title: "Data Science Project Setup",
    type: "video",
    course: "Python for Data Science",
    downloads: 10,
    size: "45 MB",
    date: "Dec 30, 2024",
    url: "#",
  },
  {
    id: 6,
    title: "React State Management Examples",
    type: "code",
    course: "React Development",
    downloads: 15,
    size: "34 KB",
    date: "Dec 28, 2024",
    url: "#",
  },
  {
    id: 7,
    title: "System Design Interview Prep",
    type: "pdf",
    course: "System Design",
    downloads: 20,
    size: "512 KB",
    date: "Jan 12, 2025",
    url: "#",
  },
  {
    id: 8,
    title: "Node.js Performance Tips",
    type: "video",
    course: "Node.js Backend",
    downloads: 7,
    size: "28 MB",
    date: "Jan 5, 2025",
    url: "#",
  },
];

const ITEMS_PER_PAGE = 6;

const typeConfig = {
  pdf: {
    icon: FileText,
    bg: "bg-rose-100 dark:bg-rose-500/15",
    text: "text-rose-600 dark:text-rose-400",
    label: "PDF",
  },
  code: {
    icon: FileCode,
    bg: "bg-blue-100 dark:bg-blue-500/15",
    text: "text-blue-600 dark:text-blue-400",
    label: "Code",
  },
  video: {
    icon: Video,
    bg: "bg-purple-100 dark:bg-purple-500/15",
    text: "text-purple-600 dark:text-purple-400",
    label: "Video",
  },
  spreadsheet: {
    icon: FileSpreadsheet,
    bg: "bg-emerald-100 dark:bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    label: "Sheet",
  },
};

export default function MentorResources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [resources, setResources] = useState(MOCK_RESOURCES);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [previewResource, setPreviewResource] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const resourceInputRef = useRef(null);
  const [form, setForm] = useState({ title: "", course: "", type: "pdf" });

  const filtered = useMemo(() => {
    if (!searchQuery) return resources;
    return resources.filter(
      (r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.course.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [resources, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const openUploadModal = () => {
    setEditingResource(null);
    setForm({ title: "", course: "Full Stack MERN", type: "pdf" });
    setSelectedFile(null);
    setModalOpen(true);
  };

  const openEditModal = (resource) => {
    setEditingResource(resource);
    setForm({
      title: resource.title,
      course: resource.course,
      type: resource.type,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Resource title is required");
      return;
    }
    if (!editingResource && !selectedFile) {
      toast.error("Select a resource file first");
      return;
    }
    setSaving(true);
    try {
      if (editingResource) {
        await resourceService.update(editingResource.id, form);
        setResources((prev) =>
          prev.map((r) =>
            r.id === editingResource.id ? { ...r, ...form } : r,
          ),
        );
        toast.success("Resource updated");
      } else {
        const fileUrl = URL.createObjectURL(selectedFile);
        const uploadPayload = { ...form, fileName: selectedFile.name, size: `${(selectedFile.size / 1024).toFixed(1)} KB`, url: fileUrl };
        const created = await resourceService.create(uploadPayload);
        setResources((prev) => [
          ...prev,
          {
            id: created.id,
            title: form.title,
            course: form.course,
            type: form.type,
            downloads: 0,
            size: uploadPayload.size,
            date: "Just uploaded",
            url: created.url ?? fileUrl,
            fileName: created.fileName ?? selectedFile.name,
          },
        ]);
        toast.success("Resource uploaded");
      }
      setModalOpen(false);
    } catch {
      toast.error("Unable to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (resource) => {
    try {
      await resourceService.remove(resource.id);
      setResources((prev) => prev.filter((r) => r.id !== resource.id));
      toast.success("Resource deleted");
      setDeleteConfirm(null);
    } catch {
      toast.error("Unable to delete");
    }
  };

  const handleDownload = async (resource) => {
    if (!resource?.url || resource.url === "#") {
      toast.error("This resource does not have a downloadable file.");
      return;
    }
    setDownloadingId(resource.id);
    const toastId = toast.loading("Preparing download...");
    try {
      const link = document.createElement("a");
      link.href = resource.url;
      link.download = resource.fileName || resource.title || "resource";
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setResources((current) => current.map((item) => item.id === resource.id ? { ...item, downloads: Number(item.downloads || 0) + 1 } : item));
      toast.success("Download completed successfully", { id: toastId });
    } catch (error) {
      console.error("Resource download failed", error);
      toast.error("Download failed", { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreview = (resource) => {
    setPreviewResource(resource);
  };

  return (
    <div className="mx-auto max-w-[1500px] px-3 py-3 sm:px-4 lg:px-5">
      <div className="mb-3 flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Resources
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Manage learning materials for your courses
          </p>
        </div>
        <button
          onClick={openUploadModal}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:shadow-purple-500/25"
        >
          <Upload className="w-4 h-4" /> Upload Resource
        </button>
      </div>

      {/* Search */}
      <div className="mb-3 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {paginated.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
            <FileText className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm font-medium">No resources found</p>
          </div>
        ) : (
          paginated.map((resource, i) => {
            const config = typeConfig[resource.type] || typeConfig.pdf;
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i }}
                className="group rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-purple-500/25 hover:shadow-md dark:border-slate-700/40 dark:bg-slate-900/60"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.bg}`}
                  >
                    <config.icon className={`w-5 h-5 ${config.text}`} />
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handlePreview(resource)}
                      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-purple-600 dark:hover:bg-slate-800"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(resource)}
                      disabled={downloadingId === resource.id}
                      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(resource)}
                      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-500 dark:hover:bg-slate-800"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(resource)}
                      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="mb-0.5 truncate text-sm font-bold text-slate-900 dark:text-white">
                  {resource.title}
                </h3>
                <p className="mb-2.5 text-xs text-slate-400">
                  {resource.course}
                </p>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10px] text-slate-400 dark:border-slate-700/30">
                  <span
                    className={`px-1.5 py-0.5 font-bold uppercase tracking-wider rounded-full ${config.bg} ${config.text}`}
                  >
                    {config.label}
                  </span>
                  <span>
                    {resource.downloads} downloads · {resource.size}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${currentPage === page ? "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingResource ? "Edit Resource" : "Upload Resource"}
        description={
          editingResource
            ? "Update resource details"
            : "Upload a new learning resource"
        }
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg disabled:opacity-60 transition-all"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="e.g. React Hooks Cheat Sheet"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Course
              </label>
              <select
                value={form.course}
                onChange={(e) =>
                  setForm((p) => ({ ...p, course: e.target.value }))
                }
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
              >
                <option>Full Stack MERN</option>
                <option>Python for Data Science</option>
                <option>AI & Machine Learning</option>
                <option>React Development</option>
                <option>Node.js Backend</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, type: e.target.value }))
                }
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
              >
                <option value="pdf">PDF</option>
                <option value="code">Code</option>
                <option value="video">Video</option>
                <option value="spreadsheet">Spreadsheet</option>
              </select>
            </div>
          </div>
          {!editingResource && (
            <div>
              <input ref={resourceInputRef} type="file" hidden accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt,.js,.jsx,.ts,.tsx,.jpg,.jpeg,.png,.mp4,.webm" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
              <button type="button" className="w-full rounded-lg border-2 border-dashed border-slate-200 p-6 text-center transition-colors hover:border-purple-500/50 focus:outline-none focus:ring-4 focus:ring-purple-500/15 dark:border-slate-700" onClick={() => resourceInputRef.current?.click()}>
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-medium text-slate-500">{selectedFile ? selectedFile.name : "Click to upload file"}</p>
                <p className="text-xs text-slate-400 mt-1">PDF, Code, Video, or Spreadsheet</p>
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        open={!!previewResource}
        onClose={() => setPreviewResource(null)}
        title={previewResource?.title}
        description="Resource preview"
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setPreviewResource(null)}
              aria-label="Close resource preview"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-500/15 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Close
            </button>
            <button
              onClick={() => {
                handleDownload(previewResource);
                setPreviewResource(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        }
      >
        {previewResource && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-6 flex items-center justify-center min-h-[200px]">
              <div className="text-center">
                {previewResource.type === "pdf" && (
                  <FileText className="w-20 h-20 mx-auto mb-3 text-rose-400" />
                )}
                {previewResource.type === "code" && (
                  <FileCode className="w-20 h-20 mx-auto mb-3 text-blue-400" />
                )}
                {previewResource.type === "video" && (
                  <Video className="w-20 h-20 mx-auto mb-3 text-purple-400" />
                )}
                {previewResource.type === "spreadsheet" && (
                  <FileSpreadsheet className="w-20 h-20 mx-auto mb-3 text-emerald-400" />
                )}
                <p className="text-sm text-slate-400">
                  Preview not available for this file type
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Download to view the content
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3 text-center">
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${typeConfig[previewResource.type]?.bg || typeConfig.pdf.bg} ${typeConfig[previewResource.type]?.text || typeConfig.pdf.text}`}
                >
                  {typeConfig[previewResource.type]?.label || "PDF"}
                </span>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1">
                  Type
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3 text-center">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {previewResource.downloads}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                  Downloads
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3 text-center">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {previewResource.size}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                  Size
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Resource"
        description="This action cannot be undone"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteConfirm)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        }
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to delete{" "}
            <strong className="text-slate-900 dark:text-white">
              {deleteConfirm?.title}
            </strong>
            ?
          </p>
        </div>
      </Modal>
    </div>
  );
}
