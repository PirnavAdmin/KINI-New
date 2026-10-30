import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { batchService } from '@/shared/services/batchService';
import { courseService } from '@/shared/services/courseService';
import { mentorService } from '@/shared/services/mentorService';
import { getApiErrorMessage, readStoredOrganizationId } from '@shared/services/apiServices';
import { attendanceService } from '@shared/services/attendanceService';
import { liveClassService } from '../services/liveClassService';
import { normalizeAttendanceRows, normalizeDashboard, normalizeDropdownItems, normalizeLiveClass, normalizeLiveClassList } from '../utils/liveClassMappers';
import { getMeetingPlatformIdFromLabel, getMeetingPlatformLabel, LIVE_CLASS_STATUS_OPTIONS, MEETING_PLATFORM_OPTIONS, toModuleId } from '../utils/liveClassOptions';
import { isValidScheduleDate, SCHEDULE_DATE_MAX, SCHEDULE_DATE_MIN } from '../utils/dateUtils';
import { liveClassFieldErrors, liveClassSaveErrorMessage, logLiveClassSaveError } from '../utils/liveClassSaveError';
import { saveScheduledClass, saveScheduledClassNotification } from '@shared/services/localScheduleStore';
import { filenameFromDisposition, triggerFileDownload } from '@shared/utils/download';

const TAB_LOADERS = {
  all: (params) => liveClassService.list(params),
  today: (params) => liveClassService.today(params),
  upcoming: (params) => liveClassService.upcoming(params),
  live: (params) => liveClassService.live(params),
  completed: (params) => liveClassService.completed(params),
  cancelled: (params) => liveClassService.list({ ...params, status: 'cancelled' }),
};

const createTabState = () => ({
  items: [],
  loaded: false,
  organizationId: String(readStoredOrganizationId() ?? ''),
  loading: false,
  refreshing: false,
  error: '',
  errorStatus: null,
});

const createEmptyTabs = () => Object.keys(TAB_LOADERS).reduce((acc, key) => {
  acc[key] = createTabState();
  return acc;
}, {});

const DEFAULT_PAGE_SIZE = 8;
const isDemoSession = () => localStorage.getItem('isDemo') === 'true';
const DEMO_DROPDOWNS = { courses:[{id:101,name:'Full Stack Web Development'},{id:102,name:'Data Science & AI'},{id:103,name:'UI/UX Product Design'}], batches:[{id:301,name:'Full Stack Morning'},{id:303,name:'Data Science Evening'},{id:304,name:'UI/UX September Cohort'}], mentors:[{id:201,name:'Rahul Kumar'},{id:202,name:'Priya Sharma'},{id:203,name:'Neha Verma'},{id:204,name:'Arjun Kapoor'}] };
const getDemoClasses = () => { const day=new Date();day.setHours(0,0,0,0);const date=(offset)=>{const value=new Date(day);value.setDate(value.getDate()+offset);return value.toISOString().slice(0,10)};return [
  {id:'demo-class-1',title:'React Fundamentals',courseId:101,courseName:'Full Stack Web Development',batchId:301,batchName:'Full Stack Morning',mentorId:201,mentorName:'Rahul Kumar',date:date(0),startTime:'10:00',endTime:'11:30',status:'live',platform:'Zoom',studentsCount:28,capacity:30},
  {id:'demo-class-2',title:'Python for Data Analysis',courseId:102,courseName:'Data Science & AI',batchId:303,batchName:'Data Science Evening',mentorId:202,mentorName:'Priya Sharma',date:date(0),startTime:'14:00',endTime:'15:30',status:'scheduled',platform:'Google Meet',studentsCount:26,capacity:30},
  {id:'demo-class-3',title:'Design Systems Workshop',courseId:103,courseName:'UI/UX Product Design',batchId:304,batchName:'UI/UX September Cohort',mentorId:203,mentorName:'Neha Verma',date:date(1),startTime:'11:00',endTime:'12:30',status:'scheduled',platform:'Room A-12',studentsCount:18,capacity:25},
  {id:'demo-class-4',title:'Node.js APIs',courseId:101,courseName:'Full Stack Web Development',batchId:301,batchName:'Full Stack Morning',mentorId:201,mentorName:'Rahul Kumar',date:date(2),startTime:'09:30',endTime:'11:00',status:'scheduled',platform:'Lab 201',studentsCount:28,capacity:30},
  {id:'demo-class-5',title:'Machine Learning Models',courseId:102,courseName:'Data Science & AI',batchId:303,batchName:'Data Science Evening',mentorId:202,mentorName:'Priya Sharma',date:date(3),startTime:'16:00',endTime:'17:30',status:'scheduled',platform:'Zoom',studentsCount:26,capacity:30},
  {id:'demo-class-6',title:'Portfolio Review',courseId:103,courseName:'UI/UX Product Design',batchId:304,batchName:'UI/UX September Cohort',mentorId:203,mentorName:'Neha Verma',date:date(-1),startTime:'13:00',endTime:'14:00',status:'completed',platform:'Google Meet',studentsCount:17,capacity:25},
]};

const toRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

// The live-class endpoint can return records without an organization ID. Use
// the current organization's batches as the ownership boundary for those
// records; otherwise old classes from another organization leak into the
// Classes page despite the current session token.
const filterClassesForOrganization = (classes, batchResponse) => {
  const organizationId = readStoredOrganizationId();
  const batches = toRows(batchResponse);
  const organizationBatchIds = new Set(
    batches.map((batch) => batch.batchId ?? batch.id).filter((id) => id != null).map(String),
  );

  return classes.filter((item) => {
    const rowOrganizationId = item.organizationId ?? item.orgId ?? item.organization?.id ?? item.organization?.organizationId;
    if (rowOrganizationId != null) return organizationId != null && String(rowOrganizationId) === String(organizationId);
    const batchId = item.batchId ?? item.batch?.batchId ?? item.batch?.id;
    return batchId != null && organizationBatchIds.has(String(batchId));
  });
};

export const DEFAULT_LIVE_CLASS_FORM = {
  title: '',
  description: '',
  courseId: '',
  // Syllabus module (GET .../courses/{courseId}/syllabus → modules[].moduleId),
  // sent as the required numeric moduleId of the live class.
  moduleId: '',
  batchId: '',
  mentorId: '',
  platform: '',
  meetingUrl: '',
  meetingId: '',
  password: '',
  date: '',
  startTime: '',
  endTime: '',
  status: 'scheduled',
};

const DEFAULT_RECORDING_FORM = {
  source: 'youtube',
  url: '',
  title: '',
  notes: '',
};

const DEFAULT_PDF_FORM = {
  file: null,
  title: '',
};

const DEFAULT_ATTENDANCE_EDIT = {};

const formatTimeForApi = (value) => {
  if (!value) return '';
  const parts = String(value).split(':').filter(Boolean);
  if (parts.length >= 2) return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
  return String(value);
};

const formatDateForApi = (value) => {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
};

const toOptionalNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? undefined : numeric;
};

const getMeetingPlatformId = (record = {}) => {
  const direct = toOptionalNumber(
    record.meetingPlatformId
      ?? record.platformId
      ?? record.meetingPlatform?.id
      ?? record.platform?.id
      ?? record.meetingPlatform?.meetingPlatformId,
  );

  if (direct) return String(direct);

  return getMeetingPlatformIdFromLabel(
    record.meetingPlatform
      ?? record.platform
      ?? record.meetingPlatformName
      ?? record.platformName,
  );
};

const isValidHttpUrl = (value) => {
  if (!value) return false;
  try {
    const url = new URL(String(value).trim());
    return ['http:', 'https:', 'ftp:'].includes(url.protocol);
  } catch {
    return false;
  }
};

const getErrorStatus = (error) => Number(error?.response?.status || 0) || null;

