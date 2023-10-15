type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  url: string;
}

export function createPagination ({
  page,
  pageSize,
  total,
  url,
}: Pagination) {
  const pagination = {
    page: page || 1,
    pageSize: page ? pageSize : total,
    total: total,
    totalPages: page ? Math.ceil(total / pageSize) : 1,
    previous: page > 1 ? `${url}?page=${page - 1}&pageSize=${pageSize}` : null,
    next: page < Math.ceil(total / pageSize) ? `${url}?page=${page + 1}&pageSize=${pageSize}` : null,
    links: {
      first: page ? `${url}?page=1&pageSize=${pageSize}` : null,
      last: page ? `${url}?page=${Math.ceil(total / pageSize)}&pageSize=${pageSize}` : null,
    }
  }

  return pagination;
}