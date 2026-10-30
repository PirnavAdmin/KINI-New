const monthlyValues = [145000, 162000, 178000, 194000, 221000, 244000, 258000, 284500, 301000, 326000, 348000, 372000];
export const MONTHLY_REVENUE = monthlyValues.map((revenue, index) => ({ month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][index], revenue }));
export const REVENUE_DAILY = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((period, index) => ({ period, revenue: 8200 + index * 1250 }));
export const REVENUE_WEEKLY = [1,2,3,4].map((week) => ({ period: `Week ${week}`, revenue: 42000 + week * 8500 }));
export const REVENUE_YEARLY = [2022,2023,2024,2025,2026].map((period, index) => ({ period: String(period), revenue: 1450000 + index * 620000 }));
export const REVENUE_SUMMARY = { totalRevenue: 3414000 };
const buildKpis = (periodLabel, totalRevenue) => ({ periodLabel, totalRevenue, subscriptionRevenue: Math.round(totalRevenue * .76), paidAmount: Math.round(totalRevenue * .68), pendingAmount: Math.round(totalRevenue * .12), outstandingAmount: Math.round(totalRevenue * .08), expectedRevenue: Math.round(totalRevenue * 1.18), comparison: { label: 'Previous period', value: Math.round(totalRevenue * .88), delta: 12 } });
export const REVENUE_PERIOD_KPIS = { daily: buildKpis('Today', 18450), weekly: buildKpis('This Week', 128500), monthly: buildKpis('This Month', 284500), yearly: buildKpis('This Year', 3414000) };
