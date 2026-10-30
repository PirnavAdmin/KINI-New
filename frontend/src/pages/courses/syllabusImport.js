// Maps the POST .../syllabus/import-pdf result into the shape SyllabusBuilder's
// form rows accept (moduleRow/topicRow/lessonRow read moduleName ?? name, ...).
//
// The structure is taken exactly as the backend returns it. Names are never
// split or re-parsed here: when the parser returns modules without topics, or
// topics without lessons, the result is reported as not applicable instead of
// guessing at a structure the backend did not provide. That also matches the
// Save validation, which requires every module to have a topic and every
// topic a lesson.
const list = (value) => (Array.isArray(value) ? value : []);
const text = (value) => (value == null ? "" : String(value).trim());
const count = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
};

export const mapImportedSyllabus = (data = {}) => {
  const modules = list(data?.modules).map((module) => ({
    moduleName: text(module?.moduleName ?? module?.name),
    description: text(module?.description),
    topics: list(module?.topics).map((topic) => ({
      topicName: text(topic?.topicName ?? topic?.name),
      description: text(topic?.description),
      lessons: list(topic?.lessons).map((lesson) => ({
        lessonName: text(lesson?.lessonName ?? lesson?.name),
        description: text(lesson?.description),
      })),
    })),
  }));

  const topics = modules.flatMap((module) => module.topics);
  const lessons = topics.flatMap((topic) => topic.lessons);
  const summary = {
    moduleCount: count(data?.summary?.moduleCount, modules.length),
    topicCount: count(data?.summary?.topicCount, topics.length),
    lessonCount: count(data?.summary?.lessonCount, lessons.length),
  };

  const complete = modules.length > 0
    && modules.every((module) => module.moduleName && module.topics.length > 0)
    && topics.every((topic) => topic.topicName && topic.lessons.length > 0)
    && lessons.every((lesson) => lesson.lessonName);

  return {
    fileName: text(data?.fileName),
    description: text(data?.description),
    summary,
    modules,
    canApply: complete,
    // Why a result cannot be applied: no modules at all, or modules whose
    // topics/lessons were not extracted (e.g. everything concatenated into
    // the module name by the parser).
    problem: complete ? null : modules.length === 0 ? "no-modules" : "no-structure",
  };
};

// Builds the body for the existing save API, POST .../syllabus
// (Swagger CreateCourseSyllabusDto) — the same contract SyllabusBuilder's
// Save Syllabus sends. Numbers follow the PDF order.
export const toSyllabusSavePayload = (imported, fallbackDescription = "") => ({
  description: imported.description || text(fallbackDescription),
  modules: imported.modules.map((module, mi) => ({
    moduleNumber: mi + 1,
    moduleName: module.moduleName,
    description: module.description,
    topics: module.topics.map((topic, ti) => ({
      topicNumber: ti + 1,
      topicName: topic.topicName,
      description: topic.description,
      lessons: topic.lessons.map((lesson, li) => ({
        lessonNumber: li + 1,
        lessonName: lesson.lessonName,
        description: lesson.description,
      })),
    })),
  })),
});
