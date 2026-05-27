## Week 4 Reflection

### 1. What is the difference between the SQLAlchemy model and the Pydantic schema? They're both about "Book" but they serve different purposes.
* **SQLAlchemy Model (`models.py`)**: Defines the structure of your data as it is stored in the **Database**. It maps directly to physical database tables, columns, relations, indexes, and primary keys. It is used to fetch, insert, and update records in PostgreSQL.
* **Pydantic Schema (`schemas.py`)**: Defines the structure of your data as it is received or returned by the **API**. It is used for validation, serialization (turning database objects into JSON), and deserialization (validating incoming JSON payloads). For example, `BookCreate` defines what the frontend must send (just `title`, `author`, `status`), while `BookResponse` defines what the API returns (adding the auto-generated `id`).

---

### 2. What does `Depends(get_db)` do? Why does every endpoint need it?
* **What it does**: `Depends(get_db)` is FastAPI's dependency injection system. It calls our `get_db()` generator, which opens a new connection session (`SessionLocal`) from our connection pool, and injects that database session into our endpoint handler function as the `db` parameter.
* **Why it is needed**: Any endpoint that reads from, writes to, or deletes from the database needs a connection to run SQL commands. Once the request finishes, `Depends` handles the cleanup by automatically closing the connection (running the `finally: db.close()` block inside `get_db()`), preventing database connection exhaustion or memory leaks.

---

### 3. When you restarted the server and your data was still there — how does that feel compared to storing data in a Python list? What changed architecturally?
* **How it feels**: It feels incredibly empowering and reliable! In-memory lists are fragile, but having permanent storage means our application is production-ready; a server crash, restart, or update doesn't wipe out the catalog.
* **Architectural changes**:
  * **Decoupled State**: We moved from a **stateful server** (where data was tied to the active running memory of the server process) to a **stateless server** (where the backend API only contains execution logic, and the database holds the state).
  * **Disk Persistence**: Data is written directly to non-volatile disk storage (within the Postgres volume `pgdata`), rather than volatile RAM.
  * **Horizontal Scalability**: Because the backend is now stateless, we could run 10 identical instances of our API behind a load balancer, and they would all safely share the same PostgreSQL database without losing sync.

---

### 4. What was the most confusing part of connecting the frontend to the backend?
* **Managing Network Contexts**: The most confusing part is understanding how origins and networks behave differently inside Docker vs. the browser. Inside the Docker network, the backend connects to the database via its service name `db` (not `localhost`), but the frontend client (running inside the user's browser on the host machine) must connect to the backend via `http://localhost:8000`.

---

### 5. When does CORS become a problem and why? In your own words.
* **When it becomes a problem**: CORS (Cross-Origin Resource Sharing) becomes a problem when a frontend application loaded from one origin (like `http://localhost:3000`) tries to make a fetch/AJAX request to a backend API running on a different origin (like `http://localhost:8000`).
* **Why**: It is a critical browser-enforced security sandbox designed to prevent **Cross-Site Request Forgery (CSRF)**. Without CORS restrictions, a malicious website you open in a browser could secretly make background requests to your online bank or other secure APIs using your active browser session. To protect users, browsers block cross-origin requests by default unless the backend explicitly responds with headers (such as `Access-Control-Allow-Origin`) giving the calling origin permission.

---

### 6. What is the difference between useEffect with [] and without it?
* **With `[]` (Empty dependency array)**: The side-effect function runs **exactly once** after the component's initial mount (rendering). This is ideal for initial data fetching (like loading books on page load).
* **Without dependency array (no array at all)**: The side-effect function runs **after every single render** of the component. If the effect updates any state (e.g. calling `setBooks`), it triggers a re-render, which runs the effect again, leading to an **infinite rendering loop** that crashes the browser.
