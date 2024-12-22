import { Prisma } from '@prisma/client';

type PaginationResult = {
  data: [];
  meta: {
    current_page: number;
    from: number;
    per_page: number;
    to: number;
    total: number;
    total_pages: number;
  };
};

type PaginationOptions = {
  page: number;
  per_page: number;
  sort: string;
};

type PaginationQuery<T> = PaginationOptions &
  Prisma.SelectSubset<T, Prisma.UserWhereInput>;

export async function paginate(
  model: { findMany: Function; count: Function },
  query: PaginationOptions & { [key: string]: string },
): Promise<PaginationResult> {
  const { page, per_page, sort, ...filters } = query;

  let where: Prisma.UserWhereInput;

  if (Object.keys(filters).length) {
    Object.entries(filters).forEach(([column, value]) => {
      where = {
        ...where,
        [column]: { contains: value },
      };
    });
  }

  const skip = (page - 1) * per_page;
  const users = await model.findMany({
    where,
    skip,
    take: per_page,
  });

  // users = users.map(user => new UserEntity(user))
  const total = await model.count({ where });

  return {
    data: users,
    meta: {
      current_page: page,
      from: (page - 1) * per_page + 1,
      per_page: per_page,
      to: page * per_page,
      total: total,
      total_pages: Math.ceil(total / per_page),
    },
  };

  return {
    data: [],
    meta: {
      current_page: 1,
      from: 1,
      per_page: 1,
      to: 1,
      total: 1,
      total_pages: 1,
    },
  };
}