export default function useLiveClasses() {
  const organizationScope = String(readStoredOrganizationId() ?? '');
  const [activeTab, setActiveTab] = useState('all');
  const [classClock, setClassClock] = useState(Date.now);
  const [tabs, setTabs] = useState(createEmptyTabs);
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const [dashboardErrorStatus, setDashboardErrorStatus] = useState(null);
  const [dropdowns, setDropdowns] = useState({ courses: [], batches: [], mentors: [], platforms: [], statuses: [] });
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [dropdownError, setDropdownError] = useState('');
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState([]);
  const [selectedAttendanceDashboard, setSelectedAttendanceDashboard] = useState(null);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [selectedAttendanceLoading, setSelectedAttendanceLoading] = useState(false);
  const [selectedMediaLoading, setSelectedMediaLoading] = useState(false);
  const [formMode, setFormMode] = useState('create');
  // The record being edited, tracked separately from selectedId (the details
  // drawer's own selection). LiveClasses.jsx's onEdit calls openForm(record)
  // then closeDetails() in the same handler — closeDetails() nulls selectedId
  // immediately, before the user ever gets to Save. submitForm used to gate
  // update-vs-create on `formMode === 'edit' && selectedId`, so by the time
  // Save ran, selectedId was already null and a genuine edit silently fell
  // through to the create (POST) branch instead of update (PUT) — carrying
  // the edited record's own stale fields (including its real status, e.g.
  // "completed" for a past class) into a brand-new class creation, which the
  // backend then correctly flagged as conflicting with the very record being
  // "edited".
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formFieldErrors, setFormFieldErrors] = useState({});
  const [formValues, setFormValues] = useState(DEFAULT_LIVE_CLASS_FORM);
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [attendanceEdits, setAttendanceEdits] = useState(DEFAULT_ATTENDANCE_EDIT);
  const [attendanceGenerating, setAttendanceGenerating] = useState(false);
  const [attendanceExporting, setAttendanceExporting] = useState('');
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfSaving, setPdfSaving] = useState(false);
  const [pdfForm, setPdfForm] = useState(DEFAULT_PDF_FORM);
  const [recordingOpen, setRecordingOpen] = useState(false);
  const [recordingSaving, setRecordingSaving] = useState(false);
  const [recordingForm, setRecordingForm] = useState(DEFAULT_RECORDING_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  // Tracks which single record currently has a start/end/join request in
  // flight, so only that record's own buttons disable — sharing one boolean
  // across every row would grey out the whole list while any one action runs.
  const [pendingRecordAction, setPendingRecordAction] = useState(null); // { id, type: 'start' | 'end' | 'join' }
  const tabsRef = useRef(tabs);
  const inFlightRef = useRef({});

  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  const updateTabState = useCallback((tab, updater) => {
    setTabs((current) => {
      const previous = current[tab] || createTabState();
      const nextState = typeof updater === 'function' ? updater(previous) : updater;
      return {
        ...current,
        [tab]: nextState,
      };
    });
  }, []);

  const loadTab = useCallback(async (tab, { force = false } = {}) => {
    const loader = TAB_LOADERS[tab] || TAB_LOADERS.all;
    const current = tabsRef.current[tab] || createTabState();
    const organizationId = organizationScope;

    if (inFlightRef.current[tab]) return inFlightRef.current[tab];
    // Invalidate rows loaded for another organization, and any pre-scope cache
    // that predates organizationId tracking (including a page kept open during
    // hot reload).
    if (current.loaded && current.organizationId === organizationId && !force) return current.items;
    if (isDemoSession()) {
      const today=new Date().toISOString().slice(0,10), now=new Date(today);
      const rows=getDemoClasses().filter(item=>tab==='today'?item.date===today:tab==='upcoming'?new Date(item.date)>=now&&!['completed','cancelled'].includes(item.status):tab==='live'?item.status==='live':tab==='completed'?item.status==='completed':tab==='cancelled'?item.status==='cancelled':true);
      const normalized=normalizeLiveClassList(rows);updateTabState(tab,{items:normalized,loaded:true,organizationId,loading:false,refreshing:false,error:'',errorStatus:null});return normalized;
    }

    updateTabState(tab, (previous) => ({
      ...previous,
      loading: !previous.loaded && !force,
      refreshing: force && previous.loaded,
      error: '',
    }));

    const request = Promise.all([
      loader({ page: 1, pageSize: 1000 }),
      batchService.getOrganizationBatches({ pageNumber: 1, pageSize: 1000 }),
    ])
      .then(([rows, organizationBatches]) => {
        const normalized = normalizeLiveClassList(filterClassesForOrganization(rows, organizationBatches));
        updateTabState(tab, (previous) => ({
          ...previous,
          items: normalized,
          loaded: true,
          organizationId,
          loading: false,
          refreshing: false,
          error: '',
        }));
        return normalized;
      })
      .catch((error) => {
        const message = getApiErrorMessage(error, 'Failed to load live classes.');
        updateTabState(tab, (previous) => ({
          ...previous,
          loading: false,
          refreshing: false,
          error: message,
          errorStatus: getErrorStatus(error),
        }));
        throw error;
      })
      .finally(() => {
        delete inFlightRef.current[tab];
      });

    inFlightRef.current[tab] = request;
    return request;
  }, [organizationScope, updateTabState]);

  const refreshTab = useCallback((tab = activeTab) => loadTab(tab, { force: true }).catch(() => {}), [activeTab, loadTab]);

  const loadDashboard = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError('');
    setDashboardErrorStatus(null);
    if(isDemoSession()){const rows=normalizeLiveClassList(getDemoClasses());setDashboard(normalizeDashboard({},rows));setDashboardLoading(false);return}
    try {
      const rows = await loadTab('all');
      setDashboard(normalizeDashboard({}, rows));
    } catch (error) {
      setDashboardError(getApiErrorMessage(error, 'Unable to load dashboard metrics.'));
      setDashboardErrorStatus(getErrorStatus(error));
      setDashboard(null);
    } finally {
      setDashboardLoading(false);
    }
  }, [loadTab]);

  const loadDropdowns = useCallback(async () => {
    setDropdownLoading(true);
    setDropdownError('');
    if(isDemoSession()){setDropdowns({courses:normalizeDropdownItems(DEMO_DROPDOWNS.courses),batches:normalizeDropdownItems(DEMO_DROPDOWNS.batches),mentors:normalizeDropdownItems(DEMO_DROPDOWNS.mentors),platforms:normalizeDropdownItems(MEETING_PLATFORM_OPTIONS),statuses:normalizeDropdownItems(LIVE_CLASS_STATUS_OPTIONS)});setDropdownLoading(false);return}
    try {
      const [coursesResult, batchesResult, mentorsResult] = await Promise.allSettled([
        courseService.getCourses({ page: 1, pageSize: 1000, sortBy: 'CourseName', sortOrder: 'asc' }),
        batchService.getAll({ pageNumber: 1, pageSize: 1000 }),
        mentorService.getMentors({ PageNumber: 1, PageSize: 1000, SortBy: 'MentorName', IsDescending: false }),
      ]);

      if (import.meta.env.DEV) {
        console.debug('Live Classes dropdown raw responses', {
          courses: coursesResult.status === 'fulfilled' ? coursesResult.value : coursesResult.reason,
          batches: batchesResult.status === 'fulfilled' ? batchesResult.value : batchesResult.reason,
          mentors: mentorsResult.status === 'fulfilled' ? mentorsResult.value : mentorsResult.reason,
        });
      }

      setDropdowns({
        courses: coursesResult.status === 'fulfilled' ? normalizeDropdownItems(toRows(coursesResult.value)) : [],
        batches: batchesResult.status === 'fulfilled' ? normalizeDropdownItems(toRows(batchesResult.value)) : [],
        mentors: mentorsResult.status === 'fulfilled' ? normalizeDropdownItems(toRows(mentorsResult.value)) : [],
        platforms: normalizeDropdownItems(MEETING_PLATFORM_OPTIONS),
        statuses: normalizeDropdownItems(LIVE_CLASS_STATUS_OPTIONS),
      });
      if (import.meta.env.DEV) {
        console.debug('Live Classes dropdowns loaded', {
          courses: coursesResult.status === 'fulfilled' ? toRows(coursesResult.value).length : 0,
          batches: batchesResult.status === 'fulfilled' ? toRows(batchesResult.value).length : 0,
          mentors: mentorsResult.status === 'fulfilled' ? toRows(mentorsResult.value).length : 0,
        });
      }
    } catch (error) {
      setDropdownError(getApiErrorMessage(error, 'Unable to load dropdowns.'));
      setDropdowns({
        courses: [],
        batches: [],
        mentors: [],
        platforms: normalizeDropdownItems(MEETING_PLATFORM_OPTIONS),
        statuses: normalizeDropdownItems(LIVE_CLASS_STATUS_OPTIONS),
      });
    } finally {
      setDropdownLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([loadDashboard(), loadDropdowns()]);
    };

    void initialize();
  }, [loadDashboard, loadDropdowns]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadTab(activeTab).catch(() => {}), 0);
    return () => window.clearTimeout(timer);
  }, [activeTab, loadTab]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setClassClock(Date.now());
      loadTab(activeTab, { force: true }).catch(() => {});
    }, 30000);
    return () => window.clearInterval(timer);
  }, [activeTab, loadTab]);

  const activeState = tabs[activeTab] || createTabState();
  const deferredSearch = useDeferredValue(search);
  const query = deferredSearch.trim().toLowerCase();

  const filteredRecords = useMemo(() => {
    const items = normalizeLiveClassList(activeState.items || []).filter((item) => {
      if (activeTab === 'upcoming') return item.status === 'scheduled' && Date.parse(item.startAt) > classClock;
      if (activeTab === 'live') return item.status === 'live';
      return true;
    });
    if (!query) return items;
    return items.filter((item) => String(item.searchIndex || '').includes(query));
  }, [activeState.items, query, activeTab, classClock]);

  const pagedRecords = useMemo(() => filteredRecords, [filteredRecords]);

  const openForm = useCallback((record = null) => {
    setFormError('');
    setFormFieldErrors({});
    if (record) {
      setFormMode('edit');
      setEditingRecordId(record.id ?? record.liveClassId ?? null);
      setFormValues({
        title: record.title || '',
        description: record.description || '',
        courseId: record.courseId || '',
        // Preselected when the class record carries its module; the page
        // clears it if it isn't in the course's syllabus.
        moduleId: toModuleId(record.moduleId) ? String(record.moduleId) : '',
        batchId: record.batchId || '',
        mentorId: record.mentorId || '',
        meetingPlatformId: getMeetingPlatformId(record),
        meetingUrl: record.meetingUrl || '',
        meetingId: record.meetingId || '',
        password: record.password || '',
        date: record.startDate || '',
        startTime: record.startTime || '',
        endTime: record.endTime || '',
        status: record.status || 'scheduled',
      });
    } else {
      setFormMode('create');
      setEditingRecordId(null);
      setFormValues(DEFAULT_LIVE_CLASS_FORM);
    }
    setFormOpen(true);
  }, []);

  const openDuplicate = useCallback((record = null) => {
    if (!record) return;
    const normalized = normalizeLiveClass(record);
    setFormError('');
    setFormFieldErrors({});
    setSelectedId(null);
    setSelectedRecord(null);
    setFormMode('create');
    setEditingRecordId(null);
    setFormValues({
      title: normalized.title || '',
      description: normalized.description || '',
      courseId: normalized.courseId || '',
      moduleId: '',
      batchId: normalized.batchId || '',
      mentorId: normalized.mentorId || '',
      meetingPlatformId: getMeetingPlatformId(normalized),
      meetingUrl: normalized.meetingUrl || '',
      meetingId: normalized.meetingId || '',
      password: normalized.password || '',
      date: normalized.startDate || '',
      startTime: normalized.startTime || '',
      endTime: normalized.endTime || '',
      status: 'scheduled',
    });
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setFormError('');
    setFormFieldErrors({});
  }, []);

  const loadRecordDetails = useCallback(async (id) => {
    if (!id) return null;
    setSelectedMediaLoading(true);
    setSelectedAttendanceLoading(true);
    try {
      const [details, attendance, pdf, recording, dashboard] = await Promise.allSettled([
        liveClassService.getById(id),
        // /api/Attendance/liveclass/{id} — the dedicated Attendance controller,
        // replacing the older /api/v1/live-classes/{id}/attendance route.
        attendanceService.byLiveClass(id),
        liveClassService.getPdf(id),
        liveClassService.getRecording(id),
        // /api/Attendance/liveclass/{id}/dashboard — best-effort stats; a
        // deployment that hasn't wired this up yet must not block the rest
        // of the drawer from loading.
        attendanceService.liveClassDashboard(id).catch(() => null),
      ]);

      const hydrated = details.status === 'fulfilled' ? normalizeLiveClass(details.value) : selectedRecord;
      if (hydrated) setSelectedRecord(hydrated);
      if (attendance.status === 'fulfilled') setSelectedAttendance(normalizeAttendanceRows(attendance.value || []));
      if (pdf.status === 'fulfilled') setSelectedPdf(pdf.value || null);
      if (recording.status === 'fulfilled') setSelectedRecording(recording.value || null);
      setSelectedAttendanceDashboard(dashboard.status === 'fulfilled' && dashboard.value && typeof dashboard.value === 'object' ? dashboard.value : null);
      return hydrated;
    } finally {
      setSelectedMediaLoading(false);
      setSelectedAttendanceLoading(false);
    }
  }, [selectedRecord]);

  const openDetails = useCallback(async (record) => {
    const normalized = normalizeLiveClass(record);
    setSelectedId(normalized.id);
    setSelectedRecord(normalized);
    setAttendanceOpen(false);
    setPdfOpen(false);
    setRecordingOpen(false);
    await loadRecordDetails(normalized.id);
  }, [loadRecordDetails]);

  const closeDetails = useCallback(() => {
    setSelectedId(null);
    setSelectedRecord(null);
    setSelectedAttendance([]);
    setSelectedAttendanceDashboard(null);
    setSelectedPdf(null);
    setSelectedRecording(null);
    setAttendanceEdits({});
  }, []);

  const openAttendance = useCallback(async (record) => {
    const hydrated = record || selectedRecord;
    if (!hydrated) return;
    if (!selectedAttendance.length || selectedId !== hydrated.id) {
      setSelectedId(hydrated.id);
      setSelectedRecord(normalizeLiveClass(hydrated));
      await loadRecordDetails(hydrated.id);
    }
    setAttendanceEdits({});
    setAttendanceOpen(true);
  }, [loadRecordDetails, selectedAttendance.length, selectedId, selectedRecord]);

  const openPdf = useCallback((record) => {
    const hydrated = normalizeLiveClass(record || selectedRecord || {});
    setSelectedId(hydrated.id);
    setSelectedRecord(hydrated);
    setPdfForm({ file: null, title: hydrated.title || '' });
    setPdfOpen(true);
  }, [selectedRecord]);

  const openRecording = useCallback((record) => {
    const hydrated = normalizeLiveClass(record || selectedRecord || {});
    setSelectedId(hydrated.id);
    setSelectedRecord(hydrated);
    setRecordingForm({
      source: hydrated.platform?.toLowerCase().includes('zoom') ? 'zoom' : hydrated.platform?.toLowerCase().includes('drive') ? 'drive' : hydrated.platform?.toLowerCase().includes('vimeo') ? 'vimeo' : 'youtube',
      url: hydrated.recordingUrl || '',
      title: hydrated.title || '',
      notes: hydrated.description || '',
    });
    setRecordingOpen(true);
  }, [selectedRecord]);

  // extraClientErrors: page-level checks (e.g. the syllabus module) reported
  // together with this form's own validation.
  const submitForm = useCallback(async (extraClientErrors = {}) => {
    setFormSaving(true);
    setFormError('');
    setFormFieldErrors({});
    try {
      const clientErrors = {};
      const trimmedTitle = String(formValues.title || '').trim();
      const trimmedMeetingUrl = String(formValues.meetingUrl || '').trim();
      const meetingPlatformLabel = getMeetingPlatformLabel(formValues.meetingPlatformId);

      if (!trimmedTitle) clientErrors.classTitle = ['Class title is required.'];
      if (!formValues.courseId) clientErrors.courseId = ['Course is required.'];
      if (!formValues.batchId) clientErrors.batchId = ['Batch is required.'];
      // The backend rejects a new class without a module (moduleId ≥ 1).
      if (formMode !== 'edit' && !toModuleId(formValues.moduleId)) clientErrors.moduleId = ['Module is required.'];
      if (!formValues.mentorId) clientErrors.mentorId = ['The batch must have an assigned mentor.'];
      if (!meetingPlatformLabel) clientErrors.meetingPlatform = ['Meeting platform is required.'];
      if (!trimmedMeetingUrl) clientErrors.meetingLink = ['Meeting link is required.'];
      else if (!isValidHttpUrl(trimmedMeetingUrl)) clientErrors.meetingLink = ['Meeting link must be a valid URL.'];
      if (!formValues.date) clientErrors.date = ['Class date is required.'];
      else if (!isValidScheduleDate(formValues.date)) {
        clientErrors.date = [`Enter a valid date between ${SCHEDULE_DATE_MIN} and ${SCHEDULE_DATE_MAX}.`];
      }
      if (!formValues.startTime) clientErrors.startTime = ['Start time is required.'];
      if (!formValues.endTime) clientErrors.endTime = ['End time is required.'];
      if (formValues.startTime && formValues.endTime && formValues.endTime <= formValues.startTime) {
        clientErrors.endTime = ['End time must be after start time.'];
      }
      Object.assign(clientErrors, extraClientErrors);

      if (Object.keys(clientErrors).length) {
        setFormError('Please fix the highlighted validation errors and try again.');
        setFormFieldErrors(clientErrors);
        return;
      }

      const apiDate = formatDateForApi(formValues.date);
      const apiStartTime = formatTimeForApi(formValues.startTime);
      const apiEndTime = formatTimeForApi(formValues.endTime);
      const payload = {
        classTitle: trimmedTitle,
        title: trimmedTitle,
        description: formValues.description,
        courseId: formValues.courseId ? Number(formValues.courseId) : undefined,
        batchId: formValues.batchId ? Number(formValues.batchId) : undefined,
        moduleId: toModuleId(formValues.moduleId),
        mentorId: formValues.mentorId ? Number(formValues.mentorId) : undefined,
        meetingPlatform: meetingPlatformLabel,
        meetingPlatformId: formValues.meetingPlatformId ? Number(formValues.meetingPlatformId) : undefined,
        meetingLink: trimmedMeetingUrl,
        meetingUrl: trimmedMeetingUrl,
        meetingId: formValues.meetingId,
        password: formValues.password,
        date: apiDate,
        classDate: apiDate,
        scheduledDate: apiDate,
        startTime: apiStartTime,
        endTime: apiEndTime,
        startDateTime: `${apiDate}T${apiStartTime}`,
        endDateTime: `${apiDate}T${apiEndTime}`,
        status: formValues.status,
      };

      if (import.meta.env.DEV) {
        console.log('Live Class Payload');
        console.log(JSON.stringify(payload, null, 2));
      }

      if (formMode === 'edit' && editingRecordId) {
        await liveClassService.update(editingRecordId, payload);
      } else {
        const created = await liveClassService.create(payload);
        const createdClass = {
          id: created?.id ?? created?.liveClassId ?? `scheduled-${Date.now()}`,
          dateKey: apiDate,
          time: `${apiStartTime}-${apiEndTime}`,
          batch: dropdowns.batches.find((item) => String(item.id) === String(formValues.batchId))?.name ?? 'Assigned batch',
          topic: formValues.title || formValues.classTitle || 'Scheduled class',
          students: 0,
          status: formValues.status || 'scheduled',
          attendance: 'Pending',
          color: 'blue',
          meetingLink: trimmedMeetingUrl,
        };
        saveScheduledClass(createdClass);
        saveScheduledClassNotification(createdClass);
      }
      await refreshTab(activeTab);
      await loadDashboard();
      setFormOpen(false);
    } catch (error) {
      const editing = formMode === 'edit' && editingRecordId;
      logLiveClassSaveError(error, editing ? 'PUT /api/v1/live-classes/{id}' : 'POST /api/v1/live-classes');
      setFormError(liveClassSaveErrorMessage(error, { mode: editing ? 'update' : 'create' }));
      // Only a 400/422 validation response marks fields.
      setFormFieldErrors(liveClassFieldErrors(error));
    } finally {
      setFormSaving(false);
    }
  }, [activeTab, dropdowns.batches, editingRecordId, formMode, formValues, loadDashboard, refreshTab]);

  const submitDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await liveClassService.remove(deleteTarget.id);
      setDeleteTarget(null);
      if (selectedId === deleteTarget.id) closeDetails();
      await refreshTab(activeTab);
      await loadDashboard();
    } finally {
      setActionLoading(false);
    }
  }, [activeTab, closeDetails, deleteTarget, loadDashboard, refreshTab, selectedId]);

  const submitBulkDelete = useCallback(async (ids = []) => {
    if (!ids.length) return;
    setActionLoading(true);
    try {
      await Promise.allSettled(ids.map((id) => liveClassService.remove(id)));
      if (ids.includes(selectedId)) closeDetails();
      await refreshTab(activeTab);
      await loadDashboard();
    } finally {
      setActionLoading(false);
    }
  }, [activeTab, closeDetails, loadDashboard, refreshTab, selectedId]);

  const submitCancel = useCallback(async () => {
    if (!cancelTarget) return;
    setActionLoading(true);
    try {
      await liveClassService.cancel(cancelTarget.id, { reason: cancelReason });
      setCancelTarget(null);
      setCancelReason('');
      await refreshTab(activeTab);
      await loadDashboard();
    } finally {
      setActionLoading(false);
    }
  }, [activeTab, cancelReason, cancelTarget, loadDashboard, refreshTab]);

  const submitStart = useCallback(async (record) => {
    const status = String(record?.backendStatus ?? record?.status ?? '').toLowerCase();
    if (!record?.id || ['completed', 'cancelled', 'canceled', 'ended'].includes(status)) return;
    if (pendingRecordAction) return; // one action in flight per record at a time
    setPendingRecordAction({ id: record.id, type: 'start' });
    try {
      await liveClassService.start(record.id);
      await refreshTab(activeTab);
      await loadDashboard();
      if (selectedId === record.id) await loadRecordDetails(record.id);
    } finally {
      setPendingRecordAction(null);
    }
  }, [activeTab, loadDashboard, loadRecordDetails, pendingRecordAction, refreshTab, selectedId]);

  const submitEnd = useCallback(async (record) => {
    if (pendingRecordAction) return;
    setPendingRecordAction({ id: record.id, type: 'end' });
    try {
      await liveClassService.end(record.id);
      await refreshTab(activeTab);
      await loadDashboard();
      if (selectedId === record.id) await loadRecordDetails(record.id);
    } finally {
      setPendingRecordAction(null);
    }
  }, [activeTab, loadDashboard, loadRecordDetails, pendingRecordAction, refreshTab, selectedId]);

  // This hook backs the organization/admin Live Classes oversight screen —
  // the signed-in user here is the organizer, not a class participant. The
  // backend's POST /join is documented (liveClassApi.js) as creating an
  // attendance/session record for a participant; every OTHER caller of
  // liveClassService.join() in this codebase (StudentDashboard, MyClasses,
  // StudentCalendar, SchedulePage, EmployeeLiveClasses) is a genuine
  // participant screen. Calling it from the admin's "Join Meeting" button
  // was the actual cause of its 403 — the backend is correctly rejecting an
  // organizer as an invalid participant for that action. The admin only
  // needs to open the meeting link, never to register attendance.
  const submitJoin = useCallback(async (record) => {
    const joinUrl = record?.meetingUrl;
    if (!joinUrl) throw new Error('This class does not have a meeting link yet.');
    window.open(joinUrl, '_blank', 'noopener,noreferrer');
    return joinUrl;
  }, []);

  const submitAttendance = useCallback(async () => {
    if (!selectedRecord?.id) return;
    setAttendanceSaving(true);
    try {
      const updates = Object.entries(attendanceEdits);
      // PUT /api/Attendance — the dedicated Attendance controller, replacing
      // the older per-student /api/v1/live-classes/{id}/attendance/{studentId}
      // route. Payload shape mirrors the studentId/liveClassId/status/date
      // convention this same backend uses for its other attendance writes
      // (see attendanceService.createBulk callers) since this endpoint has no
      // path params of its own to identify the class/student.
      await Promise.all(updates.map(([studentId, status]) => attendanceService.updateLiveClassAttendance({
        studentId,
        liveClassId: selectedRecord.id,
        status,
        date: selectedRecord.startDate || undefined,
      })));
      setAttendanceOpen(false);
      await loadRecordDetails(selectedRecord.id);
      await refreshTab(activeTab);
      await loadDashboard();
    } finally {
      setAttendanceSaving(false);
    }
  }, [activeTab, attendanceEdits, loadDashboard, loadRecordDetails, refreshTab, selectedRecord]);

  // POST /api/Attendance/liveclass/{id}/generate — auto-fills attendance from
  // the meeting platform's own join/leave logs, for a class nobody has
  // manually marked yet.
  const generateAttendance = useCallback(async () => {
    if (!selectedRecord?.id) return;
    setAttendanceGenerating(true);
    try {
      await attendanceService.generateForLiveClass(selectedRecord.id);
      await loadRecordDetails(selectedRecord.id);
    } finally {
      setAttendanceGenerating(false);
    }
  }, [loadRecordDetails, selectedRecord]);

  // GET /api/Attendance/report/{pdf|excel}/{liveClassId} — both return a raw
  // file blob. Prefer the backend's own Content-Disposition filename when it
  // sends one; a client-synthesized name is only the fallback.
  const downloadAttendanceReport = useCallback(async (format) => {
    if (!selectedRecord?.id) return;
    setAttendanceExporting(format);
    try {
      const response = format === 'excel'
        ? await attendanceService.liveClassReportExcel(selectedRecord.id)
        : await attendanceService.liveClassReportPdf(selectedRecord.id);
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      const safeTitle = String(selectedRecord.title || 'live-class').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const filename = filenameFromDisposition(response) || `attendance-${safeTitle}-${selectedRecord.id}.${extension}`;
      triggerFileDownload(response.data, filename);
    } finally {
      setAttendanceExporting('');
    }
  }, [selectedRecord]);

  const submitPdf = useCallback(async () => {
    if (!selectedRecord?.id || !pdfForm.file) return;
    setPdfSaving(true);
    try {
      const formData = new FormData();
      formData.append('liveClassId', selectedRecord.id);
      formData.append('title', pdfForm.title || selectedRecord.title || '');
      formData.append('file', pdfForm.file);
      await liveClassService.uploadPdf(formData);
      setPdfOpen(false);
      await loadRecordDetails(selectedRecord.id);
    } finally {
      setPdfSaving(false);
    }
  }, [loadRecordDetails, pdfForm.file, pdfForm.title, selectedRecord]);

  const submitRecording = useCallback(async () => {
    if (!selectedRecord?.id) return;
    setRecordingSaving(true);
    try {
      await liveClassService.updateRecording(selectedRecord.id, {
        source: recordingForm.source,
        recordingUrl: recordingForm.url,
        title: recordingForm.title,
        notes: recordingForm.notes,
      });
      setRecordingOpen(false);
      await loadRecordDetails(selectedRecord.id);
      await refreshTab(activeTab);
      await loadDashboard();
    } finally {
      setRecordingSaving(false);
    }
  }, [activeTab, loadDashboard, loadRecordDetails, recordingForm.notes, recordingForm.source, recordingForm.title, recordingForm.url, refreshTab, selectedRecord]);

  const removePdf = useCallback(async () => {
    if (!selectedRecord?.id) return;
    setSelectedMediaLoading(true);
    try {
      await liveClassService.deletePdf(selectedRecord.id);
      await loadRecordDetails(selectedRecord.id);
    } finally {
      setSelectedMediaLoading(false);
    }
  }, [loadRecordDetails, selectedRecord]);

  const removeRecording = useCallback(async () => {
    if (!selectedRecord?.id) return;
    setSelectedMediaLoading(true);
    try {
      await liveClassService.deleteRecording(selectedRecord.id);
      await loadRecordDetails(selectedRecord.id);
    } finally {
      setSelectedMediaLoading(false);
    }
  }, [loadRecordDetails, selectedRecord]);

  const dashboardMetrics = dashboard;
  const totalVisible = pagedRecords.length;

  return {
    activeState,
    activeTab,
    attendanceEdits,
    attendanceExporting,
    attendanceGenerating,
    attendanceOpen,
    attendanceSaving,
    dashboard: dashboardMetrics,
    dashboardError,
    dashboardErrorStatus,
    dashboardLoading,
    deleteTarget,
    dropdownError,
    dropdownLoading,
    dropdowns,
    formMode,
    formOpen,
    formError,
    formFieldErrors,
    formSaving,
    formValues,
    loading: activeState.loading,
    pageSize,
    pagedRecords,
    pdfForm,
    pdfOpen,
    pdfSaving,
    recordingForm,
    recordingOpen,
    recordingSaving,
    search,
    selectedAttendance,
    selectedAttendanceDashboard,
    selectedAttendanceLoading,
    selectedId,
    selectedMediaLoading,
    selectedPdf,
    selectedRecord,
    selectedRecording,
    setActiveTab,
    setAttendanceEdits,
    setCancelReason,
    setDeleteTarget,
    setFormValues,
    setPageSize,
    setPdfForm,
    setRecordingForm,
    setSearch,
    setSelectedId,
    setSelectedRecord,
    tabs,
    totalVisible,
    actionLoading,
    pendingRecordAction,
    closeDetails,
    closeForm,
    dropdownsReady: !dropdownLoading && !dropdownError,
    filteredRecords: pagedRecords,
    loadTab,
    reloadDashboard: loadDashboard,
    downloadAttendanceReport,
    generateAttendance,
    openAttendance,
    openDetails,
    openForm,
    openDuplicate,
    openPdf,
    openRecording,
    removePdf,
    removeRecording,
    refreshTab,
    submitAttendance,
    submitCancel,
    submitDelete,
    submitBulkDelete,
    submitEnd,
    submitStart,
    submitForm,
    submitJoin,
    submitPdf,
    submitRecording,
    cancelTarget,
    cancelReason,
    setCancelTarget,
    setAttendanceOpen,
    setPdfOpen,
    setRecordingOpen,
  };
}

