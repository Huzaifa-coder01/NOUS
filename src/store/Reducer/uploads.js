import { createApi } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { API_ROUTES } from '../apiRoutes';
import { unwrap, createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// File uploads.
//
// `POST /upload/cloudinary` takes a multipart field named `files` (up to 10)
// and answers with the key the file was stored under - spelled `fileName`, and
// `file` in older builds - plus `fileExtension`, `publicId` and `resourceType`.
// That key is what a record keeps.
//
// No delivery url comes back with it and the API cannot serve the key itself,
// so `mediaUrl` below joins it to VITE_MEDIA_BASE_URL to get something the
// browser can load.
//
// `/upload/aws` is the same handler under an older name, `/upload/azure` needs
// the AZURE_STORAGE_* vars, and `/upload` writes to the server's disk with a
// field named `file`. VITE_UPLOAD_DRIVER picks one.
// ----------------------------------------------------------------------

export const MAX_FILE_SIZE = 15 * 1024 * 1024;

export const ACCEPTED_MIME = 'application/pdf';

/** Avatars are the one image upload, and are held to a tighter limit. */
export const AVATAR_MAX_SIZE = 3 * 1024 * 1024;

export const AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export const AVATAR_ACCEPT = '.jpeg,.jpg,.png,.gif';

const DRIVERS = {
  cloudinary: { url: API_ROUTES.UPLOADS.CLOUDINARY, field: 'files' },
  aws: { url: API_ROUTES.UPLOADS.AWS, field: 'files' },
  azure: { url: API_ROUTES.UPLOADS.AZURE, field: 'files' },
  local: { url: API_ROUTES.UPLOADS.LOCAL, field: 'file' },
};

const driver = () => DRIVERS[CONFIG.api.uploadDriver] ?? DRIVERS.cloudinary;

/**
 * The response is sometimes one object, sometimes a one-item list, and the key
 * has been spelled both `file` and `fileName`. The delivery url is not always
 * sent back, so it is worked out from the key when it is missing.
 */
function firstFile(response) {
  const data = unwrap(response);

  const record = Array.isArray(data) ? data[0] : data?.files?.[0] ?? data;

  const key = record?.file ?? record?.fileName ?? record?.key ?? null;

  return {
    file: key,
    fileUrl: record?.fileUrl ?? record?.url ?? record?.secure_url ?? mediaUrl(key),
    fileExtension: record?.fileExtension ?? null,
    publicId: record?.publicId ?? null,
    resourceType: record?.resourceType ?? null,
  };
}

export const uploadsApi = createApi({
  reducerPath: 'uploads',
  baseQuery: createCustomFetchBaseQuery(),
  endpoints: (builder) => ({
    /**
     * One file in, `{ file, fileUrl }` out. FormData is passed through
     * untouched so the browser sets the multipart boundary itself.
     */
    uploadFile: builder.mutation({
      query: (file) => {
        const { url, field } = driver();

        const body = new FormData();

        body.append(field, file, file.name);

        return { url, method: 'POST', body };
      },
      transformResponse: firstFile,
    }),

    /** Accepts the relative key, the bare public id, or the full url. */
    deleteFile: builder.mutation({
      query: (fileKey) => ({ url: driver().url, method: 'DELETE', body: { fileKey } }),
    }),
  }),
});

export const { useUploadFileMutation, useDeleteFileMutation } = uploadsApi;

// ----------------------------------------------------------------------
// Client-side helpers - no HTTP, just what the UI does with a stored file
// ----------------------------------------------------------------------

/**
 * Throws with a message worth showing when the picked file is not an avatar we
 * accept. Extensions are checked alongside the MIME type because some browsers
 * report an empty `type` for a file dragged in from certain sources.
 */
export function assertAvatar(file) {
  if (!file) throw new Error('Choose an image to upload');

  const extension = (file.name?.split('.').pop() ?? '').toLowerCase();

  const looksRight =
    AVATAR_MIME_TYPES.includes(file.type) ||
    (!file.type && ['jpeg', 'jpg', 'png', 'gif'].includes(extension));

  if (!looksRight) {
    throw new Error('Use a JPEG, PNG or GIF image');
  }

  if (file.size > AVATAR_MAX_SIZE) {
    throw new Error(
      `This image is ${formatFileSize(file.size)} - the limit is ${Math.round(
        AVATAR_MAX_SIZE / (1024 * 1024)
      )}MB`
    );
  }
}

export function assertPdf(file) {
  if (!file) throw new Error('Choose a PDF to upload');

  if (file.type && file.type !== ACCEPTED_MIME) throw new Error('Only PDF files are accepted');

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`This PDF is larger than ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`);
  }
}

/**
 * Turns whatever a record stored into something the browser can load.
 *
 * The API hands back a relative key and cannot serve it (its `/upload/:name`
 * route does not match a key with slashes in it), so the delivery prefix comes
 * from VITE_MEDIA_BASE_URL. Without one set there is nothing to point at, and
 * saying so is better than emitting a url that 404s.
 */
export function mediaUrl(value) {
  if (!value) return null;

  const key = String(value).trim();

  if (!key) return null;

  if (/^(https?:|data:|blob:)/i.test(key)) return key;

  const base = CONFIG.api.mediaBaseUrl;

  if (base) return `${base}/${key.replace(/^\/+/, '')}`;

  // the `local` driver writes to the server's own disk, where the key is a
  // bare file name the API can serve
  if (!key.includes('/')) {
    return `${CONFIG.api.baseUrl}/${API_ROUTES.UPLOADS.FILE_BY_NAME(key)}`;
  }

  return null;
}

/** Records carry an absolute `fileUrl`, or the key the file was stored under. */
export function fileUrlOf(doc) {
  return mediaUrl(doc?.fileUrl ?? fileKeyOf(doc));
}

/**
 * Where a record keeps its stored file. Creating one sends `file`, but the API
 * reads back the same value as `fileName`, so both spellings are checked.
 */
export function fileKeyOf(doc) {
  return doc?.file ?? doc?.fileName ?? null;
}

/**
 * The file name to show for a stored document.
 *
 * A record keeps a human `name` and a storage key built from a uuid, so the
 * name plus the stored extension reads as the file the person actually
 * uploaded. The key and the delivery url are addresses, not names, and neither
 * belongs on screen - the last segment of the key stands in only when a record
 * has no name at all.
 */
export function fileNameOf(doc) {
  if (!doc) return null;

  const key = fileKeyOf(doc);

  const extension = /\.([a-z0-9]+)(?:[?#]|$)/i.exec(
    String(doc.fileExtension ?? key ?? doc.fileUrl ?? '')
  );

  const suffix = extension ? `.${extension[1].toLowerCase()}` : '';

  const base = String(doc.name ?? '').trim();

  if (base) return base.toLowerCase().endsWith(suffix) ? base : `${base}${suffix}`;

  return (
    String(key ?? doc.fileUrl ?? '')
      .split(/[?#]/)[0]
      .split('/')
      .pop() || null
  );
}

export function openFile(doc) {
  const url = fileUrlOf(doc);

  if (!url) throw new Error('This PDF has no file attached');

  window.open(url, '_blank', 'noopener,noreferrer');
}

export function downloadFile(doc) {
  const url = fileUrlOf(doc);

  if (!url) throw new Error('This PDF has no file attached');

  const link = document.createElement('a');

  link.href = url;
  link.rel = 'noopener';
  link.target = '_blank';
  link.download = doc.name ? `${doc.name}.pdf` : '';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function formatFileSize(bytes) {
  if (!bytes) return null;

  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
