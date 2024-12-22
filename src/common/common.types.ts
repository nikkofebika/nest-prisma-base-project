export type Pagination<T> = {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    per_page: number;
    to: number;
    total: number;
    total_pages: number;
  };
};
