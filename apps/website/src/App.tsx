import {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
    type PointerEvent,
    type SubmitEvent,
} from 'react';

import { Button, Checkbox, ConfirmDialog, Select, TextInput } from '@todo/ui';

type Todo = {
    id: string;
    title: string;
    done: boolean;
    createdAt: number;
};

type SortMode = 'manual' | 'title' | 'date';
type ThemePreference = 'light' | 'dark' | 'system';

const TODOS_STORAGE_KEY = 'todo-app.todos.v1';
const THEME_STORAGE_KEY = 'todo-app.theme.v1';
function isTodoList(value: unknown): value is Todo[] {
    return (
        Array.isArray(value) &&
        value.every(
            (item) =>
                typeof item === 'object' &&
                item !== null &&
                typeof item.id === 'string' &&
                typeof item.title === 'string' &&
                typeof item.done === 'boolean' &&
                typeof item.createdAt === 'number',
        )
    );
}

function loadTodos(): { todos: Todo[]; error: string | null } {
    try {
        const stored = window.localStorage.getItem(TODOS_STORAGE_KEY);
        if (stored === null) {
            return { todos: [], error: null };
        }
        const parsed: unknown = JSON.parse(stored);
        if (!isTodoList(parsed)) {
            throw new Error('Saved todo data has an unexpected format.');
        }
        return { todos: parsed, error: null };
    } catch (error) {
        console.error('Unable to load saved todos.', error);
        return {
            todos: [],
            error: 'Your saved tasks could not be loaded. Changes may not be saved in this browser.',
        };
    }
}

function loadTheme(): { theme: ThemePreference; error: string | null } {
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        return {
            theme: stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system',
            error: null,
        };
    } catch (error) {
        console.error('Unable to load saved theme preference.', error);
        return { theme: 'system', error: 'Your appearance preference could not be loaded.' };
    }
}

