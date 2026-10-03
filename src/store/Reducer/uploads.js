import { createApi } from '@reduxjs/toolkit/query/react';

import { CONFIG } from 'src/config-global';

import { API_ROUTES } from '../apiRoutes';
import { unwrap, createCustomFetchBaseQuery } from '../baseQuery';

export const MAX_FILE_SIZE = 15 * 1024 * 1024;

export const ACCEPTED_MIME = 'application/pdf';

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
    uploadFile: builder.mutation({
      query: (file) => {
        const { url, field } = driver();

        const body = new FormData();

        body.append(field, file, file.name);

        return { url, method: 'POST', body };
      },
      transformResponse: firstFile,
    }),

    deleteFile: builder.mutation({
      query: (fileKey) => ({ url: driver().url, method: 'DELETE', body: { fileKey } }),
    }),
  }),
});

export const { useUploadFileMutation, useDeleteFileMutation } = uploadsApi;

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

export function fileUrlOf(doc) {
  return mediaUrl(doc?.fileUrl ?? fileKeyOf(doc));
}

export function fileKeyOf(doc) {
  return doc?.file ?? doc?.fileName ?? null;
}

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
