import assert from "node:assert/strict";
import test from "node:test";
import {
  bookingsOverlap,
  canCancelBooking,
  canReserveRoom,
} from "../app/lib/authorization.ts";

const employee = { id: "aysu", department: "Business", role: "employee" };
const itEmployee = { id: "elvin", department: "IT Office", role: "employee" };
const admin = { id: "admin", department: "Administration", role: "admin" };

test("detects booking collisions but permits adjacent meetings", () => {
  assert.equal(bookingsOverlap(9, 10, 9.5, 10.5), true);
  assert.equal(bookingsOverlap(9, 10, 10, 11), false);
  assert.equal(bookingsOverlap(10, 11, 9, 10), false);
});

test("enforces all-worker and IT Office room access", () => {
  const openRoom = {
    name: "Meeting Room 1",
    access: "all",
    allowed_employee_id: null,
  };
  const itRoom = {
    name: "Training Room",
    access: "department",
    allowed_employee_id: null,
  };
  assert.equal(canReserveRoom(employee, openRoom), true);
  assert.equal(canReserveRoom(employee, itRoom), false);
  assert.equal(canReserveRoom(itEmployee, itRoom), true);
  assert.equal(canReserveRoom(admin, itRoom), true);
});

test("keeps Meeting Room 8 unavailable to administrators", () => {
  const roomEight = {
    name: "Meeting Room 8",
    access: "employee",
    allowed_employee_id: "parvana",
  };
  assert.equal(canReserveRoom(admin, roomEight), false);
  assert.equal(canReserveRoom({ ...employee, id: "parvana" }, roomEight), true);
});

test("allows cancellation only by the creator or an administrator", () => {
  assert.equal(canCancelBooking(employee, "aysu"), true);
  assert.equal(canCancelBooking(employee, "nigar"), false);
  assert.equal(canCancelBooking(admin, "nigar"), true);
});
