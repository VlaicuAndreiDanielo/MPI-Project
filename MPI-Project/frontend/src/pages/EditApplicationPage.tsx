import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationsService } from '../services/applications.service';
import type {
  ApplicationNote,
  ApplicationStatus,
  JobApplication,
} from '../types/applications';

interface EditApplicationFormState {
  companyName: string;
  roleTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
}

const toDateInputValue = (value: string) => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 10);
};

export function EditApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [application, setApplication] = useState<JobApplication | null>(null);
  const [formState, setFormState] = useState<EditApplicationFormState>({
    companyName: '',
    roleTitle: '',
    status: 'APPLIED',
    appliedAt: '',
  });
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [noteError, setNoteError] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isUpdatingNote, setIsUpdatingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !id) {
      setError('Invalid application request.');
      setIsLoading(false);
      return;
    }

    const loadApplication = async () => {
      setIsLoading(true);
      setError('');

      try {
        const applications = await applicationsService.getByUser(user.id);
        const existingApplication = applications.find((item) => item.id === id);

        if (!existingApplication) {
          setError('Application not found or not owned by current user.');
          return;
        }

        setApplication(existingApplication);
        setFormState({
          companyName: existingApplication.companyName,
          roleTitle: existingApplication.roleTitle,
          status: existingApplication.status,
          appliedAt: toDateInputValue(existingApplication.appliedAt),
        });

        const notesResponse = await applicationsService.getNotesByApplication(
          existingApplication.id,
          user.id,
        );
        setNotes(notesResponse);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load application.');
      } finally {
        setIsLoading(false);
      }
    };

    loadApplication();
  }, [id, user]);

  const onChange = (
    event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement> | ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !application) {
      setError('Invalid application request.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await applicationsService.update(application.id, {
        userId: user.id,
        companyName: formState.companyName.trim(),
        roleTitle: formState.roleTitle.trim(),
        status: formState.status,
        appliedAt: formState.appliedAt,
      });

      navigate('/', { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not update application. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    if (!user || !application) {
      setNoteError('Invalid application request.');
      return;
    }

    const content = newNote.trim();
    if (!content) {
      setNoteError('Note content cannot be empty.');
      return;
    }

    setNoteError('');
    setIsAddingNote(true);

    try {
      const response = await applicationsService.addNote(application.id, {
        userId: user.id,
        content,
      });

      setNotes((current) => [response.note, ...current]);
      setNewNote('');
    } catch (submitError) {
      setNoteError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not save note. Please try again.',
      );
    } finally {
      setIsAddingNote(false);
    }
  };

  const startEditNote = (note: ApplicationNote) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
    setNoteError('');
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditingNoteContent('');
  };

  const saveEditedNote = async (note: ApplicationNote) => {
    if (!user || !application) {
      setNoteError('Invalid application request.');
      return;
    }

    const content = editingNoteContent.trim();
    if (!content) {
      setNoteError('Note content cannot be empty.');
      return;
    }

    setNoteError('');
    setIsUpdatingNote(true);

    try {
      const response = await applicationsService.updateNote(application.id, note.id, {
        userId: user.id,
        content,
      });

      setNotes((current) =>
        current.map((item) =>
          item.id === response.note.id ? response.note : item,
        ),
      );

      cancelEditNote();
    } catch (submitError) {
      setNoteError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not update note. Please try again.',
      );
    } finally {
      setIsUpdatingNote(false);
    }
  };

  const deleteNote = async (note: ApplicationNote) => {
    if (!user || !application) {
      setNoteError('Invalid application request.');
      return;
    }

    const shouldDelete = window.confirm('Delete this note?');
    if (!shouldDelete) {
      return;
    }

    setNoteError('');
    setDeletingNoteId(note.id);

    try {
      await applicationsService.removeNote(application.id, note.id, {
        userId: user.id,
      });

      setNotes((current) => current.filter((item) => item.id !== note.id));

      if (editingNoteId === note.id) {
        cancelEditNote();
      }
    } catch (submitError) {
      setNoteError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not delete note. Please try again.',
      );
    } finally {
      setDeletingNoteId(null);
    }
  };

  if (isLoading) {
    return (
      <main className="applications-shell">
        <section className="auth-panel create-application-panel">
          <p className="applications-state">Loading application...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="applications-shell">
      <section className="auth-panel create-application-panel">
        <p className="auth-kicker">Edit Application</p>
        <h1>Update application</h1>
        <p className="auth-subtitle">Update details and optionally add a note.</p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label htmlFor="companyName">Company name</label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            value={formState.companyName}
            onChange={onChange}
            required
          />

          <label htmlFor="roleTitle">Role</label>
          <input
            id="roleTitle"
            name="roleTitle"
            type="text"
            value={formState.roleTitle}
            onChange={onChange}
            required
          />

          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={formState.status} onChange={onChange}>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <label htmlFor="appliedAt">Application date</label>
          <input
            id="appliedAt"
            name="appliedAt"
            type="date"
            value={formState.appliedAt}
            onChange={onChange}
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </button>

          {error ? <p className="auth-message auth-message-error">{error}</p> : null}
        </form>

        <section className="notes-section">
          <h2>Notes</h2>
          <p className="auth-subtitle">Track interview details and follow-up tasks.</p>

          <div className="notes-create">
            <textarea
              rows={3}
              value={newNote}
              onChange={(event) => setNewNote(event.target.value)}
              placeholder="Add a follow-up note"
            />
            <button
              type="button"
              className="notes-button notes-button-primary"
              onClick={handleAddNote}
              disabled={isAddingNote}
            >
              {isAddingNote ? 'Adding...' : 'Add note'}
            </button>
          </div>

          {noteError ? <p className="auth-message auth-message-error">{noteError}</p> : null}

          {notes.length === 0 ? (
            <p className="applications-state">No notes yet.</p>
          ) : (
            <ul className="notes-list">
              {notes.map((note) => {
                const isEditingCurrent = editingNoteId === note.id;

                return (
                  <li key={note.id} className="notes-item">
                    {isEditingCurrent ? (
                      <>
                        <textarea
                          rows={3}
                          value={editingNoteContent}
                          onChange={(event) => setEditingNoteContent(event.target.value)}
                        />
                        <div className="notes-item-actions">
                          <button
                            type="button"
                            className="notes-button notes-button-primary"
                            onClick={() => saveEditedNote(note)}
                            disabled={isUpdatingNote}
                          >
                            {isUpdatingNote ? 'Saving...' : 'Save note'}
                          </button>
                          <button
                            type="button"
                            className="notes-button notes-button-secondary"
                            onClick={cancelEditNote}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p>{note.content}</p>
                        <div className="notes-item-meta">
                          <span>
                            Updated {new Date(note.updatedAt).toLocaleDateString('en-US')}
                          </span>
                          <button
                            type="button"
                            className="notes-button notes-button-secondary notes-button-compact notes-button-edit"
                            onClick={() => startEditNote(note)}
                          >
                            Edit note
                          </button>
                          <button
                            type="button"
                            className="notes-button notes-button-danger notes-button-compact"
                            onClick={() => deleteNote(note)}
                            disabled={deletingNoteId === note.id}
                          >
                            {deletingNoteId === note.id ? 'Deleting...' : 'Delete note'}
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <p className="auth-switch">
          <Link to="/">Back to applications</Link>
        </p>
      </section>
    </main>
  );
}
