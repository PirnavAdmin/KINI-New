import { dashboardApi, reportsApi } from "./apiServices";

export const getEmployeeDashboard = async () => {
  const [dashboard, stats] = await Promise.all([
    dashboardApi.employeeDashboard(),
    dashboardApi.employeeStats(),
  ]);
  return { data: { ...dashboard, stats } };
};

export const getEmployeeSkills = async () => dashboardApi.employeeDashboard();

export const getEmployeeGoals = async () => dashboardApi.employeeDashboard();

export const getOrgDashboard = async () => {
  const [dashboard, stats] = await Promise.all([
    dashboardApi.organizationDashboard(),
    dashboardApi.organizationStats(),
  ]);
  return { data: { ...dashboard, stats } };
};

export const getOrgReports = async () => {
  const [hrAnalytics, skillsAnalytics, performanceAnalytics, workforceAnalytics] = await Promise.all([
    reportsApi.hrAnalytics(),
    reportsApi.skillsAnalytics(),
    reportsApi.performanceAnalytics(),
    reportsApi.workforceAnalytics(),
  ]);
  return { data: { hrAnalytics, skillsAnalytics, performanceAnalytics, workforceAnalytics } };
};

export const getSuperAdminDashboard = async () => {
  const [dashboard, stats] = await Promise.all([
    dashboardApi.superAdminDashboard(),
    dashboardApi.superAdminStats(),
  ]);
  return { data: { ...dashboard, stats } };
};

export const getSuperAdminAnalytics = async () => getSuperAdminDashboard();

export default {
  getEmployeeDashboard,
  getEmployeeSkills,
  getEmployeeGoals,
  getOrgDashboard,
  getOrgReports,
  getSuperAdminDashboard,
  getSuperAdminAnalytics,
};
