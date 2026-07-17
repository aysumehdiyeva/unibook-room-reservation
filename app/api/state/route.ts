import { env } from "cloudflare:workers";
import { canCancelBooking, canReserveRoom } from "../../lib/authorization";
import { readSessionUser } from "../../lib/session";

const employeeSeeds = [
  [
    "aysu",
    "Aysu Mehdiyeva",
    "Student Developer",
    "1001",
    "Head Office",
    "",
    "aysu@example.com",
    "Demo Company",
    "aysu",
    "Business",
    "employee",
  ],
  [
    "assistant",
    "Maya Collins",
    "Executive Assistant",
    "1002",
    "Head Office",
    "",
    "maya@example.com",
    "Demo Company",
    "maya.collins",
    "Executive Office",
    "employee",
  ],
  [
    "specialist",
    "Noah Bennett",
    "Senior Specialist",
    "1003",
    "City Office",
    "",
    "noah@example.com",
    "Demo Company",
    "noah.bennett",
    "Operations",
    "employee",
  ],
  [
    "it",
    "Lina Carter",
    "IT Specialist",
    "1004",
    "IT Office",
    "",
    "lina@example.com",
    "Demo Company",
    "lina.carter",
    "IT Office",
    "employee",
  ],
  [
    "product",
    "Ethan Brooks",
    "Product Owner",
    "1005",
    "Head Office",
    "",
    "ethan@example.com",
    "Demo Company",
    "ethan.brooks",
    "Digital Banking",
    "employee",
  ],
  [
    "lead",
    "Sara Morgan",
    "Team Lead",
    "1006",
    "Regional Office",
    "",
    "sara@example.com",
    "Demo Company",
    "sara.morgan",
    "Risk",
    "employee",
  ],
  [
    "admin",
    "Olivia Reed",
    "Office Administrator",
    "1000",
    "Head Office",
    "",
    "olivia@example.com",
    "Demo Company",
    "olivia.reed",
    "Administration",
    "admin",
  ],
];

const roomSeeds = [
  "Meeting Room 1",
  "Meeting Room 3",
  "Meeting Room 4",
  "Meeting Room 5",
  "Meeting Room 6",
  "Meeting Room 8",
  "Training Room",
  "Planning Zone",
  "Synergy Room",
  "Vision Room",
  "Agile Arena",
  "Idea Space",
];

let initialization: Promise<void> | null = null;

async function initializeDatabase() {
  const db = env.DB;
  await db.batch([
    db.prepare(
      "CREATE TABLE IF NOT EXISTS employees (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, title TEXT NOT NULL, phone TEXT NOT NULL, location TEXT NOT NULL DEFAULT 'IT Office', description TEXT NOT NULL DEFAULT '', email TEXT NOT NULL UNIQUE, company TEXT NOT NULL, alias TEXT NOT NULL, department TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'employee')",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS rooms (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name TEXT NOT NULL UNIQUE, location TEXT NOT NULL DEFAULT 'Main Office', display_label TEXT NOT NULL DEFAULT 'Available to book', room_phone TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'available', reason TEXT, access TEXT NOT NULL DEFAULT 'all', allowed_employee_id TEXT, active INTEGER NOT NULL DEFAULT 1)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, room_id INTEGER NOT NULL, date TEXT NOT NULL, start REAL NOT NULL, end REAL NOT NULL, employee_id TEXT NOT NULL, created_by TEXT NOT NULL)",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS bookings_room_date_idx ON bookings(room_id, date, start, end)",
    ),
  ]);
  const employeeStatements = employeeSeeds.map((employee) =>
    db
      .prepare(
        "INSERT OR IGNORE INTO employees (id,name,title,phone,location,description,email,company,alias,department,role) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      )
      .bind(...employee),
  );
  const roomStatements = roomSeeds.map((name) => {
    const access =
      name === "Meeting Room 8"
        ? "employee"
        : roomSeeds.indexOf(name) > 5
          ? "department"
          : "all";
    const allowed = name === "Meeting Room 8" ? "assistant" : null;
    return db
      .prepare(
        "INSERT OR IGNORE INTO rooms (name,access,allowed_employee_id) VALUES (?,?,?)",
      )
      .bind(name, access, allowed);
  });
  await db.batch([...employeeStatements, ...roomStatements]);
  const count = await db
    .prepare("SELECT COUNT(*) AS count FROM bookings")
    .first<{ count: number }>();
  if (!count?.count) {
    await db.batch([
      db.prepare(
        "INSERT INTO bookings(room_id,date,start,end,employee_id,created_by) SELECT id,'2026-07-20',9.5,10.5,'product','product' FROM rooms WHERE name='Meeting Room 1'",
      ),
      db.prepare(
        "INSERT INTO bookings(room_id,date,start,end,employee_id,created_by) SELECT id,'2026-07-20',10.5,12,'specialist','specialist' FROM rooms WHERE name='Meeting Room 3'",
      ),
      db.prepare(
        "INSERT INTO bookings(room_id,date,start,end,employee_id,created_by) SELECT id,'2026-07-20',15,16,'aysu','aysu' FROM rooms WHERE name='Meeting Room 4'",
      ),
      db.prepare(
        "INSERT INTO bookings(room_id,date,start,end,employee_id,created_by) SELECT id,'2026-07-20',14,15.5,'assistant','assistant' FROM rooms WHERE name='Meeting Room 8'",
      ),
    ]);
  }
}

