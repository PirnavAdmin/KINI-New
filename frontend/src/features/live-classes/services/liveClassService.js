import { liveClassApi } from '../api/liveClassApi';

export const liveClassService = {
  list: (params) => liveClassApi.list(params),
  dashboard: (params) => liveClassApi.dashboard(params),
  today: (params) => liveClassApi.today(params),
  upcoming: (params) => liveClassApi.upcoming(params),
  live: (params) => liveClassApi.live(params),
  completed: (params) => liveClassApi.completed(params),
  getById: (id, options) => liveClassApi.getById(id, options),
  create: (payload) => liveClassApi.create(payload),
  update: (id, payload) => liveClassApi.update(id, payload),
  remove: (id) => liveClassApi.remove(id),
  start: (id) => liveClassApi.start(id),
  end: (id) => liveClassApi.end(id),
  cancel: (id, payload) => liveClassApi.cancel(id, payload),
  join: (id) => liveClassApi.join(id),
  attendanceList: (id) => liveClassApi.attendanceList(id),
  attendanceUpdate: (liveClassId, studentId, payload) => liveClassApi.attendanceUpdate(liveClassId, studentId, payload),
  attendanceCreate: (liveClassId, payload) => liveClassApi.attendanceCreate(liveClassId, payload),
  uploadPdf: (payload) => liveClassApi.uploadPdf(payload),
  getPdf: (id) => liveClassApi.getPdf(id),
  deletePdf: (id) => liveClassApi.deletePdf(id),
  getRecording: (id) => liveClassApi.getRecording(id),
  updateRecording: (id, payload) => liveClassApi.updateRecording(id, payload),
  deleteRecording: (id) => liveClassApi.deleteRecording(id),
  dropdowns: () => liveClassApi.dropdowns(),
};

export default liveClassService;
