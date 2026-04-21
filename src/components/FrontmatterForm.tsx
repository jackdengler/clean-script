import type { FieldSchema } from '../lib/schemas';
import type { Frontmatter, FrontmatterValue } from '../lib/markdown';

interface Props {
  schema: FieldSchema[];
  value: Frontmatter;
  onChange: (next: Frontmatter) => void;
}

export function FrontmatterForm({ schema, value, onChange }: Props) {
  function update(key: string, v: FrontmatterValue) {
    onChange({ ...value, [key]: v });
  }
  return (
    <div className="space-y-3">
      {schema.map((field) => (
        <div key={field.key}>
          <label className="label" htmlFor={`fm-${field.key}`}>{field.label}</label>
          <FieldInput field={field} value={value[field.key]} onChange={(v) => update(field.key, v)} />
        </div>
      ))}
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldSchema;
  value: FrontmatterValue | undefined;
  onChange: (v: FrontmatterValue) => void;
}) {
  const id = `fm-${field.key}`;
  if (field.type === 'select') {
    return (
      <select
        id={id}
        className="input"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">—</option>
        {(field.options ?? []).map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }
  if (field.type === 'textarea') {
    return (
      <textarea
        id={id}
        className="input"
        rows={4}
        placeholder={field.placeholder}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.type === 'number') {
    return (
      <input
        id={id}
        className="input"
        type="number"
        placeholder={field.placeholder}
        value={typeof value === 'number' ? value : ''}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      />
    );
  }
  if (field.type === 'tags') {
    const asString = Array.isArray(value) ? value.join(', ') : typeof value === 'string' ? value : '';
    return (
      <input
        id={id}
        className="input"
        placeholder={field.placeholder}
        value={asString}
        onChange={(e) => {
          const parts = e.target.value.split(',').map((p) => p.trim()).filter(Boolean);
          onChange(parts);
        }}
      />
    );
  }
  return (
    <input
      id={id}
      className="input"
      type={field.type === 'url' ? 'url' : 'text'}
      placeholder={field.placeholder}
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