function App() {
    const [storedTodos] = useState(loadTodos);
    const [storedTheme] = useState(loadTheme);
    const [todos, setTodos] = useState(storedTodos.todos);
    const [theme, setTheme] = useState<ThemePreference>(storedTheme.theme);
    const [sortMode, setSortMode] = useState<SortMode>('manual');
    const [newTitle, setNewTitle] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [storageError, setStorageError] = useState(storedTodos.error);
    const [themeError, setThemeError] = useState(storedTheme.error);
    const [showCompleted, setShowCompleted] = useState(true);
    const cancelEditOnBlur = useRef(false);
    const previousTodoPositions = useRef(new Map<string, number>());

    useEffect(() => {
        if (todos === storedTodos.todos) {
            return;
        }
        try {
            window.localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
            setStorageError(null);
        } catch (error) {
            console.error('Unable to save todos.', error);
            setStorageError('Your changes could not be saved in this browser.');
        }
    }, [todos]);

    useEffect(() => {
        if (theme === storedTheme.theme) {
            return;
        }
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, theme);
            setThemeError(null);
        } catch (error) {
            console.error('Unable to save theme preference.', error);
            setThemeError('Your appearance preference could not be saved in this browser.');
        }
    }, [storedTheme.theme, theme]);

    useEffect(() => {
        const root = document.documentElement;
        root.dataset.theme = theme;
        root.style.colorScheme = theme === 'system' ? 'light dark' : theme;
    }, [theme]);

    useLayoutEffect(() => {
        const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-todo-id]'));
        const currentPositions = new Map<string, number>();
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        rows.forEach((row) => {
            const id = row.dataset.todoId;
            if (!id) {
                return;
            }
            const top = row.offsetTop;
            const previousTop = previousTodoPositions.current.get(id);
            if (
                previousTop !== undefined &&
                previousTop !== top &&
                !reduceMotion &&
                typeof row.animate === 'function'
            ) {
                row.animate(
                    [{ transform: `translateY(${previousTop - top}px)` }, { transform: 'translateY(0)' }],
                    { duration: 180, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
                );
            }
            currentPositions.set(id, top);
        });

        previousTodoPositions.current = currentPositions;
    });

    const activeTodos = useMemo(() => {
        const active = todos.filter((todo) => !todo.done);
        if (sortMode === 'title') {
            return active.sort((a, b) => a.title.localeCompare(b.title));
        }
        if (sortMode === 'date') {
            return active.sort((a, b) => b.createdAt - a.createdAt);
        }
        return active;
    }, [sortMode, todos]);
    const completedTodos = useMemo(
        () => todos.filter((todo) => todo.done).sort((a, b) => b.createdAt - a.createdAt),
        [todos],
    );

    function addTodo(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const title = newTitle.trim();
        if (!title) {
            return;
        }
        setTodos((current) => [
            ...current,
            { id: crypto.randomUUID(), title, done: false, createdAt: Date.now() },
        ]);
        setNewTitle('');
        setSortMode('manual');
    }

    function toggleTodo(id: string) {
        const title = editingId === id ? editingTitle.trim() : undefined;
        setTodos((current) =>
            current.map((todo) =>
                todo.id === id
                    ? { ...todo, ...(title ? { title } : {}), done: !todo.done }
                    : todo,
            ),
        );
        if (editingId === id) {
            setEditingId(null);
            setEditingTitle('');
        }
    }

    function startEditing(todo: Todo) {
        cancelEditOnBlur.current = false;
        setEditingId(todo.id);
        setEditingTitle(todo.title);
    }

    function saveEdit(id: string) {
        const title = editingTitle.trim();
        if (title) {
            setTodos((current) => current.map((todo) => (todo.id === id ? { ...todo, title } : todo)));
        }
        setEditingId(null);
        setEditingTitle('');
    }

    function renderEditor(todo: Todo) {
        return (
            <TextInput
                className="edit-input"
                aria-label="Edit task title"
                autoFocus
                value={editingTitle}
                maxLength={200}
                onChange={(event) => setEditingTitle(event.target.value)}
                onBlur={() => {
                    if (cancelEditOnBlur.current) {
                        cancelEditOnBlur.current = false;
                        return;
                    }
                    saveEdit(todo.id);
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        saveEdit(todo.id);
                    } else if (event.key === 'Escape') {
                        cancelEditOnBlur.current = true;
                        setEditingId(null);
                        setEditingTitle('');
                    }
                }}
            />
        );
    }

    function deleteTodo() {
        if (deletingTodo) {
            setTodos((current) => current.filter((todo) => todo.id !== deletingTodo.id));
            if (editingId === deletingTodo.id) {
                setEditingId(null);
                setEditingTitle('');
            }
            setDeletingTodo(null);
        }
    }

    function moveTodo(fromId: string, toId: string) {
        if (fromId === toId) {
            return;
        }
        setTodos((current) => {
            const active = current.filter((todo) => !todo.done);
            const completed = current.filter((todo) => todo.done);
            const fromIndex = active.findIndex((todo) => todo.id === fromId);
            const toIndex = active.findIndex((todo) => todo.id === toId);
            if (fromIndex < 0 || toIndex < 0) {
                return current;
            }
            const [moved] = active.splice(fromIndex, 1);
            active.splice(toIndex, 0, moved);
            return [...active, ...completed];
        });
    }

    function handleDragPointerDown(event: PointerEvent<HTMLButtonElement>, todoId: string) {
        if (sortMode !== 'manual' || event.button !== 0) {
            return;
        }
        event.currentTarget.setPointerCapture(event.pointerId);
        setDraggingId(todoId);
    }

    function handleDragPointerMove(event: PointerEvent<HTMLButtonElement>, todoId: string) {
        if (draggingId !== todoId || sortMode !== 'manual') {
            return;
        }
        const target = document
            .elementFromPoint(event.clientX, event.clientY)
            ?.closest<HTMLElement>('[data-todo-id]');
        const targetId = target?.dataset.todoId;
        if (targetId && targetId !== todoId) {
            moveTodo(todoId, targetId);
        }
    }

    function handleDragKeyDown(event: KeyboardEvent<HTMLButtonElement>, todoId: string) {
        if (sortMode !== 'manual' || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) {
            return;
        }
        event.preventDefault();
        const index = activeTodos.findIndex((todo) => todo.id === todoId);
        const target = activeTodos[index + (event.key === 'ArrowUp' ? -1 : 1)];
        if (target) {
            moveTodo(todoId, target.id);
        }
    }

    return (
        <main className="app-shell">
            <header className="topbar">
                <a className="brand" href="/" aria-label="Daymark home">
                    <span className="brand-mark" aria-hidden="true">
                        <span />
                    </span>
                    <span>daymark</span>
                </a>
                <div className="theme-control" aria-label="Color theme">
                    <span className="theme-label">Appearance</span>
                    <Select
                        aria-label="Choose appearance"
                        value={theme}
                        onChange={(event) => setTheme(event.target.value as ThemePreference)}
                        className="theme-select"
                    >
                        <option value="system">System</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </Select>
                </div>
            </header>

            <section className="todo-page" aria-labelledby="page-title">
                <div className="page-heading">
                    <div>
                        <p className="eyebrow">A little progress, every day</p>
                        <h1 id="page-title">My tasks</h1>
                        <p className="page-subtitle">
                            {activeTodos.length === 0
                                ? 'You’re all caught up. Enjoy the breathing room.'
                                : `${activeTodos.length} ${activeTodos.length === 1 ? 'task' : 'tasks'} to focus on`}
                        </p>
                    </div>
                    <span className="date-chip">
                        {new Intl.DateTimeFormat(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                        }).format(new Date())}
                    </span>
                </div>

                {(storageError || themeError) && (
                    <p className="storage-notice" role="status">
                        {storageError || themeError}
                    </p>
                )}

                <form className="add-form" onSubmit={addTodo}>
                    <span className="add-plus" aria-hidden="true">+</span>
                    <TextInput
                        aria-label="New task"
                        placeholder="Add a task"
                        value={newTitle}
                        maxLength={200}
                        onChange={(event) => setNewTitle(event.target.value)}
                    />
                    <Button type="submit" disabled={!newTitle.trim()}>
                        Add task
                    </Button>
                </form>

                <div className="list-toolbar">
                    <div className="section-title">
                        <h2>To do</h2>
                        <span className="count-badge">{activeTodos.length}</span>
                    </div>
                    <label className="sort-control">
                        <span>Sort by</span>
                        <Select
                            aria-label="Sort tasks"
                            value={sortMode}
                            onChange={(event) => setSortMode(event.target.value as SortMode)}
                        >
                            <option value="manual">My order</option>
                            <option value="date">Newest first</option>
                            <option value="title">Title</option>
                        </Select>
                    </label>
                </div>

                <div className={`todo-list ${sortMode === 'manual' ? 'is-manual' : ''}`}>
                    {activeTodos.length ? (
                        activeTodos.map((todo) => (
                            <article
                                className={`todo-row ${draggingId === todo.id ? 'is-dragging' : ''}`}
                                key={todo.id}
                                data-todo-id={todo.id}
                            >
                                {sortMode === 'manual' && (
                                    <button
                                        className="drag-handle"
                                        type="button"
                                        aria-label={`Reorder ${todo.title}. Use up and down arrow keys to move.`}
                                        onPointerDown={(event) => handleDragPointerDown(event, todo.id)}
                                        onPointerMove={(event) => handleDragPointerMove(event, todo.id)}
                                        onPointerUp={() => setDraggingId(null)}
                                        onPointerCancel={() => setDraggingId(null)}
                                        onKeyDown={(event) => handleDragKeyDown(event, todo.id)}
                                        onLostPointerCapture={() => setDraggingId(null)}
                                    >
                                        <GripIcon />
                                    </button>
                                )}
                                <Checkbox
                                    checked={todo.done}
                                    onChange={() => toggleTodo(todo.id)}
                                    aria-label={`Mark ${todo.title} as done`}
                                />
                                {editingId === todo.id ? renderEditor(todo) : (
                                    <button
                                        className="todo-title"
                                        type="button"
                                        onClick={() => startEditing(todo)}
                                        aria-label={`Edit ${todo.title}`}
                                    >
                                        {todo.title}
                                    </button>
                                )}
                                <div className="row-actions">
                                    <Button
                                        variant="subtle"
                                        className="icon-button"
                                        aria-label={`Edit ${todo.title}`}
                                        onClick={() => startEditing(todo)}
                                    >
                                        <PencilIcon />
                                    </Button>
                                    <Button
                                        variant="subtle"
                                        className="icon-button delete-action"
                                        aria-label={`Delete ${todo.title}`}
                                        onClick={() => setDeletingTodo(todo)}
                                    >
                                        <TrashIcon />
                                    </Button>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="empty-state">
                            <span className="empty-check" aria-hidden="true">✓</span>
                            <p>Nothing on your list right now.</p>
                            <span>Add a task above when you’re ready.</span>
                        </div>
                    )}
                </div>

                {completedTodos.length > 0 && (
                    <section className="completed-section" aria-labelledby="completed-title">
                        <button
                            className="completed-heading"
                            type="button"
                            aria-expanded={showCompleted}
                            onClick={() => setShowCompleted((shown) => !shown)}
                        >
                            <ChevronIcon open={showCompleted} />
                            <h2 id="completed-title">Completed</h2>
                            <span className="count-badge">{completedTodos.length}</span>
                        </button>
                        {showCompleted && (
                            <div className="todo-list completed-list">
                                {completedTodos.map((todo) => (
                                    <article className="todo-row completed-row" key={todo.id}>
                                        <Checkbox
                                            checked={todo.done}
                                            onChange={() => toggleTodo(todo.id)}
                                            aria-label={`Reopen ${todo.title}`}
                                        />
                                        {editingId === todo.id ? (
                                            renderEditor(todo)
                                        ) : (
                                            <span className="todo-title completed-title">{todo.title}</span>
                                        )}
                                        <div className="row-actions">
                                            <Button
                                                variant="subtle"
                                                className="icon-button"
                                                aria-label={`Edit ${todo.title}`}
                                                onClick={() => startEditing(todo)}
                                            >
                                                <PencilIcon />
                                            </Button>
                                            <Button
                                                variant="subtle"
                                                className="icon-button delete-action"
                                                aria-label={`Delete ${todo.title}`}
                                                onClick={() => setDeletingTodo(todo)}
                                            >
                                                <TrashIcon />
                                            </Button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                {sortMode === 'manual' && activeTodos.length > 1 && (
                    <p className="reorder-hint">
                        <GripIcon /> Drag to arrange your day
                    </p>
                )}
            </section>
            <footer className="app-footer">
                <span>One thing at a time.</span>
                <span>Saved on this device</span>
            </footer>

            <ConfirmDialog
                open={deletingTodo !== null}
                title="Delete this task?"
                message={deletingTodo ? `“${deletingTodo.title}” will be removed from your list.` : ''}
                confirmLabel="Delete task"
                onConfirm={deleteTodo}
                onCancel={() => setDeletingTodo(null)}
            />
        </main>
    );
}

function GripIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="4" r="1" />
            <circle cx="11" cy="4" r="1" />
            <circle cx="5" cy="8" r="1" />
            <circle cx="11" cy="8" r="1" />
            <circle cx="5" cy="12" r="1" />
            <circle cx="11" cy="12" r="1" />
        </svg>
    );
}

function PencilIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="m13.6 4.4 2 2m-8.9 8.9-3 .7.7-3 8.8-8.8a1.4 1.4 0 0 1 2 2l-8.8 8.8Z" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4.5 6h11m-9.7 0 .7 10h7l.7-10M8 6V4h4v2m-3 3v4m2-4v4" />
        </svg>
    );
}

function ChevronIcon({ open }: { open: boolean }) {
    return (
        <svg
            aria-hidden="true"
            className={open ? 'chevron-icon is-open' : 'chevron-icon'}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
        >
            <path d="m4 6 4 4 4-4" />
        </svg>
    );
}

export default App;
