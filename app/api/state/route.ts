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
    "aysu@example.com",
    "Demo Company",
    "aysu",
    "Business",
    "employee",
  ],
  [
    "assistant",
    "Parvana Salimova",
    "Executive Assistant",
    "1002",
    "Head Office",
    "parvana.salimova@example.com",
    "Demo Company",
    "parvana.salimova",
    "Executive Office",
    "employee",
  ],
  [
    "specialist",
    "Lyaman Alizade",
    "Human Resources Specialist",
    "1003",
    "Head Office",
    "lyaman.alizade@example.com",
    "Demo Company",
    "lyaman.alizade",
    "Human Resources",
    "employee",
  ],
  [
    "it",
    "Jafar Mammadzada",
    "IT Specialist",
    "1004",
    "IT Office",
    "jafar.mammadzada@example.com",
    "Demo Company",
    "jafar.mammadzada",
    "IT Office",
    "employee",
  ],
  [
    "product",
    "Ethan Brooks",
    "Product Owner",
    "1005",
    "Head Office",
    "ethan@example.com",
    "Demo Company",
    "ethan.brooks",
    "Digital Banking",
    "employee",
  ],
  [
    "lead",
    "Ismayil Huseynzade",
    "Risk Specialist",
    "1006",
    "Head Office",
    "ismayil.huseynzade@example.com",
    "Demo Company",
    "ismayil.huseynzade",
    "Risk",
    "employee",
  ],
  [
    "admin",
    "Parvana Aghayeva",
    "Office Administrator",
    "1000",
    "Head Office",
    "parvana.aghayeva@example.com",
    "Demo Company",
    "parvana.aghayeva",
    "Administration",
    "admin",
  ],
];

const roomSeeds = [
  { name: "Meeting Room 1", phone: "" },
  { name: "Meeting Room 3", phone: "3232" },
  { name: "Meeting Room 4", phone: "" },
  { name: "Meeting Room 5", phone: "2655" },
  { name: "Meeting Room 6", phone: "" },
  { name: "Meeting Room 8", phone: "2800" },
  { name: "Meeting Room 9", phone: "2699" },
  { name: "Training Room", phone: "" },
  { name: "Planning Zone", phone: "" },
  { name: "Synergy Room", phone: "" },
  { name: "Vision Room", phone: "" },
  { name: "Agile Arena", phone: "" },
  { name: "Idea Space", phone: "" },
];

let initialization: Promise<void> | null = null;

