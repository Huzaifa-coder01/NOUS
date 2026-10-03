export const hasParams = (url) => {
  const queryString = url?.split('?')[1];
  return queryString ? new URLSearchParams(queryString).toString().length > 0 : false;
};

export function removeLastSlash(pathname) {
  if (pathname !== '/' && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

export function removeParams(url) {
  try {
    const urlObj = new URL(url, window.location.origin);

    return removeLastSlash(urlObj.pathname);
  } catch (error) {
    return url;
  }
}

export function isExternalLink(url) {
  return url?.startsWith('http');
}
