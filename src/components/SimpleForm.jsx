import { useEffect, useState } from 'react';

const buildInitialState = (fields, initialValues) => {
  const safeValues = initialValues ?? {};
  return Object.fromEntries(fields.map((field) => [field.name, safeValues[field.name] ?? field.defaultValue ?? '']));
};

export default function SimpleForm({
  fields,
  onSubmit,
  submitLabel = 'Guardar',
  initialValues,
  onCancel,
  formKey = 'default'
}) {
  const [form, setForm] = useState(() => buildInitialState(fields, initialValues));

  useEffect(() => {
    setForm(buildInitialState(fields, initialValues));
  }, [initialValues, formKey]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit(form);
    setForm(buildInitialState(fields));
  };

  return (
    <form className="card form-grid" onSubmit={submit}>
      {fields.map((field) => (
        <label key={field.name} className={field.wide ? 'wide' : ''}>
          <span>{field.label}</span>
          {field.type === 'select' ? (
            <select name={field.name} value={form[field.name]} onChange={handleChange} required={field.required !== false}>
              <option value="">Seleccionar</option>
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type || 'text'}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              required={field.required !== false}
            />
          )}
        </label>
      ))}
      <div className="form-actions">
        <button type="submit" className="primary-button">{submitLabel}</button>
        {onCancel ? <button type="button" className="ghost-button" onClick={onCancel}>Cancelar</button> : null}
      </div>
    </form>
  );
}
