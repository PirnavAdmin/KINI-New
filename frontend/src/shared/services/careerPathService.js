import { readStoredOrganizationId } from "./apiServices";

const STORAGE_PREFIX = "pirnav:career-paths";

const getStorageKey = () => {
  const organizationId = readStoredOrganizationId();
  return `${STORAGE_PREFIX}:${organizationId ?? "current-organization"}`;
};

const readCareerPaths = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(getStorageKey()) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    if (import.meta.env.DEV) console.error("Unable to read saved career paths:", error);
    return [];
  }
};

const writeCareerPaths = (careerPaths) => {
  localStorage.setItem(getStorageKey(), JSON.stringify(careerPaths));
};

const getEntityId = (item) =>
  item?.id ?? item?._id ?? item?.careerPathId ?? item?.career_path_id;

const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `career-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const careerPathService = {
  list: async () => readCareerPaths(),

  create: async (payload) => {
    const careerPathId = createId();
    const created = {
      ...payload,
      id: careerPathId,
      careerPathId,
      employees: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    writeCareerPaths([...readCareerPaths(), created]);
    return created;
  },

  update: async (id, payload) => {
    const current = readCareerPaths();
    const index = current.findIndex((item) => String(getEntityId(item)) === String(id));
    if (index === -1) throw new Error("Career track was not found");

    const updated = {
      ...current[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    writeCareerPaths(current.map((item, itemIndex) => itemIndex === index ? updated : item));
    return updated;
  },

  remove: async (id) => {
    const current = readCareerPaths();
    const filtered = current.filter((item) => String(getEntityId(item)) !== String(id));
    if (filtered.length === current.length) throw new Error("Career track was not found");
    writeCareerPaths(filtered);
    return { id };
  },
};

export default careerPathService;
