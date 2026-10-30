import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { skillsApi } from "@shared/services/apiServices";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const mapSkill = (skill = {}) => {
  const apiId = skill.skillId;

  return {
    apiId,
    id: apiId || "-",
    skillId: apiId,
    name: skill.name || "-",
    category: skill.category || "-",
    type: skill.type || "-",
    description: "-",
    employees: 0,
    status: "active",
    created: formatDate(),
    raw: skill,
  };
};

const fetchSkillList = async () => {
  const skills = await skillsApi.list();
  return skills.map(mapSkill);
};

export const fetchSkills = createAsyncThunk("skills/fetchAll", fetchSkillList);

export const addSkill = createAsyncThunk("skills/add", async (skill) => {
  await skillsApi.create(skill);
  return fetchSkillList();
});

export const updateSkill = createAsyncThunk("skills/update", async ({ id, data }) => {
  await skillsApi.update(id, data);
  return fetchSkillList();
});

export const deleteSkill = createAsyncThunk("skills/delete", async (id) => {
  await skillsApi.remove(id);
  const skills = await fetchSkillList();
  return { id, skills };
});

const initialState = {
  skills: [],
  employeeSkills: [],
  categories: [],
  skillTypes: [],
  loading: false,
  error: null,
  filters: { search: "", category: "", status: "", verification: "" },
  selectedIds: [],
};

const skillSlice = createSlice({
  name: "skills",
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
    toggleSelect(state, action) {
      const id = action.payload;
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((i) => i !== id);
      } else {
        state.selectedIds.push(id);
      }
    },
    toggleSelectAll(state, action) {
      state.selectedIds = action.payload ? state.skills.map((s) => s.id) : [];
    },
    clearSelection(state) {
      state.selectedIds = [];
    },
  },
  extraReducers: (builder) => {
    const startRequest = (state) => {
      state.loading = true;
      state.error = null;
    };
    const failRequest = (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Unable to complete the request.";
    };
    const applySkills = (state, skills) => {
      state.loading = false;
      state.skills = skills;
      state.categories = [...new Set(skills.map((skill) => skill.category).filter((value) => value && value !== "-"))];
      state.skillTypes = [...new Set(skills.map((skill) => skill.type).filter((value) => value && value !== "-"))];
    };

    builder
      .addCase(fetchSkills.pending, startRequest)
      .addCase(fetchSkills.fulfilled, (state, action) => {
        applySkills(state, action.payload);
      })
      .addCase(fetchSkills.rejected, failRequest)
      .addCase(addSkill.pending, startRequest)
      .addCase(addSkill.fulfilled, (state, action) => {
        applySkills(state, action.payload);
      })
      .addCase(addSkill.rejected, failRequest)
      .addCase(updateSkill.pending, startRequest)
      .addCase(updateSkill.fulfilled, (state, action) => {
        applySkills(state, action.payload);
      })
      .addCase(updateSkill.rejected, failRequest)
      .addCase(deleteSkill.pending, startRequest)
      .addCase(deleteSkill.fulfilled, (state, action) => {
        applySkills(state, action.payload.skills);
        state.selectedIds = state.selectedIds.filter((id) => id !== action.payload.id);
      })
      .addCase(deleteSkill.rejected, failRequest);
  },
});

export const { setFilters, resetFilters, toggleSelect, toggleSelectAll, clearSelection } = skillSlice.actions;
export default skillSlice.reducer;
