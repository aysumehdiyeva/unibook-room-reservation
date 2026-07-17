export type AccessActor = {
  id: string;
  department: string;
  role: string;
};

export type AccessRoom = {
  name: string;
  access: string;
  allowed_employee_id: string | null;
};

export function bookingsOverlap(
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number,
) {
  return firstStart < secondEnd && firstEnd > secondStart;
}

export function canReserveRoom(actor: AccessActor, room: AccessRoom) {
  if (room.name === "Meeting Room 8") {
    return room.access === "employee" && room.allowed_employee_id === actor.id;
  }

  if (actor.role === "admin") return true;
  if (room.access === "all") return true;
  if (room.access === "employee") return room.allowed_employee_id === actor.id;
  return room.access === "department" && actor.department === "IT Office";
}

export function canCancelBooking(
  actor: Pick<AccessActor, "id" | "role">,
  createdBy: string,
) {
  return actor.role === "admin" || actor.id === createdBy;
}
