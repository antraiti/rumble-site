'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import PageHeader from '@/app/components/PageHeader';
import userData from '@/app/util/UserData';
import { apiGet, apiPost, apiPut } from '@/app/util/apiClient';
import {
  customCardImportSchema,
  customCardSchema,
  emptyCustomCard,
  toCustomCardInputs,
  emptyCustomFace,
  type CustomCardDocument,
  type CustomCardFace,
  type CustomCardInput,
  type CustomCardSummary,
} from '@/app/util/customCards';
import type { Color } from '@/app/types/color';

const errorText = (error: unknown) =>
  error instanceof Error ? error.message : 'Unable to complete the request';

export default function CustomCards() {
  const { userToken, isAdmin } = userData();
  const [mounted, setMounted] = useState(false);
  const [cards, setCards] = useState<CustomCardSummary[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [search, setSearch] = useState('');
  const [id, setID] = useState<string | null>(null);
  const [form, setForm] = useState<CustomCardInput>(emptyCustomCard);
  const [baseline, setBaseline] = useState(JSON.stringify(emptyCustomCard()));
  const [lockedBack, setLockedBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const dirty = JSON.stringify(form) !== baseline;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Match SSR before showing cookie-based admin UI.
    setMounted(true);
    if (!userToken || !isAdmin) return;
    let active = true;
    Promise.all([
      apiGet<CustomCardSummary[]>('admin/customcards', { token: userToken }),
      apiGet<Color[]>('colors'),
    ])
      .then(([catalogue, identities]) => {
        if (!active) return;
        setCards(catalogue);
        setColors(identities);
      })
      .catch((error) => {
        if (active) setError(errorText(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [userToken, isAdmin]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function replaceForm(value: CustomCardInput, cardID: string | null) {
    setID(cardID);
    setForm(value);
    setBaseline(JSON.stringify(value));
    setLockedBack(cardID !== null && value.back !== null);
  }

  async function selectCard(cardID: string | null) {
    if (dirty && !window.confirm('Discard your unsaved card changes?')) return;
    setError('');
    setMessage('');
    if (!cardID) {
      replaceForm(emptyCustomCard(), null);
      return;
    }
    setLoading(true);
    try {
      const { id: loadedID, ...value } = await apiGet<CustomCardDocument>(
        `admin/customcards/${encodeURIComponent(cardID)}`,
        { token: userToken }
      );
      replaceForm(value, loadedID);
    } catch (error) {
      setError(errorText(error));
    } finally {
      setLoading(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');
    const parsed = customCardSchema.safeParse(form);
    if (!parsed.success) {
      setError(
        parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
      );
      return;
    }
    setSaving(true);
    try {
      const { id: savedID, ...value } = id
        ? await apiPut<CustomCardDocument>(`admin/customcards/${encodeURIComponent(id)}`, {
            token: userToken,
            body: parsed.data,
          })
        : await apiPost<CustomCardDocument>('admin/customcards', {
            token: userToken,
            body: parsed.data,
          });
      replaceForm(value, savedID);
      setCards((current) =>
        [
          ...current.filter((card) => card.id !== savedID),
          { id: savedID, name: value.front.name, transform: value.back !== null },
        ].sort((a, b) => a.name.localeCompare(b.name))
      );
      setMessage(
        'Card saved. Use Profile > Recheck all decks to refresh saved legality badges after rules, color, or ban changes.'
      );
    } catch (error) {
      setError(errorText(error));
    } finally {
      setSaving(false);
    }
  }

  async function importCards(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    setMessage('');
    let inputs: CustomCardInput[];
    try {
      const parsed = customCardImportSchema.safeParse(JSON.parse(await file.text()));
      if (!parsed.success) {
        setError(
          'Invalid import file: ' +
            parsed.error.issues
              .slice(0, 5)
              .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
              .join('; ')
        );
        return;
      }
      inputs = toCustomCardInputs(parsed.data, colors);
    } catch (error) {
      setError(error instanceof SyntaxError ? 'Import file is not valid JSON' : errorText(error));
      return;
    }

    const known = new Set(cards.map((card) => card.name.toLowerCase()));
    const created: CustomCardSummary[] = [];
    const skipped: string[] = [];
    const failed: string[] = [];
    setSaving(true);
    for (const input of inputs) {
      const name = input.front.name;
      if (known.has(name.toLowerCase())) {
        skipped.push(name);
        continue;
      }
      const valid = customCardSchema.safeParse(input);
      if (!valid.success) {
        failed.push(`${name} (${valid.error.issues[0]?.message})`);
        continue;
      }
      try {
        const saved = await apiPost<CustomCardDocument>('admin/customcards', {
          token: userToken,
          body: valid.data,
        });
        known.add(name.toLowerCase());
        created.push({ id: saved.id, name: saved.front.name, transform: saved.back !== null });
      } catch (error) {
        const text = errorText(error);
        if (text.includes('already exists')) skipped.push(name);
        else failed.push(`${name} (${text})`);
      }
    }
    setSaving(false);
    if (created.length)
      setCards((current) => [...current, ...created].sort((a, b) => a.name.localeCompare(b.name)));
    setMessage(
      `Imported ${created.length} card${created.length === 1 ? '' : 's'}; skipped ${skipped.length} that already exist.` +
        (created.length ? ' Use Profile > Recheck all decks to refresh legality badges.' : '')
    );
    if (failed.length) setError(`Failed to import: ${failed.join('; ')}`);
  }

  if (!mounted)
    return (
      <main className="p-8" role="status">
        Loading admin tools...
      </main>
    );
  if (!userToken)
    return (
      <main className="p-8">
        Sign in to manage custom cards.{' '}
        <Link className="link" href="/login">
          Sign in
        </Link>
      </main>
    );
  if (!isAdmin)
    return (
      <main className="p-8" role="alert">
        Admin access is required.
      </main>
    );
  const busy = loading || saving;
  const filtered = cards.filter((card) => card.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Rumble / Admin"
        title="Custom cards"
        actions={
          <Link
            className="btn btn-outline"
            href="/profile"
            onClick={(event) => {
              if (dirty && !window.confirm('Discard your unsaved card changes?'))
                event.preventDefault();
            }}
          >
            Back to profile
          </Link>
        }
      >
        Create and edit custom cards, including both faces and hosted artwork. Official cards are
        not editable here.
      </PageHeader>
      {error && (
        <div role="alert" className="alert alert-error my-4">
          {error}
        </div>
      )}
      {message && (
        <div role="status" className="alert alert-success my-4">
          {message}
        </div>
      )}
      {loading && (
        <p role="status" className="my-4">
          Loading cards...
        </p>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_1fr]">
        <aside className="flex flex-col gap-3" aria-label="Custom card catalogue">
          <button
            className="btn btn-primary"
            type="button"
            disabled={busy}
            onClick={() => selectCard(null)}
          >
            New custom card
          </button>
          <label className="flex flex-col gap-1">
            Import cards from JSON
            <input
              className="file-input w-full"
              type="file"
              accept="application/json,.json,.txt"
              disabled={busy || colors.length === 0}
              onChange={importCards}
            />
            <span className="text-xs text-base-content/60">
              Cards whose names already exist are skipped.
            </span>
          </label>
          <label className="flex flex-col gap-1">
            Search custom cards
            <input
              className="input w-full"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <p className="text-sm text-base-content/70">{filtered.length} custom cards</p>
          <ul className="max-h-[36rem] overflow-y-auto space-y-1">
            {filtered.map((card) => (
              <li key={card.id}>
                <button
                  className={`btn h-auto min-h-10 w-full justify-start whitespace-normal text-left ${id === card.id ? 'btn-primary' : 'btn-ghost'}`}
                  type="button"
                  disabled={busy}
                  aria-pressed={id === card.id}
                  onClick={() => selectCard(card.id)}
                >
                  {card.name}
                  {card.transform && <span className="badge badge-sm">2 faces</span>}
                </button>
              </li>
            ))}
          </ul>
          {!loading && filtered.length === 0 && <p>No matching custom cards.</p>}
        </aside>
        <form onSubmit={save} className="card bg-base-100 shadow-sm">
          <fieldset disabled={busy || colors.length === 0} className="card-body gap-5">
            <legend className="sr-only">{id ? 'Edit custom card' : 'Create custom card'}</legend>
            <h2 className="card-title">{id ? 'Edit custom card' : 'New custom card'}</h2>
            {id && <p className="break-all text-xs text-base-content/60">ID: {id}</p>}
            <label className="flex flex-col gap-1">
              Color identity (both faces combined)
              <select
                className="select w-full"
                value={form.identityid}
                onChange={(event) => setForm({ ...form, identityid: Number(event.target.value) })}
              >
                {colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.name ||
                      [
                        color.white && 'W',
                        color.blue && 'U',
                        color.black && 'B',
                        color.red && 'R',
                        color.green && 'G',
                      ]
                        .filter(Boolean)
                        .join('') ||
                      'Colorless'}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-5">
              <label className="flex items-center gap-2">
                <input
                  className="checkbox"
                  type="checkbox"
                  checked={form.banned}
                  onChange={(event) => setForm({ ...form, banned: event.target.checked })}
                />
                Banned
              </label>
              <label className="flex items-center gap-2">
                <input
                  className="checkbox"
                  type="checkbox"
                  checked={form.watchlist}
                  onChange={(event) => setForm({ ...form, watchlist: event.target.checked })}
                />
                Watchlist
              </label>
              <label className="flex items-center gap-2">
                <input
                  className="checkbox"
                  type="checkbox"
                  checked={form.back !== null}
                  disabled={lockedBack}
                  onChange={(event) =>
                    setForm({ ...form, back: event.target.checked ? emptyCustomFace() : null })
                  }
                />
                Double-faced / transform
              </label>
            </div>
            {lockedBack && (
              <p className="text-sm text-base-content/70">
                Existing double-faced cards keep their back face to preserve deck and printing
                references.
              </p>
            )}
            <FaceEditor
              title="Front face"
              face={form.front}
              onChange={(front) => setForm({ ...form, front })}
            />
            {form.back && (
              <FaceEditor
                title="Back face"
                face={form.back}
                onChange={(back) => setForm({ ...form, back })}
              />
            )}
            <p className="text-sm text-base-content/70">
              Image URLs are optional, but needed for artwork and Tabletop Simulator export. Paste
              direct hosted image URLs (256 bytes maximum); no uploads. Edits retain card IDs and
              other printings.
            </p>
            <button type="submit" className="btn btn-primary self-start">
              {saving ? 'Saving...' : id ? 'Save changes' : 'Create custom card'}
            </button>
          </fieldset>
        </form>
      </div>
    </main>
  );
}

function FaceEditor({
  title,
  face,
  onChange,
}: {
  title: string;
  face: CustomCardFace;
  onChange: (value: CustomCardFace) => void;
}) {
  function textField(
    key: Exclude<keyof CustomCardFace, 'mv' | 'oracletext'>,
    label: string,
    maxLength: number,
    required = false,
    type = 'text'
  ) {
    return (
      <label className="flex flex-col gap-1">
        {label}
        <input
          className="input w-full"
          type={type}
          required={required}
          maxLength={maxLength}
          value={face[key]}
          onChange={(event) => onChange({ ...face, [key]: event.target.value })}
        />
      </label>
    );
  }
  return (
    <section className="space-y-4 border-t border-base-content/15 pt-4" aria-label={title}>
      <h3 className="text-lg font-bold">{title}</h3>
      {textField('name', 'Name', 255, true)}
      {textField('typeline', 'Type line', 128, true)}
      <div className="grid gap-3 sm:grid-cols-2">
        {textField('cost', 'Mana cost (e.g. {2}{U})', 64)}
        <label className="flex flex-col gap-1">
          Mana value
          <input
            className="input w-full"
            type="number"
            required
            min={0}
            max={1000}
            step={1}
            value={face.mv}
            onChange={(event) => onChange({ ...face, mv: event.target.valueAsNumber })}
          />
        </label>
        {textField('power', 'Power', 8)}
        {textField('toughness', 'Toughness', 8)}
      </div>
      <label className="flex flex-col gap-1">
        Rules text
        <textarea
          className="textarea min-h-32 w-full"
          maxLength={65535}
          value={face.oracletext}
          onChange={(event) => onChange({ ...face, oracletext: event.target.value })}
        />
      </label>
      {textField('cardimage', 'Card image URL', 256, false, 'url')}
      {textField('artcrop', 'Art crop URL', 256, false, 'url')}
      <ImagePreview url={face.cardimage} name={face.name || title} />
    </section>
  );
}

function ImagePreview({ url, name }: { url: string; name: string }) {
  const [failedURL, setFailedURL] = useState<string | null>(null);
  if (!url || !/^https?:\/\//.test(url)) return null;
  if (failedURL === url)
    return (
      <p role="alert" className="text-error">
        Unable to load this image. Check the URL and host permissions.
      </p>
    );
  // Hosted custom artwork is not restricted to Next.js image-optimizer domains.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={`${name} preview`}
      className="max-h-80 max-w-full rounded-lg object-contain"
      referrerPolicy="no-referrer"
      onError={() => setFailedURL(url)}
    />
  );
}