async function ensureDatabase() {
  if (!initialization) {
    initialization = initializeDatabase().catch((error) => {
      initialization = null;
      throw error;
    });
  }
  return initialization;
}

export async function GET() {
  await ensureDatabase();
  const [employees, rooms, bookings] = await Promise.all([
    env.DB.prepare("SELECT * FROM employees ORDER BY name").all(),
    env.DB.prepare("SELECT * FROM rooms ORDER BY id").all(),
    env.DB.prepare("SELECT * FROM bookings ORDER BY date,start").all(),
  ]);
  return Response.json({
    employees: employees.results,
    rooms: rooms.results,
    bookings: bookings.results,
  });
}

async function authenticatedEmployee(request: Request) {
  const userId = readSessionUser(request);
  if (!userId) return null;
  return env.DB.prepare("SELECT * FROM employees WHERE id=?")
    .bind(userId)
    .first<Record<string, unknown>>();
}

export async function POST(request: Request) {
  await ensureDatabase();
  const body = (await request.json()) as Record<string, unknown>;
  const actor = await authenticatedEmployee(request);
  if (!actor)
    return Response.json({ error: "Please sign in again." }, { status: 401 });

  if (body.action === "book") {
    const room = await env.DB.prepare(
      "SELECT * FROM rooms WHERE id=? AND active=1",
    )
      .bind(body.roomId)
      .first<Record<string, unknown>>();
    if (!room || room.status !== "available")
      return Response.json(
        { error: "This room is unavailable." },
        { status: 409 },
      );
    const allowed = canReserveRoom(
      {
        id: String(actor.id),
        department: String(actor.department),
        role: String(actor.role),
      },
      {
        name: String(room.name),
        access: String(room.access),
        allowed_employee_id: room.allowed_employee_id
          ? String(room.allowed_employee_id)
          : null,
      },
    );
    if (!allowed)
      return Response.json(
        { error: "You do not have access to this room." },
        { status: 403 },
      );
    const result = await env.DB.prepare(
      "INSERT INTO bookings(room_id,date,start,end,employee_id,created_by) SELECT ?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE room_id=? AND date=? AND ? < end AND ? > start)",
    )
      .bind(
        body.roomId,
        body.date,
        body.start,
        body.end,
        body.employeeId,
        actor.id,
        body.roomId,
        body.date,
        body.start,
        body.end,
      )
      .run();
    if (!result.meta.changes)
      return Response.json(
        { error: "This time is already reserved." },
        { status: 409 },
      );
    return Response.json({
      ok: true,
      booking: {
        id: Number(result.meta.last_row_id),
        room_id: Number(body.roomId),
        date: String(body.date),
        start: Number(body.start),
        end: Number(body.end),
        employee_id: String(body.employeeId),
        created_by: String(actor.id),
      },
    });
  }
  if (body.action === "cancel") {
    const booking = await env.DB.prepare(
      "SELECT created_by FROM bookings WHERE id=?",
    )
      .bind(body.id)
      .first<{ created_by: string }>();
    if (
      !booking ||
      !canCancelBooking(
        { id: String(actor.id), role: String(actor.role) },
        booking.created_by,
      )
    ) {
      return Response.json(
        { error: "You cannot cancel this reservation." },
        { status: 403 },
      );
    }
    await env.DB.prepare("DELETE FROM bookings WHERE id=?").bind(body.id).run();
    return Response.json({ ok: true });
  }
  if (body.action === "room" && actor.role === "admin") {
    if (body.id) {
      await env.DB.prepare(
        "UPDATE rooms SET location=?, display_label=?, room_phone=?, status=?, reason=?, access=?, allowed_employee_id=?, active=? WHERE id=?",
      )
        .bind(
          body.location || "Main Office",
          body.displayLabel || "Available to book",
          body.roomPhone || "",
          body.status,
          body.reason || null,
          body.access,
          body.allowedEmployeeId || null,
          body.active ? 1 : 0,
          body.id,
        )
        .run();
    } else {
      const result = await env.DB.prepare(
        "INSERT INTO rooms(name,location,display_label,room_phone,status,reason,access,allowed_employee_id,active) VALUES (?,?,?,?,?,?,?,?,1)",
      )
        .bind(
          body.name,
          body.location || "Main Office",
          body.displayLabel || "Available to book",
          body.roomPhone || "",
          "available",
          null,
          "all",
          null,
        )
        .run();
      return Response.json({
        ok: true,
        room: { id: Number(result.meta.last_row_id) },
      });
    }
    return Response.json({ ok: true });
  }
  return Response.json({ error: "Invalid action." }, { status: 400 });
}

