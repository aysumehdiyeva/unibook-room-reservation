import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const employees = sqliteTable("employees", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  phone: text("phone").notNull(),
  location: text("location").notNull().default("IT Office"),
  description: text("description").notNull().default(""),
  email: text("email").notNull().unique(),
  company: text("company").notNull(),
  alias: text("alias").notNull(),
  department: text("department").notNull(),
  role: text("role").notNull().default("employee"),
});

export const rooms = sqliteTable("rooms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  location: text("location").notNull().default("Main Office"),
  displayLabel: text("display_label").notNull().default("Available to book"),
  roomPhone: text("room_phone").notNull().default(""),
  status: text("status").notNull().default("available"),
  reason: text("reason"),
  access: text("access").notNull().default("all"),
  allowedEmployeeId: text("allowed_employee_id"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomId: integer("room_id").notNull(),
  date: text("date").notNull(),
  start: real("start").notNull(),
  end: real("end").notNull(),
  employeeId: text("employee_id").notNull(),
  createdBy: text("created_by").notNull(),
});
