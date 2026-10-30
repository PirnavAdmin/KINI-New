import useDashboardFormReturn from '@shared/hooks/useDashboardFormReturn';
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Trash2, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Modal from "@shared/components/Modal";
import { getApiErrorMessage } from "@shared/services/apiServices";
import { useAuth } from "@shared/hooks/useAuth";
import useLiveClasses from "../hooks/useLiveClasses";
import useCourseSyllabusModules from "../hooks/useCourseSyllabusModules";
import { exportLiveClassesToCsv } from "../utils/exportCsv";
import { TinyButton } from "../components/LiveClassPrimitives";
import LiveClassDrawer from "../components/LiveClassDrawer";
import LiveClassFormModal from "../components/LiveClassFormModal";
import ScheduleWorkspace from "../components/ScheduleWorkspace";
import {
  AttendanceModal,
  CancelClassModal,
  DeleteConfirmModal,
  PdfUploadModal,
  RecordingUploadModal,
} from "../components/LiveClassSupportModals";

// ─── Dropdown data shaping (unchanged business logic, relocated as-is) ──────
const normalizeId = (value) => String(value ?? "").trim();

const parseNumericList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeId(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => normalizeId(item))
      .filter(Boolean);
  }
  return [];
};

const getCourseId = (course) =>
  normalizeId(course?.courseId ?? course?.CourseId ?? course?.value ?? course?.id);
const getBatchId = (batch) =>
  normalizeId(batch?.batchId ?? batch?.BatchId ?? batch?.value ?? batch?.id);
const getMentorId = (mentor) =>
  normalizeId(mentor?.mentorId ?? mentor?.MentorId ?? mentor?.employeeId ?? mentor?.tutorId ?? mentor?.value ?? mentor?.id);
const getCourseLabel = (course) =>
  course?.courseName ?? course?.title ?? course?.name ?? course?.label ?? "-";
const getBatchLabel = (batch) =>
  batch?.batchName ?? batch?.name ?? batch?.title ?? batch?.label ?? "-";
const getMentorLabel = (mentor) =>
  mentor?.mentorName ??
  [mentor?.firstName, mentor?.lastName].filter(Boolean).join(" ").trim() ??
  mentor?.name ??
  mentor?.label ??
  "-";
const getCourseForBatch = (batch) =>
  normalizeId(batch?.courseId ?? batch?.course?.courseId ?? batch?.course?.id);
const getMentorForBatch = (batch) =>
  normalizeId(
    batch?.mentorId ??
      batch?.tutorId ??
      batch?.mentor?.mentorId ??
      batch?.mentor?.employeeId ??
      batch?.mentor?.id,
  );
const getMentorCourseIds = (mentor) =>
  parseNumericList(mentor?.courseIds ?? mentor?.courseIdsCsv);
const getMentorBatchIds = (mentor) =>
  parseNumericList(mentor?.batchIds ?? mentor?.batchIdsCsv ?? mentor?.batches);

const buildCourseOptions = (courses = []) =>
  courses
    .map((course) => ({
      value: getCourseId(course),
      label: getCourseLabel(course),
    }))
    .filter((item) => item.value);

const buildBatchOptions = (batches = []) =>
  batches
    .map((batch) => ({
      value: getBatchId(batch),
      label: getBatchLabel(batch),
      courseId: getCourseForBatch(batch),
    }))
    .filter((item) => item.value);

const buildMentorOptions = (mentors = []) =>
  mentors
    .map((mentor) => ({
      value: getMentorId(mentor),
      label: getMentorLabel(mentor),
      courseIds: getMentorCourseIds(mentor),
      batchIds: getMentorBatchIds(mentor),
    }))
    .filter((item) => item.value);

const toSelectOptions = (items = []) =>
  items.map((item) => ({
    value: item.id ?? item.value,
    label: item.label ?? item.name ?? String(item.value ?? ""),
  }));

// ─── View-preference persistence (density + column visibility) ─────────────
const DENSITY_KEY = "live-classes:density";
const COLUMNS_KEY = "live-classes:columns";
const DEFAULT_COLUMNS = {
  batch: true,
  mentor: true,
  datetime: true,
  status: true,
};

const readDensity = () => {
  try {
    // Compact (52px rows) by default; a saved "comfortable" choice is kept.
    return localStorage.getItem(DENSITY_KEY) === "comfortable"
      ? "comfortable"
      : "compact";
  } catch {
    return "compact";
  }
};

const readColumns = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(COLUMNS_KEY) || "null");
    return raw && typeof raw === "object"
      ? { ...DEFAULT_COLUMNS, ...raw }
      : DEFAULT_COLUMNS;
  } catch {
    return DEFAULT_COLUMNS;
  }
};

