"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SignInScreen } from "./components/SignInScreen";
import { AdminPanel, RoomEditor, AddRoom } from "./components/AdminRooms";
import { AddressBook } from "./components/AddressBook";

type Employee = {
  id: string;
  name: string;
  title: string;
  phone: string;
  location: string;
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
  guest_visit?: number;
  guest_message?: string | null;
  notification_status?: string;
  recipient_ids?: string[];
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
    email: "aysu@example.com",
    company: "Demo Company",
    alias: "aysu",
    department: "Business",
    role: "employee",
  },
  {
    id: "assistant",
    name: "Parvana Salimova",
    title: "Executive Assistant",
    phone: "1002",
    location: "Head Office",
    email: "parvana.salimova@example.com",
    company: "Demo Company",
    alias: "parvana.salimova",
    department: "Executive Office",
    role: "employee",
  },
  {
    id: "specialist",
    name: "Lyaman Alizade",
    title: "Human Resources Specialist",
    phone: "1003",
    location: "Head Office",
    email: "lyaman.alizade@example.com",
    company: "Demo Company",
    alias: "lyaman.alizade",
    department: "Human Resources",
    role: "employee",
  },
  {
    id: "it",
    name: "Jafar Mammadzada",
    title: "IT Specialist",
    phone: "1004",
    location: "IT Office",
    email: "jafar.mammadzada@example.com",
    company: "Demo Company",
    alias: "jafar.mammadzada",
    department: "IT Office",
    role: "employee",
  },
  {
    id: "product",
    name: "Ethan Brooks",
    title: "Product Owner",
    phone: "1005",
    location: "Head Office",
    email: "ethan@example.com",
    company: "Demo Company",
    alias: "ethan.brooks",
    department: "Digital Banking",
    role: "employee",
  },
  {
    id: "lead",
    name: "Ismayil Huseynzade",
    title: "Risk Specialist",
    phone: "1006",
    location: "Head Office",
    email: "ismayil.huseynzade@example.com",
    company: "Demo Company",
    alias: "ismayil.huseynzade",
    department: "Risk",
    role: "employee",
  },
  {
    id: "admin",
    name: "Parvana Aghayeva",
    title: "Office Administrator",
    phone: "1000",
    location: "Head Office",
    email: "parvana.aghayeva@example.com",
    company: "Demo Company",
    alias: "parvana.aghayeva",
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
  "Meeting Room 9",
  "Training Room",
  "Planning Zone",
  "Synergy Room",
  "Vision Room",
  "Agile Arena",
  "Idea Space",
];
const roomPhones: Record<string, string> = {
  "Meeting Room 3": "3232",
  "Meeting Room 5": "2655",
  "Meeting Room 8": "2800",
  "Meeting Room 9": "2699",
};
const fallbackRooms: Room[] = roomNames.map((name, index) => ({
  id: index + 1,
  name,
  location: "Main Office",
  display_label: index > 5 ? "IT Office" : "Available to book",
  room_phone: roomPhones[name] ?? "",
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
const BASE_WEEK_START = new Date("2026-07-20T12:00:00");
const weekStart = (offset: number) => {
  const date = new Date(BASE_WEEK_START);
  date.setDate(date.getDate() + offset * 7);
  return date;
};
const weekDays = (offset: number) =>
  Array.from({ length: 6 }, (_, index) => {
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
  const [signedIn, setSignedIn] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [week, setWeek] = useState(0);
  const [day, setDay] = useState(0);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(
    new Date(2026, 6, 1, 12),
  );
  const [profileMenu, setProfileMenu] = useState(false);
  const [demoLogin, setDemoLogin] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    room: Room;
    start: number;
  } | null>(null);
  const [end, setEnd] = useState(10);
  const [reservedFor, setReservedFor] = useState("aysu");
  const [guestVisit, setGuestVisit] = useState(false);
  const [guestMessage, setGuestMessage] = useState("");
  const [recipientIds, setRecipientIds] = useState<string[]>([]);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [adminRoom, setAdminRoom] = useState<Room | null>(null);
  const [addRoom, setAddRoom] = useState(false);
  const optimisticId = useRef(-1);

  const currentUser =
    data.employees.find((employee) => employee.id === currentUserId) ??
    data.employees[0];
  const days = weekDays(week);
  const selectedDate = days[day].iso;
  const isAdmin = currentUser?.role === "admin";

  function goToDate(date: Date) {
    const dayFromMonday = (date.getDay() + 6) % 7;
    if (dayFromMonday > 5) return;
    const monday = new Date(date);
    monday.setDate(date.getDate() - dayFromMonday);
    const weekOffset = Math.round(
      (monday.getTime() - BASE_WEEK_START.getTime()) /
        (7 * 24 * 60 * 60 * 1000),
    );
    setWeek(weekOffset);
    setDay(dayFromMonday);
    setPickerMonth(new Date(date.getFullYear(), date.getMonth(), 1, 12));
    setDatePickerOpen(false);
  }

  async function refresh() {
    try {
      const response = await fetch("/api/state", { cache: "no-store" });
      if (response.ok) setData(await response.json());
    } catch {
      /* local visual fallback */
    }
  }
  useEffect(() => {
    void fetch("/api/state", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((state: State | null) => state && setData(state))
      .catch(() => {
        /* keep the local visual fallback */
      });
    void fetch("/api/session", { cache: "no-store" })
      .then((response) => response.json() as Promise<{ userId: string | null }>)
      .then(({ userId }) => {
        if (userId) {
          setCurrentUserId(userId);
          setReservedFor(userId);
          setSignedIn(true);
        }
      })
      .finally(() => setSessionReady(true));
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
  function hasAccess(room: Room) {
    if (room.name === "Meeting Room 8")
      return (
        room.access === "employee" &&
        room.allowed_employee_id === currentUser.id
      );
    if (isAdmin) return true;
    if (currentUser.department === "IT Office")
      return room.access === "department";
    if (room.access === "all") return true;
    if (room.access === "employee")
      return room.allowed_employee_id === currentUser.id;
    return false;
  }

  function chooseSlot(room: Room, start: number) {
    if (page === "mine") return;
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
    setGuestVisit(false);
    setGuestMessage("");
    setRecipientIds([]);
    setRecipientSearch("");
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
    const temporaryId = optimisticId.current;
    optimisticId.current -= 1;
    const optimisticBooking: Booking = {
      id: temporaryId,
      room_id: selectedSlot.room.id,
      date: selectedDate,
      start: selectedSlot.start,
      end,
      employee_id: reservedFor,
      created_by: currentUser.id,
      guest_visit: guestVisit ? 1 : 0,
      guest_message: guestVisit ? guestMessage.trim() || null : null,
      notification_status: guestVisit ? "demo_ready" : "not_required",
      recipient_ids: recipientIds,
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
          guestVisit,
          guestMessage: guestVisit ? guestMessage.trim() : "",
          recipientIds,
        },
        false,
      );
      if (result.booking)
        setData((current) => ({
          ...current,
          bookings: current.bookings.map((booking) =>
            booking.id === temporaryId ? (result.booking as Booking) : booking,
          ),
        }));
    } catch (caught) {
      setData((current) => ({
        ...current,
        bookings: current.bookings.filter(
          (booking) => booking.id !== temporaryId,
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
      await api({ action: "cancel", id });
      setSelectedBooking(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to cancel.");
    }
  }

  function openBooking(booking: Booking, employee?: Employee) {
    const belongsToCurrentUser =
      booking.employee_id === currentUser.id ||
      booking.created_by === currentUser.id;
    if (belongsToCurrentUser) {
      setSelectedBooking(booking);
      return;
    }
    if (employee) setSelectedEmployee(employee);
  }

  async function switchUser(id: string) {
    const response = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: id }),
    });
    if (!response.ok) {
      setError("Unable to start this demo session.");
      return;
    }
    setCurrentUserId(id);
    setReservedFor(id);
    setSignedIn(true);
    setDemoLogin(false);
    setProfileMenu(false);
    setPage("calendar");
  }

  async function logOut() {
    await fetch("/api/session", { method: "DELETE" });
    setSignedIn(false);
    setProfileMenu(false);
    setSelectedEmployee(null);
    setSelectedSlot(null);
    setDemoLogin(false);
    setPage("calendar");
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
      await api({ action: "room", ...values }, false);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to save room.",
      );
      await refresh();
    }
  }

  async function removeRoom(room: Room) {
    const confirmed = window.confirm(
      `Remove ${room.name} from the reservation calendar? Its booking history will be kept.`,
    );
    if (!confirmed) return;

    setData((current) => ({
      ...current,
      rooms: current.rooms.map((currentRoom) =>
        currentRoom.id === room.id
          ? { ...currentRoom, active: 0 }
          : currentRoom,
      ),
    }));
    try {
      await api({ action: "removeRoom", id: room.id }, false);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to remove room.",
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
      const result = await api({ action: "room", ...values }, false);
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
  const finish = days[5];
  const weekLabel = `${start.date}–${finish.date} ${weekStart(week).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`;

  if (!sessionReady)
    return <main className="signin-page" aria-label="Loading UniBook" />;

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
            aria-expanded={profileMenu}
            aria-haspopup="menu"
          >
            <strong>{currentUser.name}</strong>
            <span>{initials(currentUser.name)}</span>
            <b>⌄</b>
          </button>
          {profileMenu && (
            <div className="profile-menu" role="menu">
              <button
                role="menuitem"
                onClick={() => {
                  setSelectedEmployee(currentUser);
                  setProfileMenu(false);
                }}
              >
                My profile
              </button>
              <hr role="separator" />
              <button
                role="menuitem"
                onClick={() => {
                  setDemoLogin(true);
                  setProfileMenu(false);
                }}
              >
                Switch demo account
              </button>
              <button className="logout" role="menuitem" onClick={logOut}>
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
              <div className="date-navigator">
                <button
                  className="date-range-button"
                  onClick={() => {
                    if (!datePickerOpen) {
                      const currentDate = new Date(`${selectedDate}T12:00:00`);
                      setPickerMonth(
                        new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          1,
                          12,
                        ),
                      );
                    }
                    setDatePickerOpen(!datePickerOpen);
                  }}
                  aria-expanded={datePickerOpen}
                  aria-haspopup="dialog"
                >
                  <span className="calendar-outline-icon" aria-hidden="true" />
                  <strong>{weekLabel}</strong>
                  <span className="dropdown-chevron" aria-hidden="true" />
                </button>
                {datePickerOpen && (
                  <DatePicker
                    month={pickerMonth}
                    selectedDate={selectedDate}
                    onMonthChange={setPickerMonth}
                    onSelect={goToDate}
                    onClose={() => setDatePickerOpen(false)}
                  />
                )}
              </div>
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
                  const today = new Date();
                  today.setHours(12, 0, 0, 0);
                  if (today.getDay() === 0) today.setDate(today.getDate() + 1);
                  goToDate(today);
                }}
              >
                Today
              </button>
            </div>
          </div>
          <div
            className="day-tabs"
            role="tablist"
            aria-label="Monday to Saturday"
          >
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
                          {!access
                            ? "Restricted Room"
                            : room.name.startsWith("Meeting Room ")
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
                        className={`slots ${page === "mine" ? "view-only" : ""} ${room.status !== "available" ? "is-closed" : ""} ${!access ? "is-restricted" : ""} ${room.access === "employee" && !access ? "ceo-restricted" : ""}`}
                      >
                        {times.slice(0, -1).map((time) => (
                          <button
                            className="empty-slot"
                            key={time}
                            onClick={() => chooseSlot(room, time)}
                            disabled={page === "mine"}
                            aria-label={
                              page === "mine"
                                ? `${room.name}, ${formatTime(time)}, view only`
                                : `${room.name}, ${formatTime(time)}`
                            }
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
                                onClick={() => openBooking(booking, employee)}
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
        </section>
      )}

      {page === "address" && (
        <AddressBook
          employees={data.employees}
          search={search}
          onSearch={setSearch}
          onSelect={setSelectedEmployee}
        />
      )}

      {page === "admin" && isAdmin && (
        <AdminPanel
          rooms={data.rooms}
          employees={data.employees}
          onEdit={setAdminRoom}
          onRemove={removeRoom}
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
              aria-label="Close reservation form"
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
            <div className={`guest-option ${guestVisit ? "selected" : ""}`}>
              <label className="guest-toggle">
                <input
                  type="checkbox"
                  checked={guestVisit}
                  onChange={(event) => setGuestVisit(event.target.checked)}
                />
                <span>
                  <strong>A guest will attend this meeting</strong>
                  <small>Notify Sharafat Aliyeva about the guest visit</small>
                </span>
              </label>
              {guestVisit && (
                <div className="guest-details">
                  <label>
                    Message for Sharafat Aliyeva <em>Optional</em>
                    <textarea
                      value={guestMessage}
                      maxLength={1000}
                      rows={4}
                      placeholder="Add the guest's name, company, and any reception instructions."
                      onChange={(event) => setGuestMessage(event.target.value)}
                    />
                  </label>
                  <p>
                    UniBook will include the room, date, time, organizer, and
                    this message in the email to Sharafat Aliyeva.
                  </p>
                </div>
              )}
            </div>
            <div className="recipient-option">
              <div className="recipient-heading">
                <span>
                  <strong>Share meeting information</strong>
                  <small>Optional · choose one or more workers</small>
                </span>
                {recipientIds.length > 0 && (
                  <b>{recipientIds.length} selected</b>
                )}
              </div>
              {recipientIds.length > 0 && (
                <div className="recipient-chips">
                  {recipientIds.map((id) => {
                    const employee = employeeMap.get(id);
                    return (
                      <button
                        type="button"
                        key={id}
                        onClick={() =>
                          setRecipientIds((current) =>
                            current.filter((recipientId) => recipientId !== id),
                          )
                        }
                        aria-label={`Remove ${employee?.name ?? "recipient"}`}
                      >
                        <span>{initials(employee?.name ?? "")}</span>
                        {employee?.name}
                        <b aria-hidden="true">×</b>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="recipient-search">
                <span aria-hidden="true">⌕</span>
                <input
                  value={recipientSearch}
                  onChange={(event) => setRecipientSearch(event.target.value)}
                  placeholder="Search workers by name or department"
                  aria-label="Search workers to share meeting information"
                />
              </div>
              {recipientSearch.trim() && (
                <div className="recipient-results">
                  {data.employees
                    .filter(
                      (employee) =>
                        employee.id !== currentUser.id &&
                        employee.id !== reservedFor &&
                        !recipientIds.includes(employee.id) &&
                        `${employee.name} ${employee.department}`
                          .toLowerCase()
                          .includes(recipientSearch.trim().toLowerCase()),
                    )
                    .slice(0, 6)
                    .map((employee) => (
                      <button
                        type="button"
                        key={employee.id}
                        onClick={() => {
                          setRecipientIds((current) => [
                            ...current,
                            employee.id,
                          ]);
                          setRecipientSearch("");
                        }}
                      >
                        <span className="recipient-avatar">
                          {initials(employee.name)}
                        </span>
                        <span>
                          <strong>{employee.name}</strong>
                          <small>{employee.department}</small>
                        </span>
                        <b>＋</b>
                      </button>
                    ))}
                </div>
              )}
              <p>
                UniBook will prepare the room, date, time, and organizer details
                for the selected workers. Real email delivery will be connected
                by the IT Office later.
              </p>
            </div>
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
      {selectedBooking && (
        <ReservationDetails
          booking={selectedBooking}
          room={data.rooms.find(
            (room) => room.id === selectedBooking.room_id,
          )}
          reservedFor={employeeMap.get(selectedBooking.employee_id)}
          organizer={employeeMap.get(selectedBooking.created_by)}
          recipients={(selectedBooking.recipient_ids ?? [])
            .map((id) => employeeMap.get(id))
            .filter((employee): employee is Employee => Boolean(employee))}
          onClose={() => setSelectedBooking(null)}
          onCancel={() => {
            if (
              window.confirm(
                "Cancel this reservation? The room will become available for other workers.",
              )
            )
              void cancelBooking(selectedBooking.id);
          }}
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

function DatePicker({
  month,
  selectedDate,
  onMonthChange,
  onSelect,
  onClose,
}: {
  month: Date;
  selectedDate: string;
  onMonthChange: (month: Date) => void;
  onSelect: (date: Date) => void;
  onClose: () => void;
}) {
  const firstDayOffset = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const cells = Array.from(
    { length: firstDayOffset + daysInMonth },
    (_, index) => {
      const dateNumber = index - firstDayOffset + 1;
      return dateNumber > 0 ? dateNumber : null;
    },
  );
  while (cells.length % 7) cells.push(null);

  return (
    <div className="date-picker" role="dialog" aria-label="Choose a date">
      <div className="date-picker-header">
        <button
          onClick={() =>
            onMonthChange(
              new Date(month.getFullYear(), month.getMonth() - 1, 1, 12),
            )
          }
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="month-year-selectors">
          <span className="select-shell">
            <select
              value={month.getMonth()}
              onChange={(event) =>
                onMonthChange(
                  new Date(
                    month.getFullYear(),
                    Number(event.target.value),
                    1,
                    12,
                  ),
                )
              }
              aria-label="Choose month"
            >
              {Array.from({ length: 12 }, (_, monthIndex) => (
                <option key={monthIndex} value={monthIndex}>
                  {new Date(2026, monthIndex, 1).toLocaleDateString("en-GB", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
            <span className="dropdown-chevron" aria-hidden="true" />
          </span>
          <span className="select-shell">
            <select
              value={month.getFullYear()}
              onChange={(event) =>
                onMonthChange(
                  new Date(
                    Number(event.target.value),
                    month.getMonth(),
                    1,
                    12,
                  ),
                )
              }
              aria-label="Choose year"
            >
              {Array.from(
                { length: 21 },
                (_, index) => month.getFullYear() - 10 + index,
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <span className="dropdown-chevron" aria-hidden="true" />
          </span>
        </div>
        <button
          onClick={() =>
            onMonthChange(
              new Date(month.getFullYear(), month.getMonth() + 1, 1, 12),
            )
          }
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <div className="date-picker-weekdays" aria-hidden="true">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((weekday, index) => (
          <span key={`${weekday}-${index}`}>{weekday}</span>
        ))}
      </div>
      <div className="date-picker-grid">
        {cells.map((dateNumber, index) => {
          if (!dateNumber)
            return <span key={`empty-${index}`} aria-hidden="true" />;
          const date = new Date(
            month.getFullYear(),
            month.getMonth(),
            dateNumber,
            12,
          );
          const dateIso = iso(date);
          const isSunday = date.getDay() === 0;
          return (
            <button
              key={dateIso}
              className={dateIso === selectedDate ? "selected-date" : ""}
              disabled={isSunday}
              onClick={() => onSelect(date)}
              aria-label={date.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            >
              {dateNumber}
            </button>
          );
        })}
      </div>
      <button className="close-date-picker" onClick={onClose}>
        Close
      </button>
    </div>
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
        <button
          className="close-modal"
          aria-label="Close profile"
          onClick={onClose}
        >
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

function ReservationDetails({
  booking,
  room,
  reservedFor,
  organizer,
  recipients,
  onClose,
  onCancel,
}: {
  booking: Booking;
  room?: Room;
  reservedFor?: Employee;
  organizer?: Employee;
  recipients: Employee[];
  onClose: () => void;
  onCancel: () => void;
}) {
  const dateLabel = new Date(`${booking.date}T12:00:00`).toLocaleDateString(
    "en-GB",
    { weekday: "long", day: "numeric", month: "long" },
  );
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className="modal reservation-details" role="dialog" aria-modal="true">
        <button
          className="close-modal"
          aria-label="Close reservation details"
          onClick={onClose}
        >
          ×
        </button>
        <div className="reservation-details-icon" aria-hidden="true">✓</div>
        <p className="eyebrow">YOUR RESERVATION</p>
        <h2>{room?.name ?? "Meeting room"}</h2>
        <div className="reservation-detail-grid">
          <div>
            <span>Date</span>
            <strong>{dateLabel}</strong>
          </div>
          <div>
            <span>Time</span>
            <strong>
              {formatTime(booking.start)}–{formatTime(booking.end)}
            </strong>
          </div>
          <div>
            <span>Reserved for</span>
            <strong>{reservedFor?.name ?? "Employee"}</strong>
          </div>
          <div>
            <span>Organizer</span>
            <strong>{organizer?.name ?? "Employee"}</strong>
          </div>
        </div>
        {recipients.length > 0 && (
          <div className="reservation-detail-section">
            <span>Meeting information shared with</span>
            <div className="reservation-recipient-list">
              {recipients.map((employee) => (
                <b key={employee.id}>{employee.name}</b>
              ))}
            </div>
          </div>
        )}
        {booking.guest_visit === 1 && (
          <div className="reservation-detail-section guest-detail-summary">
            <span>Guest visit</span>
            <strong>Reception notification prepared</strong>
            {booking.guest_message && <p>{booking.guest_message}</p>}
          </div>
        )}
        <div className="reservation-detail-actions">
          <button className="secondary-button" onClick={onClose}>
            Close
          </button>
          <button className="cancel-reservation-button" onClick={onCancel}>
            Cancel reservation
          </button>
        </div>
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
        <button
          className="close-modal"
          aria-label="Close account switcher"
          onClick={onClose}
        >
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
          The real system will use Demo Company Microsoft sign-in.
        </small>
      </section>
    </div>
  );
}
