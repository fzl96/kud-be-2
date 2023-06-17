import {
  mysqlTable,
  mysqlSchema,
  AnyMySqlColumn,
  uniqueIndex,
  varchar,
  datetime,
  index,
  tinyint,
  mysqlEnum,
  int,
  double,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { sql, InferModel } from "drizzle-orm";

export const category = mysqlTable(
  "Category",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    createdAt: datetime("createdAt", { mode: "string", fsp: 3 })
      .default(sql`(CURRENT_TIMESTAMP(3))`)
      .notNull(),
    updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 }).notNull(),
  },
  (table) => {
    return {
      nameKey: uniqueIndex("Category_name_key").on(table.name),
    };
  }
);

export type Category = InferModel<typeof category>;
