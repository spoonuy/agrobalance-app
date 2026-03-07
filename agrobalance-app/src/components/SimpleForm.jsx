import { useState } from 'react';

export default function SimpleForm({ fields, onSubmit, submitLabel = 'Guardar' }) {
  const initialState = Object.fromEntries(fields.map((field) => [field.name, field.defaultValue || '']));
  const [form, setForm] = useState(initialState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onSubmit(form);
    setForm(initialState);
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
            <input type={field.type || 'text'} name={field.name} value={form[field.name]} onChange={handleChange} required={field.required !== false} />
          )}
        </label>
      ))}
      <button type="submit" className="primary-button">{submitLabel}</button>
    </form>
  );
}
