"use client";

import { useState } from "react";

type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

export function SignInScreen({
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
