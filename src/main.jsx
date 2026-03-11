const { useState, useEffect } = React;

// Checkbox 
function Checkbox({ checked, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={`checkbox-ring ${checked ? "checked" : "unchecked"}`}
    >
      {checked ? "✓" : ""}
    </div>
  );
}

// TaskItem 
function TaskItem({ task, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  function saveEdit() {
    const val = editText.trim();
    if (val) onEdit(val);
    setEditing(false);
  }

  return (
    <div className="task-item inner-glass flex items-center gap-3 px-4 py-3 rounded-xl">
      <Checkbox checked={task.done} onToggle={onToggle} />

      {editing ? (
        <input
          autoFocus
          className="task-input flex-1 text-sm rounded-lg px-2 py-1"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveEdit();
            if (e.key === "Escape") setEditing(false);
          }}
          onBlur={saveEdit}
        />
      ) : (
        <span
          onDoubleClick={() => { setEditing(true); setEditText(task.text); }}
          title="Double-click to edit"
          className={`flex-1 text-sm cursor-default select-none ${task.done ? "done-text line-through" : "task-text"
            }`}
        >
          {task.text}
        </span>
      )}

      {!editing && (
        <div className="task-actions flex gap-1">
          <button
            onClick={() => { setEditing(true); setEditText(task.text); }}
            className="edit-btn w-7 h-7 rounded-lg flex items-center justify-center text-xs"
            title="Edit"
          >✏️</button>
          <button
            onClick={onDelete}
            className="del-btn w-7 h-7 rounded-lg flex items-center justify-center text-xs"
            title="Delete"
          >🗑️</button>
        </div>
      )}
    </div>
  );
}

// App 
function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("tasks") || "[]");
      return saved.map(t => ({
        id: t.id || Date.now() + Math.random(),
        text: t.text || t.name || "",
        done: t.done || t.completed || false
      }));
    } catch { return []; }
  });

  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") !== "light"
  );
  const [filter, setFilter] = useState("All");
  const [input, setInput] = useState("");

  useEffect(() => {
    document.body.classList.toggle("dark", isDark);
    document.body.classList.toggle("light", !isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  function addTask() {
    const text = input.trim();
    if (!text) return;
    setTasks(prev => [{ id: Date.now(), text, done: false }, ...prev]);
    setInput("");
  }

  function toggleTask(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function editTask(id, newText) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, text: newText } : t));
  }

  function clearCompleted() {
    setTasks(prev => prev.filter(t => !t.done));
  }

  const FILTERS = ["All", "Active", "Completed"];

  const filtered = tasks.filter(t =>
    filter === "All" ? true : filter === "Active" ? !t.done : t.done
  );

  const remaining = tasks.filter(t => !t.done).length;

  return (
    <div className="main-card w-full w-[470px] rounded-3xl shadow-2xl p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="title-text text-3xl font-bold tracking-tight">✦ My Tasks</h1>
          <p className="sub-text text-xs mt-0.5">
            {remaining} task{remaining !== 1 ? "s" : ""} remaining
          </p>
        </div>
        <button
          onClick={() => setIsDark(d => !d)}
          className="theme-btn inner-glass w-10 h-10 rounded-full flex items-center justify-center text-lg shadow"
        >
          {isDark ? "🌞" : "🌙"}
        </button>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="task-input flex-1 rounded-xl px-4 py-3 text-base"
          placeholder="Add a new task..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addTask()}
        />
        <button
          onClick={addTask}
          className="add-btn bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl text-base font-semibold shadow"
        >
          Add
        </button>
      </div>

      {/* Filters */}
      <div className="inner-glass flex gap-1 p-1 rounded-xl">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`filter-btn flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${filter === f ? "bg-indigo-500 text-white shadow" : "filter-inactive"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="task-list space-y-3 max-h-96 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="empty-text text-center text-sm py-8">
            {filter === "Completed"
              ? "No completed tasks yet 🎯"
              : "Nothing to do! Add a task ✨"}
          </p>
        ) : (
          filtered.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id)}
              onDelete={() => deleteTask(task.id)}
              onEdit={newText => editTask(task.id, newText)}
            />
          ))
        )}
      </div>

      {/* Clear Completed */}
      {tasks.some(t => t.done) && (
        <button
          onClick={clearCompleted}
          className="clear-btn w-full py-2 rounded-xl text-xs font-medium transition"
        >
          🧹 Clear completed
        </button>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);