export default function LiveClasses() {
  const live = useLiveClasses();
  useDashboardFormReturn(live.formOpen);
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedClass = searchParams.get("class")?.trim() || "";
  const requestedMentor = searchParams.get("mentor")?.trim() || "";
  useEffect(() => {
    if (searchParams.get("create") !== "true") return;
    live.openForm();
    const next = new URLSearchParams(searchParams);
    next.delete("create");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, live.openForm]);
  useEffect(() => {
    if (requestedMentor) live.setSearch(requestedMentor);
  }, [requestedMentor, live.setSearch]);
  const requestedAttendance = searchParams.get("attendance")?.trim() || "";
  const [requestedClassHandled, setRequestedClassHandled] = useState(false);
  const [requestedAttendanceHandled, setRequestedAttendanceHandled] = useState(false);

  useEffect(() => {
    if (!requestedClass) return;
    live.setSearch(requestedClass);
    setRequestedClassHandled(false);
  }, [requestedClass, live.setSearch]);

  useEffect(() => {
    if (
      !requestedClass ||
      requestedClassHandled ||
      live.activeState.loading ||
      !live.activeState.loaded
    ) {
      return;
    }

    const query = requestedClass.toLowerCase();
    const record = live.filteredRecords.find((item) =>
      String(item.searchIndex || "")
        .toLowerCase()
        .includes(query),
    );
    setRequestedClassHandled(true);

    if (record) {
      live.openDetails(record).catch(() => {});
    } else {
      toast.error(
        `${requestedClass} is not available in the current live-class records.`,
      );
    }

    const next = new URLSearchParams(searchParams);
    next.delete("class");
    setSearchParams(next, { replace: true });
  }, [
    live.activeState.loaded,
    live.activeState.loading,
    live.filteredRecords,
    live.openDetails,
    requestedClass,
    requestedClassHandled,
    searchParams,
    setSearchParams,
  ]);

  useEffect(() => {
    if (!requestedAttendance) return;
    setRequestedAttendanceHandled(false);
  }, [requestedAttendance]);

  useEffect(() => {
    if (
      !requestedAttendance ||
      requestedAttendanceHandled ||
      live.activeState.loading ||
      !live.activeState.loaded
    ) {
      return;
    }

    const record = live.filteredRecords.find((item) => String(item.id) === requestedAttendance);
    setRequestedAttendanceHandled(true);
    if (record) {
      live.openAttendance(record).catch(() => {
        toast.error("Unable to load attendance for this class.");
      });
    } else {
      toast.error("This class is not available in the live-class records.");
    }

    const next = new URLSearchParams(searchParams);
    next.delete("attendance");
    setSearchParams(next, { replace: true });
  }, [
    live.activeState.loaded,
    live.activeState.loading,
    live.filteredRecords,
    live.openAttendance,
    requestedAttendance,
    requestedAttendanceHandled,
    searchParams,
    setSearchParams,
  ]);

  const selectedCourseId = normalizeId(live.formValues.courseId);
  const selectedBatchId = normalizeId(live.formValues.batchId);
  const syllabusModules = useCourseSyllabusModules(selectedCourseId, live.formOpen);
  const selectedBatch = useMemo(
    () => live.dropdowns.batches.find(
      (batch) => getBatchId(batch) === selectedBatchId,
    ),
    [live.dropdowns.batches, selectedBatchId],
  );
  const assignedBatchMentorId = getMentorForBatch(selectedBatch);

  const courseOptions = useMemo(
    () => buildCourseOptions(live.dropdowns.courses),
    [live.dropdowns.courses],
  );
  const batchOptions = useMemo(
    () =>
      selectedCourseId
        ? buildBatchOptions(
            live.dropdowns.batches.filter((batch) => {
              const batchCourseId = getCourseForBatch(batch);
              return !batchCourseId || batchCourseId === selectedCourseId;
            }),
          )
        : [],
    [live.dropdowns.batches, selectedCourseId],
  );
  const mentorHasAssignmentMetadata = useMemo(
    () =>
      live.dropdowns.mentors.some(
        (mentor) =>
          getMentorCourseIds(mentor).length || getMentorBatchIds(mentor).length,
      ),
    [live.dropdowns.mentors],
  );
  const { formOpen, formValues, setFormValues } = live;
  const filteredMentorRows = useMemo(() => {
    if (!selectedCourseId || !selectedBatchId) return [];
    return live.dropdowns.mentors.filter((mentor) => {
      const mentorCourseIds = getMentorCourseIds(mentor);
      const mentorBatchIds = getMentorBatchIds(mentor);
      const courseMatch =
        !mentorCourseIds.length || mentorCourseIds.includes(selectedCourseId);
      const batchMatch =
        !mentorBatchIds.length || mentorBatchIds.includes(selectedBatchId);
      return courseMatch && batchMatch;
    });
  }, [live.dropdowns.mentors, selectedBatchId, selectedCourseId]);
  const mentorOptions = useMemo(() => {
    if (!selectedCourseId || !selectedBatchId) return [];
    if (assignedBatchMentorId) {
      const assignedMentor = live.dropdowns.mentors.find(
        (mentor) => getMentorId(mentor) === assignedBatchMentorId,
      );
      return buildMentorOptions([
        assignedMentor || {
          mentorId: assignedBatchMentorId,
          mentorName:
            selectedBatch?.mentorName ??
            selectedBatch?.tutorName ??
            selectedBatch?.mentor?.mentorName ??
            selectedBatch?.mentor?.name ??
            `Mentor #${assignedBatchMentorId}`,
        },
      ]);
    }
    const rows = mentorHasAssignmentMetadata
      ? filteredMentorRows.length
        ? filteredMentorRows
        : live.dropdowns.mentors
      : live.dropdowns.mentors;
    return buildMentorOptions(rows);
  }, [
    filteredMentorRows,
    assignedBatchMentorId,
    live.dropdowns.mentors,
    mentorHasAssignmentMetadata,
    selectedBatchId,
    selectedBatch,
    selectedCourseId,
  ]);
  const platformOptions = useMemo(
    () => toSelectOptions(live.dropdowns.platforms),
    [live.dropdowns.platforms],
  );
  const statusOptions = useMemo(
    () => toSelectOptions(live.dropdowns.statuses),
    [live.dropdowns.statuses],
  );
  const mentorHelperText =
    !selectedCourseId || !selectedBatchId
      ? "Select a course and batch to load mentors."
      : mentorOptions.length
        ? ""
        : mentorHasAssignmentMetadata
          ? "No mentors are assigned to the selected course and batch."
          : "No mentor assignment metadata was returned, so showing all mentors.";

  const getFormFieldError = (...keys) => {
    for (const key of keys) {
      if (!key) continue;
      const direct = live.formFieldErrors[key];
      if (direct) return Array.isArray(direct) ? direct[0] : direct;
      const pascalKey =
        String(key).charAt(0).toUpperCase() + String(key).slice(1);
      const pascal = live.formFieldErrors[pascalKey];
      if (pascal) return Array.isArray(pascal) ? pascal[0] : pascal;
    }
    return "";
  };

  const handleCourseChange = (value) => {
    live.setFormValues((current) => ({
      ...current,
      courseId: value,
      // A module always belongs to the previous course's syllabus.
      moduleId: "",
      batchId: "",
      mentorId: "",
    }));
  };

  const handleModuleChange = (value) => {
    live.setFormValues((current) => ({ ...current, moduleId: value }));
  };

  // The backend requires a module on a new class (moduleId ≥ 1), so a course
  // without syllabus modules can't be scheduled. Edit only asks for one when
  // the course has modules to choose from.
  const submitLiveClassForm = () => {
    const errors = {};
    const creating = live.formMode !== "edit";
    if (selectedCourseId && syllabusModules.status === "loading") errors.moduleId = ["Syllabus modules are still loading."];
    else if (creating && selectedCourseId && syllabusModules.status === "error") errors.moduleId = ["Syllabus modules couldn't be loaded. Close and reopen the form to try again."];
    else if (creating && selectedCourseId && !syllabusModules.options.length) errors.moduleId = ["This course has no syllabus modules. Add one before scheduling a class."];
    else if (syllabusModules.options.length && !live.formValues.moduleId) errors.moduleId = ["Module is required."];
    return live.submitForm(errors);
  };

  const handleBatchChange = (value) => {
    const batch = live.dropdowns.batches.find(
      (item) => getBatchId(item) === normalizeId(value),
    );
    live.setFormValues((current) => ({
      ...current,
      batchId: value,
      mentorId: getMentorForBatch(batch),
    }));
  };

  const handleMentorChange = (value) => {
    live.setFormValues((current) => ({ ...current, mentorId: value }));
  };

  useEffect(() => {
    if (!formOpen) return;

    if (!selectedCourseId) {
      if (formValues.batchId || formValues.mentorId) {
        setFormValues((current) => ({ ...current, batchId: "", mentorId: "" }));
      }
      return;
    }

    if (
      formValues.batchId &&
      !batchOptions.some(
        (batch) => normalizeId(batch.value) === selectedBatchId,
      )
    ) {
      setFormValues((current) => ({ ...current, batchId: "", mentorId: "" }));
      return;
    }

    if (
      formValues.mentorId &&
      !mentorOptions.some(
        (mentor) =>
          normalizeId(mentor.value) === normalizeId(formValues.mentorId),
      )
    ) {
      setFormValues((current) => ({ ...current, mentorId: "" }));
    }
  }, [
    batchOptions,
    formOpen,
    formValues.batchId,
    formValues.mentorId,
    mentorOptions,
    selectedBatchId,
    selectedCourseId,
    setFormValues,
  ]);

  // Drop a module that is not in the current course's syllabus options.
  useEffect(() => {
    if (!formOpen || !formValues.moduleId || syllabusModules.status === "loading") return;
    if (!syllabusModules.options.some((option) => option.value === String(formValues.moduleId))) {
      setFormValues((current) => ({ ...current, moduleId: "" }));
    }
  }, [formOpen, formValues.moduleId, setFormValues, syllabusModules.options, syllabusModules.status]);

  // ─── View preferences: density + column visibility ────────────────────
  // No UI in the redesigned workspace changes these, so they're the saved
  // (or default) values for the session rather than mutable state.
  const [density] = useState(readDensity);
  const [visibleColumns] = useState(readColumns);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [selectionTab, setSelectionTab] = useState(live.activeTab);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Clear the bulk-selection whenever the active tab changes. Adjusting
  // state during render (rather than in an effect) avoids an extra
  // cascading render pass — this is the pattern React recommends for
  // "reset state when a prop/value changes".
  if (selectionTab !== live.activeTab) {
    setSelectionTab(live.activeTab);
    setSelectedIds(new Set());
  }

  const toggleRow = (id) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAllOnPage = (pageRows) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      const allSelected =
        pageRows.length > 0 && pageRows.every((row) => next.has(row.id));
      pageRows.forEach((row) => {
        if (allSelected) next.delete(row.id);
        else next.add(row.id);
      });
      return next;
    });

  const clearSelection = () => setSelectedIds(new Set());

  // ─── Toolbar actions ────────────────────────────────────────────────────
  const handleRefresh = async () => {
    await Promise.all([
      live.refreshTab(live.activeTab),
      live.reloadDashboard(),
    ]);
    toast.success("Live classes refreshed.");
  };

  const handleExportAll = () => {
    const exported = exportLiveClassesToCsv(
      live.filteredRecords,
      `live-classes-${live.activeTab}.csv`,
    );
    toast[exported ? "success" : "error"](
      exported ? "Exported live classes to CSV." : "Nothing to export.",
    );
  };

  const handleExportSelected = () => {
    const rows = live.filteredRecords.filter((row) => selectedIds.has(row.id));
    const exported = exportLiveClassesToCsv(rows, "live-classes-selected.csv");
    if (exported) toast.success(`Exported ${rows.length} selected classes.`);
  };

  const confirmBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    await live.submitBulkDelete(ids);
    setBulkDeleteOpen(false);
    clearSelection();
    toast.success(
      `Deleted ${ids.length} live class${ids.length === 1 ? "" : "es"}.`,
    );
  };

  return (
    <div className="w-full min-w-0">
      <ScheduleWorkspace
        live={live}
        onNew={() => live.openForm()}
        onRefresh={handleRefresh}
        onExport={handleExportAll}
        currentUser={user}
        tableState={{
          density,
          visibleColumns,
          pageSize: live.pageSize,
          selectedIds,
          onToggleRow: toggleRow,
          onToggleAllOnPage: toggleAllOnPage,
        }}
        bulkActions={{
          count: selectedIds.size,
          onExport: handleExportSelected,
          onDelete: () => setBulkDeleteOpen(true),
          onClear: clearSelection,
        }}
      />

      <LiveClassDrawer
        record={live.selectedRecord}
        open={Boolean(live.selectedRecord)}
        onClose={live.closeDetails}
        mediaLoading={live.selectedMediaLoading}
        selectedPdf={live.selectedPdf}
        selectedRecording={live.selectedRecording}
        pendingAction={live.pendingRecordAction}
        onJoin={async (record) => {
          try {
            await live.submitJoin(record);
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Unable to open meeting link."));
          }
        }}
        onStart={async (record) => {
          try {
            await live.submitStart(record);
            toast.success("Class started.");
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Unable to start class."));
          }
        }}
        onEnd={async (record) => {
          try {
            await live.submitEnd(record);
            toast.success("Class completed.");
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Unable to end class."));
          }
        }}
        onCancel={(record) => {
          live.setCancelTarget(record);
          live.closeDetails();
        }}
        onEdit={(record) => {
          live.openForm(record);
          live.closeDetails();
        }}
        onAttendance={(record) => live.openAttendance(record)}
        onNotes={(record) => live.openPdf(record)}
        onRecording={(record) => live.openRecording(record)}
        onCopy={async (value) => {
          if (!value) {
            toast.error("Meeting link is not available.");
            return;
          }
          try {
            await navigator.clipboard.writeText(value);
            toast.success("Meeting link copied.");
          } catch {
            toast.error("Unable to copy meeting link.");
          }
        }}
      />

      <LiveClassFormModal
        open={live.formOpen}
        onClose={live.closeForm}
        mode={live.formMode}
        values={live.formValues}
        onChange={live.setFormValues}
        saving={live.formSaving}
        error={live.formError}
        getFieldError={getFormFieldError}
        courseOptions={courseOptions}
        batchOptions={batchOptions}
        mentorOptions={mentorOptions}
        platformOptions={platformOptions}
        statusOptions={statusOptions}
        selectedCourseId={selectedCourseId}
        selectedBatchId={selectedBatchId}
        mentorHelperText={mentorHelperText}
        dropdownLoading={live.dropdownLoading}
        moduleOptions={syllabusModules.options}
        moduleStatus={syllabusModules.status}
        moduleLoadError={syllabusModules.error}
        onCourseChange={handleCourseChange}
        onModuleChange={handleModuleChange}
        onBatchChange={handleBatchChange}
        onMentorChange={handleMentorChange}
        onSubmit={submitLiveClassForm}
      />

      <AttendanceModal
        open={live.attendanceOpen}
        onClose={() => live.setAttendanceOpen(false)}
        loading={live.selectedAttendanceLoading}
        rows={live.selectedAttendance}
        dashboard={live.selectedAttendanceDashboard}
        edits={live.attendanceEdits}
        onEditChange={(studentId, value) =>
          live.setAttendanceEdits((current) => ({
            ...current,
            [studentId]: value,
          }))
        }
        saving={live.attendanceSaving}
        onSubmit={live.submitAttendance}
        generating={live.attendanceGenerating}
        onGenerate={live.generateAttendance}
        exporting={live.attendanceExporting}
        onExport={live.downloadAttendanceReport}
      />

      <PdfUploadModal
        open={live.pdfOpen}
        onClose={() => live.setPdfOpen(false)}
        form={live.pdfForm}
        onFormChange={(patch) =>
          live.setPdfForm((current) => ({ ...current, ...patch }))
        }
        saving={live.pdfSaving}
        onSubmit={live.submitPdf}
      />

      <RecordingUploadModal
        open={live.recordingOpen}
        onClose={() => live.setRecordingOpen(false)}
        form={live.recordingForm}
        onFormChange={(patch) =>
          live.setRecordingForm((current) => ({ ...current, ...patch }))
        }
        saving={live.recordingSaving}
        onSubmit={live.submitRecording}
      />

      <DeleteConfirmModal
        open={Boolean(live.deleteTarget)}
        onClose={() => live.setDeleteTarget(null)}
        target={live.deleteTarget}
        saving={live.actionLoading}
        onSubmit={live.submitDelete}
      />

      <CancelClassModal
        open={Boolean(live.cancelTarget)}
        onClose={() => live.setCancelTarget(null)}
        target={live.cancelTarget}
        reason={live.cancelReason}
        onReasonChange={live.setCancelReason}
        saving={live.actionLoading}
        onSubmit={live.submitCancel}
      />

      <Modal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        title="Delete Selected Live Classes"
        description="This will permanently remove the selected classes from the schedule."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3">
            <TinyButton
              variant="secondary"
              icon={X}
              onClick={() => setBulkDeleteOpen(false)}
            >
              Cancel
            </TinyButton>
            <TinyButton
              variant="danger"
              icon={Trash2}
              disabled={live.actionLoading}
              onClick={confirmBulkDelete}
            >
              {live.actionLoading
                ? "Deleting..."
                : `Delete ${selectedIds.size}`}
            </TinyButton>
          </div>
        }
      >
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
          Are you sure you want to delete{" "}
          <strong className="text-slate-900 dark:text-white">
            {selectedIds.size}
          </strong>{" "}
          selected live class{selectedIds.size === 1 ? "" : "es"}? This action
          can not be undone.
        </p>
      </Modal>
    </div>
  );
}
