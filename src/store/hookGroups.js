import {
  useGetNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} from './Reducer/notes';
import {
  useGetLevelsQuery,
  useUpdateLevelMutation,
  useDeleteLevelMutation,
} from './Reducer/levels';
import {
  useGetCoursesQuery,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} from './Reducer/courses';
import {
  useGetChaptersQuery,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
} from './Reducer/chapters';
import {
  useGetSubjectsQuery,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} from './Reducer/subjects';
import {
  useGetSyllabusListQuery,
  useCreateSyllabusMutation,
  useUpdateSyllabusMutation,
  useDeleteSyllabusMutation,
} from './Reducer/syllabus';
import {
  useGetPastPapersQuery,
  useCreatePastPaperMutation,
  useUpdatePastPaperMutation,
  useDeletePastPaperMutation,
} from './Reducer/past-papers';

// ----------------------------------------------------------------------
// The screens that are generic over a node type or a document kind pick their
// hooks from here, so a view stays one component instead of four near copies.
// ----------------------------------------------------------------------

export const nodeHooks = {
  course: {
    useList: useGetCoursesQuery,
    useUpdate: useUpdateCourseMutation,
    useDelete: useDeleteCourseMutation,
  },
  level: {
    useList: useGetLevelsQuery,
    useUpdate: useUpdateLevelMutation,
    useDelete: useDeleteLevelMutation,
  },
  subject: {
    useList: useGetSubjectsQuery,
    useUpdate: useUpdateSubjectMutation,
    useDelete: useDeleteSubjectMutation,
  },
  chapter: {
    useList: useGetChaptersQuery,
    useUpdate: useUpdateChapterMutation,
    useDelete: useDeleteChapterMutation,
  },
};

export const documentHooks = {
  'past-paper': {
    useList: useGetPastPapersQuery,
    useCreate: useCreatePastPaperMutation,
    useUpdate: useUpdatePastPaperMutation,
    useDelete: useDeletePastPaperMutation,
  },
  syllabus: {
    useList: useGetSyllabusListQuery,
    useCreate: useCreateSyllabusMutation,
    useUpdate: useUpdateSyllabusMutation,
    useDelete: useDeleteSyllabusMutation,
  },
  note: {
    useList: useGetNotesQuery,
    useCreate: useCreateNoteMutation,
    useUpdate: useUpdateNoteMutation,
    useDelete: useDeleteNoteMutation,
  },
};
