"use client";

import { useEffect, useMemo, useState } from "react";

type Employee = {
  id: string;
  name: string;
  title: string;
  phone: string;
  location: string;
  description: string;
  email: string;
  company: string;
  alias: string;
  department: string;
  role: string;
};
type Room = {
  id: number;
  name: string;
  location: string;
  display_label: string;
  room_phone: string;
  status: string;
  reason: string | null;
  access: string;
  allowed_employee_id: string | null;
  active: number;
};
type Booking = {
  id: number;
  room_id: number;
  date: string;
  start: number;
  end: number;
  employee_id: string;
  created_by: string;
};
type State = { employees: Employee[]; rooms: Room[]; bookings: Booking[] };
type Page = "calendar" | "mine" | "address" | "admin";

const fallbackEmployees: Employee[] = [
  {
    id: "aysu",
    name: "Aysu Mehdiyeva",
    title: "Student Developer",
    phone: "1001",
    location: "Head Office",
    description: "",
    email: "aysu@example.com",
    company: "Demo Company",
    alias: "aysu",
    department: "Product",
    role: "employee",
  },
  {
    id: "assistant",
    name: "Maya Collins",
    title: "Executive Assistant",
    phone: "1002",
    location: "Head Office",
    description: "",
    email: "maya@example.com",
    company: "Demo Company",
    alias: "maya.collins",
    department: "Executive Office",
    role: "employee",
  },
  {
    id: "specialist",
    name: "Noah Bennett",
    title: "Senior Specialist",
    phone: "1003",
    location: "City Office",
    description: "",
    email: "noah@example.com",
    company: "Demo Company",
    alias: "noah.bennett",
    department: "Operations",
    role: "employee",
  },
  {
    id: "it",
    name: "Lina Carter",
    title: "IT Specialist",
    phone: "1004",
    location: "IT Office",
    description: "",
    email: "lina@example.com",
    company: "Demo Company",
    alias: "lina.carter",
    department: "IT Office",
    role: "employee",
  },
  {
    id: "product",
    name: "Ethan Brooks",
    title: "Product Owner",
    phone: "1005",
    location: "Head Office",
    description: "",
    email: "ethan@example.com",
    company: "Demo Company",
    alias: "ethan.brooks",
    department: "Digital Products",
    role: "employee",
  },
  {
    id: "lead",
    name: "Sara Morgan",
    title: "Team Lead",
    phone: "1006",
    location: "Regional Office",
    description: "",
    email: "sara@example.com",
    company: "Demo Company",
    alias: "sara.morgan",
    department: "Risk",
    role: "employee",
  },
  {
    id: "admin",
    name: "Olivia Reed",
    title: "Office Administrator",
    phone: "1000",
    location: "Head Office",
    description: "",
    email: "olivia@example.com",
    company: "Demo Company",
    alias: "olivia.reed",
    department: "Administration",
    role: "admin",
  },
];
const roomNames = [
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
const fallbackRooms: Room[] = roomNames.map((name, index) => ({
  id: index + 1,
  name,
  location: "Main Office",
  display_label: index > 5 ? "IT Office" : "Available to book",
  room_phone: "",
  status: name === "Meeting Room 5" ? "unavailable" : "available",
  reason: name === "Meeting Room 5" ? "Room is under repair" : null,
  access:
    name === "Meeting Room 8" ? "employee" : index > 5 ? "department" : "all",
  allowed_employee_id: name === "Meeting Room 8" ? "assistant" : null,
  active: 1,
}));
const fallbackBookings: Booking[] = [
  {
    id: 1,
    room_id: 1,
    date: "2026-07-20",
    start: 9.5,
    end: 10.5,
    employee_id: "product",
    created_by: "product",
  },
  {
    id: 2,
    room_id: 2,
    date: "2026-07-20",
    start: 10.5,
    end: 12,
    employee_id: "specialist",
    created_by: "specialist",
  },
  {
    id: 3,
    room_id: 3,
    date: "2026-07-20",
    start: 15,
    end: 16,
    employee_id: "aysu",
    created_by: "aysu",
  },
  {
    id: 4,
    room_id: 6,
    date: "2026-07-20",
    start: 14,
    end: 15.5,
    employee_id: "assistant",
    created_by: "assistant",
  },
];
const fallback: State = {
  employees: fallbackEmployees,
  rooms: fallbackRooms,
  bookings: fallbackBookings,
};
const times = Array.from({ length: 19 }, (_, index) => 9 + index * 0.5);
const formatTime = (time: number) =>
  `${String(Math.floor(time)).padStart(2, "0")}:${time % 1 ? "30" : "00"}`;
const formatDuration = (start: number, end: number) => {
  const minutes = Math.round((end - start) * 60);
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return hours
    ? `${hours} hr${hours > 1 ? "s" : ""}${remainder ? ` ${remainder} mins` : ""}`
    : `${remainder} mins`;
};
const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
const RoomTitle = ({
  name,
  as: Tag = "strong",
}: {
  name: string;
  as?: "strong" | "h2";
}) => <Tag>{name}</Tag>;
const iso = (date: Date) => date.toISOString().slice(0, 10);
const weekStart = (offset: number) => {
  const date = new Date("2026-07-20T12:00:00");
  date.setDate(date.getDate() + offset * 7);
  return date;
};
const weekDays = (offset: number) =>
  Array.from({ length: 5 }, (_, index) => {
    const date = weekStart(offset);
    date.setDate(date.getDate() + index);
    return {
      iso: iso(date),
      short: date
        .toLocaleDateString("en-GB", { weekday: "short" })
        .toUpperCase(),
      date: String(date.getDate()),
      label: date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    };
  });

export default function Home() {
  const [data, setData] = useState<State>(fallback);
  const [page, setPage] = useState<Page>("calendar");
  const [currentUserId, setCurrentUserId] = useState("aysu");
  const [signedIn, setSignedIn] = useState(true);
  const [week, setWeek] = useState(0);
  const [day, setDay] = useState(0);
  const [profileMenu, setProfileMenu] = useState(false);
  const [demoLogin, setDemoLogin] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [selectedSlot, setSelectedSlot] = useState<{
    room: Room;
    start: number;
  } | null>(null);
  const [end, setEnd] = useState(10);
  const [reservedFor, setReservedFor] = useState("aysu");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [adminRoom, setAdminRoom] = useState<Room | null>(null);
  const [addRoom, setAddRoom] = useState(false);

  const currentUser =
    data.employees.find((employee) => employee.id === currentUserId) ??
    data.employees[0];
  const days = weekDays(week);
  const selectedDate = days[day].iso;
  const isAdmin = currentUser?.role === "admin";

  async function refresh() {
    try {
      const response = await fetch("/api/state", { cache: "no-store" });
      if (response.ok) setData(await response.json());
    } catch {
      /* local visual fallback */
    }
  }
  useEffect(() => {
    void refresh();
    const storedUser = window.localStorage.getItem("unibook-demo-user");
    const storedSession = window.localStorage.getItem("unibook-demo-signed-in");
    if (storedUser) setCurrentUserId(storedUser);
    if (storedSession === "false") setSignedIn(false);
  }, []);

  const employeeMap = useMemo(
    () => new Map(data.employees.map((employee) => [employee.id, employee])),
    [data.employees],
  );
  const visibleBookings = data.bookings.filter(
    (booking) =>
      booking.date === selectedDate &&
      (page !== "mine" ||
        booking.employee_id === currentUser.id ||
        booking.created_by === currentUser.id),
  );
  const filteredEmployees = data.employees.filter((employee) =>
    `${employee.name} ${employee.title} ${employee.phone} ${employee.location} ${employee.department} ${employee.email} ${employee.company} ${employee.alias}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  function hasAccess(room: Room) {
    return (
      room.access === "all" ||
      (room.access === "employee" &&
        room.allowed_employee_id === currentUser.id) ||
      (room.access === "department" &&
        currentUser.department === "IT Office") ||
      (isAdmin && room.name !== "Meeting Room 8")
    );
  }

  function chooseSlot(room: Room, start: number) {
    if (room.status !== "available" || !hasAccess(room)) return;
    if (
      data.bookings.some(
        (booking) =>
          booking.room_id === room.id &&
          booking.date === selectedDate &&
          start >= booking.start &&
          start < booking.end,
      )
    )
      return;
    setSelectedSlot({ room, start });
    setEnd(Math.min(start + 1, 18));
    setReservedFor(currentUser.id);
    setError("");
  }

  async function api(body: Record<string, unknown>, refreshAfter = true) {
    const response = await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = (await response.json()) as {
      error?: string;
      booking?: Booking;
      room?: { id: number };
    };
    if (!response.ok) throw new Error(result.error || "Something went wrong.");
    if (refreshAfter) await refresh();
    return result;
  }

  async function reserve() {
    if (!selectedSlot) return;
    if (end <= selectedSlot.start || end > 18) {
      setError("Choose a valid end time.");
      return;
    }
    const optimisticId = -Date.now();
    const optimisticBooking: Booking = {
      id: optimisticId,
      room_id: selectedSlot.room.id,
      date: selectedDate,
      start: selectedSlot.start,
      end,
      employee_id: reservedFor,
      created_by: currentUser.id,
    };
    setData((current) => ({
      ...current,
      bookings: [...current.bookings, optimisticBooking],
    }));
    setSelectedSlot(null);
    setError("");
    try {
      const result = await api(
        {
          action: "book",
          roomId: optimisticBooking.room_id,
          date: optimisticBooking.date,
          start: optimisticBooking.start,
          end: optimisticBooking.end,
          employeeId: optimisticBooking.employee_id,
          createdBy: optimisticBooking.created_by,
        },
        false,
      );
      if (result.booking)
        setData((current) => ({
          ...current,
          bookings: current.bookings.map((booking) =>
            booking.id === optimisticId ? (result.booking as Booking) : booking,
          ),
        }));
    } catch (caught) {
      setData((current) => ({
        ...current,
        bookings: current.bookings.filter(
          (booking) => booking.id !== optimisticId,
        ),
      }));
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to reserve this slot.",
      );
    }
  }

  async function cancelBooking(id: number) {
    try {
      await api({
        action: "cancel",
        id,
        userId: currentUser.id,
        role: currentUser.role,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to cancel.");
    }
  }

  function switchUser(id: string) {
    setCurrentUserId(id);
    setReservedFor(id);
    setSignedIn(true);
    setDemoLogin(false);
    setProfileMenu(false);
    setPage("calendar");
    window.localStorage.setItem("unibook-demo-user", id);
    window.localStorage.setItem("unibook-demo-signed-in", "true");
  }

  function logOut() {
    setSignedIn(false);
    setProfileMenu(false);
    setSelectedEmployee(null);
    setSelectedSlot(null);
    setDemoLogin(false);
    setPage("calendar");
    window.localStorage.setItem("unibook-demo-signed-in", "false");
  }

  async function saveRoom(values: Record<string, unknown>) {
    const id = Number(values.id);
    setData((current) => ({
      ...current,
      rooms: current.rooms.map((room) =>
        room.id === id
          ? {
              ...room,
              location: String(values.location),
              display_label: String(values.displayLabel),
              room_phone: values.roomPhone ? String(values.roomPhone) : "",
              status: String(values.status),
              reason: values.reason ? String(values.reason) : null,
              access: String(values.access),
              allowed_employee_id: values.allowedEmployeeId
                ? String(values.allowedEmployeeId)
                : null,
              active: values.active ? 1 : 0,
            }
          : room,
      ),
    }));
    setAdminRoom(null);
    try {
      await api({ action: "room", role: currentUser.role, ...values }, false);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to save room.",
      );
      await refresh();
    }
  }

  async function createRoom(values: {
    name: string;
    location: string;
    displayLabel: string;
    roomPhone: string;
  }) {
    const temporaryId = -Date.now();
    const temporaryRoom: Room = {
      id: temporaryId,
      name: values.name,
      location: values.location,
      display_label: values.displayLabel,
      room_phone: values.roomPhone,
      status: "available",
      reason: null,
      access: "all",
      allowed_employee_id: null,
      active: 1,
    };
    setData((current) => ({
      ...current,
      rooms: [...current.rooms, temporaryRoom],
    }));
    setAddRoom(false);
    try {
      const result = await api(
        { action: "room", role: currentUser.role, ...values },
        false,
      );
      if (result.room)
        setData((current) => ({
          ...current,
          rooms: current.rooms.map((room) =>
            room.id === temporaryId ? { ...room, id: result.room!.id } : room,
          ),
        }));
    } catch (caught) {
      setData((current) => ({
        ...current,
        rooms: current.rooms.filter((room) => room.id !== temporaryId),
      }));
      setError(
        caught instanceof Error ? caught.message : "Unable to add room.",
      );
    }
  }

  const start = days[0];
  const finish = days[4];
  const weekLabel = `${start.date}–${finish.date} ${weekStart(week).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`;

  if (!signedIn)
    return <SignInScreen employees={data.employees} onSelect={switchUser} />;

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => setPage("calendar")}>
          <span className="brand-mark">U</span>
          <span>
            <strong>UniBook</strong>
            <small>Room reservations</small>
          </span>
        </button>
        <nav aria-label="Main navigation">
          <button
            onClick={() => setPage("calendar")}
            className={page === "calendar" ? "nav-active" : ""}
          >
            Calendar
          </button>
          <button
            onClick={() => setPage("mine")}
            className={page === "mine" ? "nav-active" : ""}
          >
            My reservations
          </button>
          <button
            onClick={() => setPage("address")}
            className={page === "address" ? "nav-active" : ""}
          >
            Address Book
          </button>
          {isAdmin && (
            <button
              onClick={() => setPage("admin")}
              className={page === "admin" ? "nav-active" : ""}
            >
              Admin
            </button>
          )}
        </nav>
        <div
          className="profile-wrap"
          onMouseEnter={() => setProfileMenu(true)}
          onMouseLeave={() => setProfileMenu(false)}
        >
          <button
            className="profile"
            onClick={() => setProfileMenu(!profileMenu)}
          >
            <strong>{currentUser.name}</strong>
            <span>{initials(currentUser.name)}</span>
            <b>⌄</b>
          </button>
          {profileMenu && (
            <div className="profile-menu">
              <button
                onClick={() => {
                  setSelectedEmployee(currentUser);
                  setProfileMenu(false);
                }}
              >
                My profile
              </button>
              <hr />
              <button
                onClick={() => {
                  setDemoLogin(true);
                  setProfileMenu(false);
                }}
              >
                Switch demo account
              </button>
              <button className="logout" onClick={logOut}>
                Log out
              </button>
            </div>
          )}
        </div>
      </header>

      {(page === "calendar" || page === "mine") && (
        <section className="content">
          <div className="heading-row">
            <div>
              <p className="eyebrow">MAIN OFFICE</p>
              <h1>{page === "mine" ? "My reservations" : "Reserve a room"}</h1>
              <p className="subtitle">
                {page === "mine"
                  ? "Your upcoming room reservations in one place."
                  : "Select an empty time to make a reservation."}
              </p>
            </div>
            <div className="week-controls">
              <button
                onClick={() => {
                  setWeek(week - 1);
                  setDay(0);
                }}
                aria-label="Previous week"
              >
                ‹
              </button>
              <strong>{weekLabel}</strong>
              <button
                onClick={() => {
                  setWeek(week + 1);
                  setDay(0);
                }}
                aria-label="Next week"
              >
                ›
              </button>
              <button
                className="today"
                onClick={() => {
                  setWeek(0);
                  setDay(0);
                }}
              >
                Today
              </button>
            </div>
          </div>
          <div className="day-tabs" role="tablist" aria-label="Work week">
            {days.map((item, index) => (
              <button
                key={item.iso}
                onClick={() => setDay(index)}
                className={day === index ? "selected-day" : ""}
                role="tab"
                aria-selected={day === index}
              >
                <span>{item.short}</span>
                <strong>{item.date}</strong>
              </button>
            ))}
          </div>
          <div className="status-row">
            <div>
              <span className="dot available" />
              Available
            </div>
            <div>
              <span className="dot reserved" />
              Reserved
            </div>
            <div>
              <span className="dot closed" />
              Unavailable
            </div>
            <p>{days[day].label} · 09:00–18:00</p>
          </div>
          {error && (
            <div className="error-banner">
              {error}
              <button onClick={() => setError("")}>×</button>
            </div>
          )}
          <div className="schedule-wrap">
            <div
              className="schedule"
              style={{ "--columns": times.length } as React.CSSProperties}
            >
              <div className="room-head">ROOM</div>
              <div className="time-heads">
                {times.map((time) => (
                  <span key={time}>
                    {time % 1 === 0 ? formatTime(time) : ""}
                  </span>
                ))}
              </div>
              {data.rooms
                .filter((room) => room.active)
                .map((room) => {
                  const access = hasAccess(room);
                  const roomBookings = visibleBookings.filter(
                    (booking) => booking.room_id === room.id,
                  );
                  return (
                    <div className="room-row" key={room.id}>
                      <div
                        className={`room-label ${room.name === "Meeting Room 8" ? "room-eight-label" : ""}`}
                      >
                        <RoomTitle name={room.name} />
                        <small>
                          {room.name.startsWith("Meeting Room ")
                            ? `Business phone: ${room.room_phone || "—"}`
                            : room.status !== "available"
                              ? room.reason || "Unavailable"
                              : room.display_label ||
                                (room.access === "department"
                                  ? "IT Office"
                                  : !access
                                    ? "Restricted access"
                                    : "Available to book")}
                        </small>
                      </div>
                      <div
                        className={`slots ${room.status !== "available" ? "is-closed" : ""} ${!access ? "is-restricted" : ""} ${room.access === "employee" && !access ? "ceo-restricted" : ""}`}
                      >
                        {times.slice(0, -1).map((time) => (
                          <button
                            key={time}
                            onClick={() => chooseSlot(room, time)}
                            aria-label={`${room.name}, ${formatTime(time)}`}
                          />
                        ))}
                        {room.status !== "available" && (
                          <div className="closure-block">
                            <strong>Unavailable</strong>
                            {room.reason && <span>{room.reason}</span>}
                          </div>
                        )}
                        {room.status === "available" && !access && (
                          <div className="restricted-block">
                            <strong>Restricted room</strong>
                          </div>
                        )}
                        {room.status === "available" &&
                          access &&
                          roomBookings.map((booking) => {
                            const employee = employeeMap.get(
                              booking.employee_id,
                            );
                            return (
                              <button
                                className={`booking ${booking.employee_id === currentUser.id ? "own" : ""}`}
                                key={booking.id}
                                style={{
                                  left: `${((booking.start - 9) / 9) * 100}%`,
                                  width: `${((booking.end - booking.start) / 9) * 100}%`,
                                }}
                                onClick={() =>
                                  employee && setSelectedEmployee(employee)
                                }
                              >
                                <strong>{employee?.name ?? "Employee"}</strong>
                                <span>
                                  {formatTime(booking.start)}–
                                  {formatTime(booking.end)}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          {page === "mine" && (
            <div className="mine-list">
              <h2>Reservations on {days[day].label}</h2>
              {visibleBookings.length === 0 ? (
                <p className="empty">No reservations for this day.</p>
              ) : (
                visibleBookings.map((booking) => (
                  <div className="mine-item" key={booking.id}>
                    <div>
                      <strong>
                        {
                          data.rooms.find((room) => room.id === booking.room_id)
                            ?.name
                        }
                      </strong>
                      <span>
                        {formatTime(booking.start)}–{formatTime(booking.end)} ·
                        For {employeeMap.get(booking.employee_id)?.name}
                      </span>
                    </div>
                    <button onClick={() => cancelBooking(booking.id)}>
                      Cancel
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      )}

      {page === "address" && (
        <section className="content directory-page">
          <p className="eyebrow">UNIBANK DIRECTORY</p>
          <h1>Address Book</h1>
          <p className="subtitle">
            Find a colleague and view their work contact information.
          </p>
          <div className="search-box">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search the Address Book"
            />
          </div>
          <div className="directory-table">
            <div className="directory-head">
              <span>Name</span>
              <span>Title</span>
              <span>Business Phone</span>
              <span>Location</span>
              <span>Department</span>
              <span>Email Address</span>
              <span>Company</span>
              <span>Alias</span>
            </div>
            {filteredEmployees.map((employee) => (
              <button
                className="directory-row"
                key={employee.id}
                onClick={() => setSelectedEmployee(employee)}
              >
                <span className="person-cell">
                  <b>{initials(employee.name)}</b>
                  <span>
                    <strong>{employee.name}</strong>
                  </span>
                </span>
                <span>{employee.title}</span>
                <span>{employee.phone}</span>
                <span>{employee.location}</span>
                <span>{employee.department}</span>
                <span>{employee.email}</span>
                <span>{employee.company}</span>
                <span>{employee.alias}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {page === "admin" && isAdmin && (
        <AdminPanel
          rooms={data.rooms}
          employees={data.employees}
          onEdit={setAdminRoom}
          onAdd={() => setAddRoom(true)}
        />
      )}

      {selectedSlot && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setSelectedSlot(null)
          }
        >
          <section className="modal" role="dialog" aria-modal="true">
            <button
              className="close-modal"
              onClick={() => setSelectedSlot(null)}
            >
              ×
            </button>
            <p className="eyebrow">NEW RESERVATION</p>
            <RoomTitle name={selectedSlot.room.name} as="h2" />
            <div className="summary">
              <div>
                <span>Date</span>
                <strong>{days[day].label}</strong>
              </div>
              <div>
                <span>Starts</span>
                <strong>{formatTime(selectedSlot.start)}</strong>
              </div>
            </div>
            <label>
              End time
              <select
                value={end}
                onChange={(event) => setEnd(Number(event.target.value))}
              >
                {times
                  .filter((time) => time > selectedSlot.start)
                  .map((time) => (
                    <option key={time} value={time}>
                      {formatTime(time)} (
                      {formatDuration(selectedSlot.start, time)})
                    </option>
                  ))}
              </select>
            </label>
            <label>
              Reserved for
              <select
                value={reservedFor}
                onChange={(event) => setReservedFor(event.target.value)}
              >
                {data.employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </label>
            {error && <p className="form-error">{error}</p>}
            <button className="reserve-button" onClick={reserve}>
              Confirm reservation
            </button>
          </section>
        </div>
      )}

      {selectedEmployee && (
        <EmployeeCard
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
      {demoLogin && (
        <DemoLogin
          employees={data.employees}
          current={currentUser.id}
          onSelect={switchUser}
          onClose={() => setDemoLogin(false)}
        />
      )}
      {adminRoom && (
        <RoomEditor
          room={adminRoom}
          employees={data.employees}
          onClose={() => setAdminRoom(null)}
          onSave={saveRoom}
        />
      )}
      {addRoom && (
        <AddRoom onClose={() => setAddRoom(false)} onSave={createRoom} />
      )}
    </main>
  );
}

function EmployeeCard({
  employee,
  onClose,
}: {
  employee: Employee;
  onClose: () => void;
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className="modal profile-card">
        <button className="close-modal" onClick={onClose}>
          ×
        </button>
        <div className="large-avatar">{initials(employee.name)}</div>
        <h2>{employee.name}</h2>
        <p className="profile-title">{employee.title}</p>
        <dl>
          <div>
            <dt>Business phone</dt>
            <dd>{employee.phone}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{employee.location}</dd>
          </div>
          <div>
            <dt>Department</dt>
            <dd>{employee.department}</dd>
          </div>
          <div>
            <dt>Email address</dt>
            <dd>{employee.email}</dd>
          </div>
          <div>
            <dt>Company</dt>
            <dd>{employee.company}</dd>
          </div>
          <div>
            <dt>Alias</dt>
            <dd>{employee.alias}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

function DemoLogin({
  employees,
  current,
  onSelect,
  onClose,
}: {
  employees: Employee[];
  current: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <section className="modal demo-login">
        <button className="close-modal" onClick={onClose}>
          ×
        </button>
        <span className="brand-mark">U</span>
        <h2>Demo accounts</h2>
        <p>Choose an employee to preview their UniBook access.</p>
        <div className="account-list">
          {employees.map((employee) => (
            <button
              key={employee.id}
              className={current === employee.id ? "current-account" : ""}
              onClick={() => onSelect(employee.id)}
            >
              <b>{initials(employee.name)}</b>
              <span>
                <strong>{employee.name}</strong>
                <small>
                  {employee.role === "admin"
                    ? "Administrator"
                    : employee.department}
                </small>
              </span>
            </button>
          ))}
        </div>
        <small className="demo-note">
          The real system will use Unibank Microsoft sign-in.
        </small>
      </section>
    </div>
  );
}

function SignInScreen({
  employees,
  onSelect,
}: {
  employees: Employee[];
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const matches = employees.filter((employee) =>
    `${employee.name} ${employee.email} ${employee.department}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <main className="signin-page">
      <section className="signin-card">
        <div className="signin-brand">
          <span className="brand-mark">U</span>
          <span>
            <strong>UniBook</strong>
            <small>Room reservations</small>
          </span>
        </div>
        <p className="eyebrow">UNIBANK WORKSPACE</p>
        <h1>Welcome back</h1>
        <p className="signin-intro">
          Sign in with your employee account to reserve rooms and view your
          meetings.
        </p>
        <label className="signin-search">
          <span>Employee name or work email</span>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the Address Book"
          />
        </label>
        <div className="signin-results">
          {matches.map((employee) => (
            <button key={employee.id} onClick={() => onSelect(employee.id)}>
              <b>{initials(employee.name)}</b>
              <span>
                <strong>{employee.name}</strong>
                <small>
                  {employee.email} ·{" "}
                  {employee.role === "admin"
                    ? "Administrator"
                    : employee.department}
                </small>
              </span>
              <i>Sign in</i>
            </button>
          ))}
          {matches.length === 0 && <p>No employee found.</p>}
        </div>
        <div className="signin-note">
          <strong>Prototype sign-in</strong>
          <span>
            For the final bank version, this screen will connect to Unibank
            Microsoft accounts. No separate UniBook password will be needed.
          </span>
        </div>
      </section>
    </main>
  );
}

function AdminPanel({
  rooms,
  employees,
  onEdit,
  onAdd,
}: {
  rooms: Room[];
  employees: Employee[];
  onEdit: (room: Room) => void;
  onAdd: () => void;
}) {
  return (
    <section className="content admin-page">
      <div className="heading-row">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>Rooms</h1>
          <p className="subtitle">Manage room availability and access.</p>
        </div>
        <button className="primary-small" onClick={onAdd}>
          + Add room
        </button>
      </div>
      <div className="admin-list">
        {rooms.map((room) => (
          <div
            className={`admin-room ${!room.active ? "inactive-room" : ""}`}
            key={room.id}
          >
            <div>
              <RoomTitle name={room.name} />
              <span>
                {!room.active
                  ? "Removed from calendar"
                  : room.status === "unavailable"
                    ? `Unavailable${room.reason ? ` · ${room.reason}` : ""}`
                    : room.access === "employee"
                      ? `Restricted · ${employees.find((employee) => employee.id === room.allowed_employee_id)?.name ?? "Selected employee"}`
                      : room.access === "department"
                        ? "Restricted · IT Office"
                        : "Available · All workers"}
              </span>
            </div>
            <button onClick={() => onEdit(room)}>Edit</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function RoomEditor({
  room,
  employees,
  onClose,
  onSave,
}: {
  room: Room;
  employees: Employee[];
  onClose: () => void;
  onSave: (values: Record<string, unknown>) => Promise<void>;
}) {
  const [displayLabel, setDisplayLabel] = useState(room.display_label);
  const [roomPhone, setRoomPhone] = useState(room.room_phone);
  const [status, setStatus] = useState(room.status);
  const [reason, setReason] = useState(room.reason ?? "");
  const [access, setAccess] = useState(room.access);
  const [allowed, setAllowed] = useState(
    room.allowed_employee_id ?? "assistant",
  );
  const [active, setActive] = useState(Boolean(room.active));
  return (
    <div className="modal-backdrop">
      <section className="modal admin-form">
        <button className="close-modal" onClick={onClose}>
          ×
        </button>
        <p className="eyebrow">EDIT ROOM</p>
        <RoomTitle name={room.name} as="h2" />
        <label>
          Location
          <input
            value={displayLabel}
            onChange={(event) => setDisplayLabel(event.target.value)}
            placeholder="Available to book"
          />
        </label>
        {room.name.startsWith("Meeting Room ") && (
          <label>
            Room business phone <em>Optional for now</em>
            <input
              value={roomPhone}
              onChange={(event) => setRoomPhone(event.target.value)}
              placeholder="Internal extension"
            />
          </label>
        )}
        <p className="field-help">
          Room business phones are stored separately from employee phone
          numbers.
        </p>
        <label>
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </label>
        {status === "unavailable" && (
          <label>
            Reason <em>Optional</em>
            <input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="For example: Room is under repair"
            />
          </label>
        )}
        <label>
          Who can reserve?
          <select
            value={access}
            onChange={(event) => setAccess(event.target.value)}
          >
            <option value="all">All workers</option>
            <option value="employee">Selected employee</option>
            <option value="department">IT Office</option>
          </select>
        </label>
        {access === "employee" && (
          <label>
            Authorized employee
            <select
              value={allowed}
              onChange={(event) => setAllowed(event.target.value)}
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="switch-line">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
          />
          <span>Show this room in the calendar</span>
        </label>
        <button
          className="reserve-button"
          onClick={() =>
            onSave({
              id: room.id,
              location: room.location,
              displayLabel,
              roomPhone,
              status,
              reason,
              access,
              allowedEmployeeId: access === "employee" ? allowed : null,
              active,
            })
          }
        >
          Save changes
        </button>
      </section>
    </div>
  );
}

function AddRoom({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (values: {
    name: string;
    location: string;
    displayLabel: string;
    roomPhone: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [displayLabel, setDisplayLabel] = useState("Available to book");
  const [roomPhone, setRoomPhone] = useState("");
  return (
    <div className="modal-backdrop">
      <section className="modal admin-form">
        <button className="close-modal" onClick={onClose}>
          ×
        </button>
        <p className="eyebrow">NEW ROOM</p>
        <h2>Add room</h2>
        <p className="form-intro">
          Add the room’s basic information. Access permissions can be changed
          after creation.
        </p>
        <label>
          Room name
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="For example: Meeting Room 9"
          />
        </label>
        <label>
          Location
          <input
            value={displayLabel}
            onChange={(event) => setDisplayLabel(event.target.value)}
            placeholder="Available to book"
          />
        </label>
        {name.trim().startsWith("Meeting Room ") && (
          <label>
            Room business phone <em>Optional for now</em>
            <input
              value={roomPhone}
              onChange={(event) => setRoomPhone(event.target.value)}
              placeholder="Internal extension"
            />
          </label>
        )}
        <p className="field-help">
          Room business phones are kept separate from employee phone numbers.
        </p>
        <button
          disabled={!name.trim() || !displayLabel.trim()}
          className="reserve-button"
          onClick={() =>
            onSave({
              name: name.trim(),
              location: "Main Office",
              displayLabel: displayLabel.trim(),
              roomPhone: roomPhone.trim(),
            })
          }
        >
          Add room
        </button>
      </section>
    </div>
  );
}
