const Course = require("../../roles/admin/course/CourseModel");
const Level = require("../../roles/admin/level/LevelModel");
const Subject = require("../../roles/admin/subject/SubjectModel");
const Chapter = require("../../roles/admin/chapter/ChapterModel");

const isDeleted = (doc) => !doc || doc.status === "deleted";

// True when any node of the chain is not active, used to decide whether a new
// record has to start out inactive.
const chainHasInactive = (chain) =>
  Object.values(chain).some((doc) => doc && doc.status !== "active");

const resolveFromSubject = async (subjectId) => {
  const subject = await Subject.findById(subjectId).lean();
  if (isDeleted(subject)) return { error: "subject_not_found" };

  const level = await Level.findById(subject.level).lean();
  if (isDeleted(level)) return { error: "level_not_found" };

  const course = await Course.findById(level.course).lean();
  if (isDeleted(course)) return { error: "course_not_found" };

  return { chain: { course, level, subject } };
};

const resolveFromChapter = async (chapterId) => {
  const chapter = await Chapter.findById(chapterId).lean();
  if (isDeleted(chapter)) return { error: "chapter_not_found" };

  const resolved = await resolveFromSubject(chapter.subject);
  if (resolved.error) return resolved;

  return { chain: { ...resolved.chain, chapter } };
};

const resolvePdfChain = async ({ subjectId, chapterId }) => {
  if (chapterId) {
    const resolved = await resolveFromChapter(chapterId);
    if (resolved.error) return resolved;

    // A chapter sent together with a subject has to belong to it
    if (
      subjectId &&
      String(resolved.chain.subject._id) !== String(subjectId)
    ) {
      return { error: "chapter_does_not_belong_to_this_subject" };
    }
    return resolved;
  }

  return resolveFromSubject(subjectId);
};

module.exports = {
  resolveFromSubject,
  resolveFromChapter,
  resolvePdfChain,
  chainHasInactive,
};
