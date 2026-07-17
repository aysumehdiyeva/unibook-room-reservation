type Employee = {
  id: string;
  name: string;
  title: string;
  phone: string;
  location: string;
  department: string;
  email: string;
  company: string;
  alias: string;
  description: string;
  role: string;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

export function AddressBook({
  employees,
  search,
  onSearch,
  onSelect,
}: {
  employees: Employee[];
  search: string;
  onSearch: (value: string) => void;
  onSelect: (employee: Employee) => void;
}) {
  const filteredEmployees = employees.filter((employee) =>
    `${employee.name} ${employee.title} ${employee.phone} ${employee.location} ${employee.department} ${employee.email} ${employee.company} ${employee.alias}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
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
          onChange={(event) => onSearch(event.target.value)}
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
            onClick={() => onSelect(employee)}
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
  );
}
