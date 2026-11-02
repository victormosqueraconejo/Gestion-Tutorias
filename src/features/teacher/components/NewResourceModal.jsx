import { useEffect, useState } from 'react'
import { Icon } from '../../../components/ui/Icon'
import { ResourceTypeSelector } from './ResourceTypeSelector'

const initialForm = {
  subject: 'Cálculo Multivariable',
  topic: 'Extremos condicionados y multiplicadores de Lagrange',
  title: 'Guía Práctica: Optimización con restricciones de igualdad y hessiano bordeado',
  type: 'guia',
  url: 'https://drive.universidad.edu/ciencias/calculo/guia-lagrange-2025.pdf',
  notes: 'Revisar especialmente los ejercicios 4 y 7 antes de la tutoría de los jueves. Contiene ejemplos con cálculo de determinantes bordered.',
}

export function NewResourceModal({ open, onClose, onPublished }) {
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    if (!open) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onPublished()
    setForm(initialForm)
  }

  return (
    <div className="resource-modal-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="resource-modal" role="dialog" aria-modal="true" aria-labelledby="resource-modal-title">
        <header className="resource-modal-header">
          <div className="resource-modal-heading">
            <span className="resource-modal-icon"><Icon>post_add</Icon></span>
            <div>
              <div className="resource-modal-title-row">
                <h2 id="resource-modal-title">Agregar Nuevo Recurso de Apoyo</h2>
                <span>HU-10</span>
              </div>
              <p>Vincula el recurso con una asignatura y tema específico para tus estudiantes.</p>
            </div>
          </div>
          <button className="resource-modal-close" type="button" aria-label="Cerrar modal" onClick={onClose}><Icon>close</Icon></button>
        </header>

        <form className="resource-modal-form" onSubmit={handleSubmit}>
          <div className="resource-form-grid">
            <label className="resource-field">
              <span>Materia vinculada <b>*</b></span>
              <div className="resource-select"><select value={form.subject} onChange={(event) => update('subject', event.target.value)} required><option>Cálculo Multivariable</option><option>Estructuras de Datos</option><option>Física Mecánica</option></select><Icon>expand_more</Icon></div>
            </label>
            <label className="resource-field">
              <span>Tema específico <b>*</b></span>
              <div className="resource-select"><select value={form.topic} onChange={(event) => update('topic', event.target.value)} required><option>Extremos condicionados y multiplicadores de Lagrange</option><option>Integrales triples y coordenadas esféricas</option><option>Superficies cuádricas y planos tangentes</option><option>Derivadas direccionales y gradiente</option></select><Icon>expand_more</Icon></div>
            </label>
          </div>

          <label className="resource-field">
            <span>Título del recurso <b>*</b></span>
            <input required value={form.title} onChange={(event) => update('title', event.target.value)} />
          </label>

          <fieldset className="resource-field resource-type-field">
            <legend>Tipo de recurso <b>*</b></legend>
            <ResourceTypeSelector value={form.type} onChange={(value) => update('type', value)} />
          </fieldset>

          <label className="resource-field">
            <span>URL del recurso / Enlace de acceso <b>*</b></span>
            <div className="resource-url-input"><Icon>link</Icon><input required type="url" value={form.url} onChange={(event) => update('url', event.target.value)} /></div>
            <small>Asegúrate de que los permisos de Google Drive, OneDrive o YouTube estén habilitados para el alumnado.</small>
          </label>

          <label className="resource-field">
            <span className="resource-label-row">Instrucciones previas o notas pedagógicas <small>Opcional</small></span>
            <textarea rows="3" value={form.notes} onChange={(event) => update('notes', event.target.value)} />
          </label>

          <footer className="resource-modal-actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button className="publish-resource-button" type="submit"><Icon>publish</Icon>Publicar recurso</button>
          </footer>
        </form>
      </section>
    </div>
  )
}