async function initializeDatabase() {
  const db = env.DB;
  await db.batch([
    db.prepare(
      "CREATE TABLE IF NOT EXISTS employees (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, title TEXT NOT NULL, phone TEXT NOT NULL, location TEXT NOT NULL DEFAULT 'IT Office', email TEXT NOT NULL UNIQUE, company TEXT NOT NULL, alias TEXT NOT NULL, department TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'employee')",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS rooms (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name TEXT NOT NULL UNIQUE, location TEXT NOT NULL DEFAULT 'Main Office', display_label TEXT NOT NULL DEFAULT 'Available to book', room_phone TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'available', reason TEXT, access TEXT NOT NULL DEFAULT 'all', allowed_employee_id TEXT, active INTEGER NOT NULL DEFAULT 1)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, room_id INTEGER NOT NULL, date TEXT NOT NULL, start REAL NOT NULL, end REAL NOT NULL, employee_id TEXT NOT NULL, created_by TEXT NOT NULL, guest_visit INTEGER NOT NULL DEFAULT 0, guest_message TEXT, notification_status TEXT NOT NULL DEFAULT 'not_required')",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS bookings_room_date_idx ON bookings(room_id, date, start, end)",
    ),
    db.prepare(
      "CREATE TABLE IF NOT EXISTS booking_recipients (booking_id INTEGER NOT NULL, employee_id TEXT NOT NULL, PRIMARY KEY (booking_id, employee_id))",
    ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS booking_recipients_booking_idx ON booking_recipients(booking_id)",
    ),
  ]);
  const bookingColumns = await db
    .prepare("PRAGMA table_info(bookings)")
    .all<{ name: string }>();
  const columnNames = new Set(
    bookingColumns.results.map((column) => String(column.name)),
  );
  if (!columnNames.has("guest_visit")) {
    await db
      .prepare(
        "ALTER TABLE bookings ADD COLUMN guest_visit INTEGER NOT NULL DEFAULT 0",
      )
      .run();
  }
  if (!columnNames.has("guest_message")) {
    await db
      .prepare("ALTER TABLE bookings ADD COLUMN guest_message TEXT")
      .run();
  }
  if (!columnNames.has("notification_status")) {
    await db
      .prepare(
        "ALTER TABLE bookings ADD COLUMN notification_status TEXT NOT NULL DEFAULT 'not_required'",
      )
      .run();
  }
  const employeeCount = await db
    .prepare("SELECT COUNT(*) AS count FROM employees")
    .first<{ count: number }>();
  const roomCount = await db
    .prepare("SELECT COUNT(*) AS count FROM rooms")
    .first<{ count: number }>();

  if (!employeeCount?.count) {
    const employeeStatements = employeeSeeds.map((employee) =>
      db
        .prepare(
          "INSERT INTO employees (id,name,title,phone,location,email,company,alias,department,role) VALUES (?,?,?,?,?,?,?,?,?,?)",
        )
        .bind(...employee),
    );
    await db.batch(employeeStatements);
  }

  if (!roomCount?.count) {
    const roomStatements = roomSeeds.map((room, index) => {
      const access =
        room.name === "Meeting Room 8"
          ? "employee"
          : index > 5
            ? "department"
            : "all";
      const allowed = room.name === "Meeting Room 8" ? "assistant" : null;
      const displayLabel =
        access === "department" ? "IT Office" : "Available to book";
      return db
        .prepare(
          "INSERT INTO rooms (name,display_label,room_phone,access,allowed_employee_id) VALUES (?,?,?,?,?)",
        )
        .bind(room.name, displayLabel, room.phone, access, allowed);
    });
    await db.batch(roomStatements);
  }

  const count = await db
    .prepare("SELECT COUNT(*) AS count FROM bookings")
    .first<{ count: number }>();
  const demoDataWasInserted = !employeeCount?.count && !roomCount?.count;
  if (!count?.count && demoDataWasInserted) {
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
  const [employees, rooms, bookings, recipients] = await Promise.all([
    env.DB.prepare("SELECT * FROM employees ORDER BY name").all(),
    env.DB.prepare("SELECT * FROM rooms ORDER BY id").all(),
    env.DB.prepare("SELECT * FROM bookings ORDER BY date,start").all(),
    env.DB.prepare(
      "SELECT booking_id, employee_id FROM booking_recipients ORDER BY booking_id, employee_id",
    ).all<{ booking_id: number; employee_id: string }>(),
  ]);
  const recipientIdsByBooking = new Map<number, string[]>();
  for (const recipient of recipients.results) {
    const bookingRecipients =
      recipientIdsByBooking.get(recipient.booking_id) ?? [];
    bookingRecipients.push(recipient.employee_id);
    recipientIdsByBooking.set(recipient.booking_id, bookingRecipients);
  }
  return Response.json({
    employees: employees.results,
    rooms: rooms.results,
    bookings: bookings.results.map((booking) => ({
      ...booking,
      recipient_ids: recipientIdsByBooking.get(Number(booking.id)) ?? [],
    })),
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
    const guestVisit = body.guestVisit === true;
    const guestMessage = guestVisit
      ? String(body.guestMessage ?? "").trim()
      : "";
    if (guestMessage.length > 1000)
      return Response.json(
        { error: "The guest message must be 1,000 characters or fewer." },
        { status: 400 },
      );
    const requestedRecipientIds = Array.isArray(body.recipientIds)
      ? body.recipientIds.map(String)
      : [];
    const recipientIds = [...new Set(requestedRecipientIds)].filter(
      (id) => id !== String(actor.id) && id !== String(body.employeeId),
    );
    if (recipientIds.length > 25)
      return Response.json(
        { error: "Choose no more than 25 meeting recipients." },
        { status: 400 },
      );
    if (recipientIds.length) {
      const employeePlaceholders = recipientIds.map(() => "?").join(",");
      const validRecipients = await env.DB.prepare(
        `SELECT id FROM employees WHERE id IN (${employeePlaceholders})`,
      )
        .bind(...recipientIds)
        .all<{ id: string }>();
      if (validRecipients.results.length !== recipientIds.length)
        return Response.json(
          { error: "One or more selected recipients are unavailable." },
          { status: 400 },
        );
    }
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
      "INSERT INTO bookings(room_id,date,start,end,employee_id,created_by,guest_visit,guest_message,notification_status) SELECT ?,?,?,?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE room_id=? AND date=? AND ? < end AND ? > start)",
    )
      .bind(
        body.roomId,
        body.date,
        body.start,
        body.end,
        body.employeeId,
        actor.id,
        guestVisit ? 1 : 0,
        guestMessage || null,
        guestVisit ? "demo_ready" : "not_required",
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
    const bookingId = Number(result.meta.last_row_id);
    if (recipientIds.length) {
      await env.DB.batch(
        recipientIds.map((employeeId) =>
          env.DB.prepare(
            "INSERT INTO booking_recipients (booking_id, employee_id) VALUES (?, ?)",
          ).bind(bookingId, employeeId),
        ),
      );
    }
    return Response.json({
      ok: true,
      booking: {
        id: bookingId,
        room_id: Number(body.roomId),
        date: String(body.date),
        start: Number(body.start),
        end: Number(body.end),
        employee_id: String(body.employeeId),
        created_by: String(actor.id),
        guest_visit: guestVisit ? 1 : 0,
        guest_message: guestMessage || null,
        notification_status: guestVisit ? "demo_ready" : "not_required",
        recipient_ids: recipientIds,
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
    await env.DB.batch([
      env.DB.prepare("DELETE FROM booking_recipients WHERE booking_id=?").bind(
        body.id,
      ),
      env.DB.prepare("DELETE FROM bookings WHERE id=?").bind(body.id),
    ]);
    return Response.json({ ok: true });
  }
  if (body.action === "removeRoom") {
    if (actor.role !== "admin")
      return Response.json(
        { error: "Only an administrator can remove rooms." },
        { status: 403 },
      );
    const result = await env.DB.prepare("UPDATE rooms SET active=0 WHERE id=?")
      .bind(body.id)
      .run();
    if (!result.meta.changes)
      return Response.json({ error: "Room not found." }, { status: 404 });
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
