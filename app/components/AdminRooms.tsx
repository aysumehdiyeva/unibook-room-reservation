"use client";

import { useState } from "react";

type Employee = { id: string; name: string };
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
const RoomTitle = ({
  name,
  as: Tag = "strong",
}: {
  name: string;
  as?: "strong" | "h2";
}) => <Tag>{name}</Tag>;

export function AdminPanel({
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

export function RoomEditor({
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
  const [allowed, setAllowed] = useState(room.allowed_employee_id ?? "parvana");
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

export function AddRoom({
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
