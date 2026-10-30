export const extractApiData = (response) => response?.data ?? response;

export const logApiRequest = (method, endpoint, payload) => {
  if (!import.meta.env.DEV) return;
  console.group("API REQUEST");
  console.log(method);
  console.log(endpoint);
  console.log(payload);
  console.groupEnd();
};

export const logApiSuccess = (response) => {
  if (!import.meta.env.DEV) return;
  console.group("API SUCCESS");
  console.log(response?.data ?? response);
  console.groupEnd();
};

export const logApiError = (error) => {
  if (!import.meta.env.DEV) return;
  console.group("API ERROR");
  console.log(error?.response?.status);
  console.log(error?.response?.data);
  console.groupEnd();
};

export const withPagedResponse = (response) => {
  const isPagedObject = (value) => value
    && typeof value === 'object'
    && !Array.isArray(value)
    && (
      'totalRecords' in value
      || 'TotalRecords' in value
      || 'totalCount' in value
      || 'TotalCount' in value
      || 'pageNumber' in value
      || 'PageNumber' in value
      || 'pageSize' in value
      || 'PageSize' in value
      || 'totalPages' in value
      || 'TotalPages' in value
    );
  // Services call this after Axios has already been unwrapped. Preserve a
  // top-level paged body such as { totalCount, data: [] } before inspecting a
  // possible envelope such as { success, data: { totalCount, data: [] } }.
  const pagePayload = isPagedObject(response)
    ? response
    : isPagedObject(response?.data)
      ? response.data
      : extractApiData(response);
  const rows = Array.isArray(pagePayload?.data)
    ? pagePayload.data
    : Array.isArray(pagePayload?.items)
      ? pagePayload.items
      : Array.isArray(pagePayload?.batches)
        ? pagePayload.batches
        : Array.isArray(pagePayload?.courses)
          ? pagePayload.courses
          : Array.isArray(pagePayload)
            ? pagePayload
            : [];
  const pageNumber = Number(
    pagePayload?.pageNumber
    ?? pagePayload?.PageNumber
    ?? pagePayload?.page
    ?? pagePayload?.Page
    ?? 1
  );
  const pageSize = Number(
    pagePayload?.pageSize
    ?? pagePayload?.PageSize
    ?? 10
  );
  const totalRecords = Number(
    pagePayload?.totalRecords
    ?? pagePayload?.TotalRecords
    ?? pagePayload?.totalCount
    ?? pagePayload?.TotalCount
    ?? rows.length
    ?? 0
  );
  const totalPages = Number(
    pagePayload?.totalPages
    ?? pagePayload?.TotalPages
    ?? Math.max(1, Math.ceil(totalRecords / (pageSize || 1)))
  );

  return {
    data: rows,
    totalRecords,
    pageNumber,
    pageSize,
    totalPages,
  };
};

export const withListResponse = (response) => {
  const payload = extractApiData(response);
  return Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
};
