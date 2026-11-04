import { useCallback, useEffect, useMemo, useState } from 'react'
import { Icon } from '../../components/ui/Icon'
import { StatusAlert } from '../../components/ui/StatusAlert'
import { AdministratorSidebar, AdministratorTopbar } from './AdministratorDashboard'
import { createCatalogEntity, deleteCatalogEntity, fetchCatalog, updateCatalogEntity } from './administratorCatalogApi'
import './administrator-academic-structure.css'

const emptyCatalog = { schools: [], careers: [], subjects: [], topics: [], resources: [] }
const labels = { schools: 'escuela', careers: 'carrera', subjects: 'materia', topics: 'tema', resources: 'recurso' }

function flattenNodes(nodes) {
  return nodes.flatMap((node) => [node, ...(node.children ? flattenNodes(node.children) : [])])
}

function buildTree(catalog) {
  const resourcesByTopic = catalog.resources.reduce((map, resource) => {
    map[resource.topicId] = (map[resource.topicId] || 0) + 1
    return map
  }, {})
  const topicsBySubject = catalog.topics.reduce((map, topic) => {
    const node = { id: topic.id, type: 'topic', name: topic.name, description: topic.description, count: `${resourcesByTopic[topic.id] || 0} rec.`, entity: topic }
    ;(map[topic.subjectId] ||= []).push(node)
    return map
  }, {})
  const subjectsByCareer = catalog.subjects.reduce((map, subject) => {
    const careerTopics = topicsBySubject[subject.id] || []
    const node = { id: subject.id, type: 'subject', name: subject.name, description: subject.description, count: `${careerTopics.length} Temas`, children: careerTopics, entity: subject }
    if (subject.careerId) (map[subject.careerId] ||= []).push(node)
    return map
  }, {})
  const careersBySchool = catalog.careers.reduce((map, career) => {
    const children = subjectsByCareer[career.id] || []
    const node = { id: career.id, type: 'career', name: career.name, count: `${children.length} Materias`, children, entity: career }
    ;(map[career.schoolId] ||= []).push(node)
    return map
  }, {})
  return catalog.schools.map((school) => ({
    id: school.id, type: 'school', name: school.name, description: school.description,
    count: `${(careersBySchool[school.id] || []).length} Carreras`, children: careersBySchool[school.id] || [], entity: school,
  }))
}

function getUnassignedSubjects(catalog) {
  return catalog.subjects.filter((subject) => !subject.careerId)
}

function NodeTree({ nodes, selectedId, expanded, onSelect, onToggle, depth = 0 }) {
  return <div className={`academic-tree-level academic-tree-level-${depth}`}>
    {nodes.map((node) => {
      const hasChildren = Boolean(node.children?.length)
      const isExpanded = expanded.has(node.id)
      const icon = node.type === 'school' ? 'domain' : node.type === 'career' ? 'badge' : node.type === 'subject' ? 'auto_stories' : 'fiber_manual_record'
      return <div className="academic-tree-node" key={node.id}>
        <div className={`academic-tree-row ${selectedId === node.id ? 'is-selected' : ''}`} onClick={() => onSelect(node.id)}>
          <span className="academic-tree-label">
            {hasChildren ? <button type="button" className="academic-tree-toggle" aria-label={`${isExpanded ? 'Contraer' : 'Expandir'} ${node.name}`} onClick={(event) => { event.stopPropagation(); onToggle(node.id) }}><Icon>{isExpanded ? 'expand_more' : 'chevron_right'}</Icon></button> : <span className="academic-tree-spacer" />}
            <Icon>{icon}</Icon><span>{node.name}</span>
          </span>
          <span className="academic-tree-meta">{node.count}</span>
        </div>
        {hasChildren && isExpanded && <NodeTree nodes={node.children} selectedId={selectedId} expanded={expanded} onSelect={onSelect} onToggle={onToggle} depth={depth + 1} />}
      </div>
    })}
  </div>
}

function CatalogModal({ type, item, initialValues, catalog, onClose, onSave }) {
  const [values, setValues] = useState(item || initialValues || (type === 'resources' ? { type: 'enlace', validated: false } : {}))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (key, value) => setValues((current) => ({ ...current, [key]: value }))
  const parentLocked = type === 'subjects' && !item && Boolean(initialValues?.careerId)
  const parentOptions = type === 'careers' ? catalog.schools : type === 'subjects' ? catalog.careers.filter((career) => !values.schoolId || career.schoolId === values.schoolId) : type === 'topics' ? catalog.subjects : catalog.topics
  const parentKey = type === 'careers' ? 'schoolId' : type === 'subjects' ? 'careerId' : type === 'topics' ? 'subjectId' : 'topicId'
  const submit = async (event) => {
    event.preventDefault()
    setSaving(true); setError('')
    try { await onSave(values); onClose() } catch (saveError) { setError(saveError.message); setSaving(false) }
  }
  const title = item ? `Editar ${labels[type]}` : `Crear ${labels[type]}`
  return <div className="academic-modal-backdrop" role="presentation" onClick={(event) => event.target === event.currentTarget && onClose()}>
    <form className="academic-form-modal" onSubmit={submit} role="dialog" aria-modal="true">
      <header className="academic-modal-heading"><div><span className="academic-modal-overline">Catálogo académico</span><h2>{title}</h2></div><button type="button" className="academic-close-button" onClick={onClose} aria-label="Cerrar"><Icon>close</Icon></button></header>
      {error && <StatusAlert title="No se pudo guardar" message={error} />}
      {type !== 'resources' && <label>Nombre<input required value={values.name || ''} onChange={(event) => set('name', event.target.value)} /></label>}
      {type === 'schools' && <label>Descripción<textarea value={values.description || ''} onChange={(event) => set('description', event.target.value)} /></label>}
      {type === 'careers' && <><label>Escuela<select required value={values.schoolId || ''} onChange={(event) => set('schoolId', event.target.value)}><option value="">Selecciona una escuela</option>{parentOptions.map((option) => <option value={option.id} key={option.id}>{option.name}</option>)}</select></label><label>Duración (semestres)<input required min="1" type="number" value={values.semesters || ''} onChange={(event) => set('semesters', event.target.value)} /></label></>}
      {type === 'subjects' && <><label>Carrera<select required disabled={parentLocked} value={values.careerId || ''} onChange={(event) => { const career = catalog.careers.find((entry) => entry.id === event.target.value); setValues((current) => ({ ...current, careerId: event.target.value, schoolId: career?.schoolId || '' })) }}><option value="">Selecciona una carrera</option>{parentOptions.map((option) => <option value={option.id} key={option.id}>{option.name}</option>)}</select>{parentLocked && <small className="academic-form-hint">La materia se creará dentro de la carrera seleccionada.</small>}</label><label>Descripción<textarea value={values.description || ''} onChange={(event) => set('description', event.target.value)} /></label></>}
      {type === 'topics' && <><label>Materia<select required value={values[parentKey] || ''} onChange={(event) => set(parentKey, event.target.value)}><option value="">Selecciona una materia</option>{parentOptions.map((option) => <option value={option.id} key={option.id}>{option.name}</option>)}</select></label><label>Descripción<textarea value={values.description || ''} onChange={(event) => set('description', event.target.value)} /></label></>}
      {type === 'resources' && <><label>Título<input required value={values.title || ''} onChange={(event) => set('title', event.target.value)} /></label><label>Tema<select required value={values.topicId || ''} onChange={(event) => set('topicId', event.target.value)}><option value="">Selecciona un tema</option>{parentOptions.map((option) => <option value={option.id} key={option.id}>{option.name}</option>)}</select></label><label>Tipo<select value={values.type || 'enlace'} onChange={(event) => set('type', event.target.value)}><option value="enlace">Enlace</option><option value="video">Video</option><option value="documento">Documento</option></select></label><label>URL<input required type="url" value={values.url || ''} onChange={(event) => set('url', event.target.value)} /></label></>}
      <div className="academic-modal-actions"><button type="button" className="academic-secondary-button" onClick={onClose}>Cancelar</button><button type="submit" className="academic-primary-button" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button></div>
    </form>
  </div>
}

export function AdministratorAcademicStructure() {
  const [catalog, setCatalog] = useState(emptyCatalog)
  const [selectedId, setSelectedId] = useState('')
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(new Set())
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const loadCatalog = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const entries = await Promise.all(Object.keys(emptyCatalog).map(async (type) => [type, await fetchCatalog(type)]))
      const next = Object.fromEntries(entries)
      setCatalog(next)
      setSelectedId((current) => current || next.topics[0]?.id || next.subjects[0]?.id || next.schools[0]?.id || '')
      setExpanded(new Set(buildTree(next).map((node) => node.id)))
    } catch (loadError) { setError(loadError.message) } finally { setLoading(false) }
  }, [])
  // The initial request synchronizes component state with the external API.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadCatalog() }, [loadCatalog])

  const tree = useMemo(() => buildTree(catalog), [catalog])
  const unassignedSubjects = useMemo(() => getUnassignedSubjects(catalog), [catalog])
  const selectedNode = useMemo(() => flattenNodes(tree).find((node) => node.id === selectedId), [tree, selectedId])
  const selectedResources = catalog.resources.filter((resource) => resource.topicId === selectedId)
  const visibleTree = useMemo(() => {
    if (!query.trim()) return tree
    const normalized = query.toLowerCase()
    const filterNodes = (nodes) => nodes.flatMap((node) => {
      const children = node.children ? filterNodes(node.children) : []
      return node.name.toLowerCase().includes(normalized) || children.length ? [{ ...node, ...(children.length ? { children } : {}) }] : []
    })
    return filterNodes(tree)
  }, [query, tree])
  const saveEntity = async (type, values) => {
    if (type === 'subjects') {
      const career = catalog.careers.find((entry) => entry.id === values.careerId)
      if (!career || !values.schoolId) throw new Error('Cada materia debe estar asociada a una carrera y a su escuela.')
      if (career.schoolId !== values.schoolId) throw new Error('La carrera seleccionada no pertenece a la escuela indicada.')
    }
    const result = modal.item ? await updateCatalogEntity(type, modal.item.id, values) : await createCatalogEntity(type, values)
    if (!result.id) throw new Error('El servidor no devolvió el identificador de la materia creada.')
    setCatalog((current) => ({ ...current, [type]: modal.item ? current[type].map((entry) => entry.id === result.id ? result : entry) : [...current[type], result] }))
    if (type === 'subjects' && values.careerId) setExpanded((current) => new Set(current).add(values.careerId))
    setSelectedId(result.id); setNotice(`${labels[type]} guardado correctamente.`)
  }
  const createChild = () => {
    if (selectedNode?.type === 'school') setModal({ type: 'careers', initialValues: { schoolId: selectedNode.id } })
    if (selectedNode?.type === 'career') setModal({ type: 'subjects', initialValues: { careerId: selectedNode.id, schoolId: selectedNode.entity.schoolId } })
    if (selectedNode?.type === 'subject') setModal({ type: 'topics', initialValues: { subjectId: selectedNode.id } })
  }
  const removeSelected = async () => {
    if (!selectedNode || !window.confirm(`¿Eliminar ${selectedNode.name}?`)) return
    try {
      const type = selectedNode.type === 'school' ? 'schools' : selectedNode.type === 'career' ? 'careers' : selectedNode.type === 'subject' ? 'subjects' : 'topics'
      await deleteCatalogEntity(type, selectedNode.id)
      setCatalog((current) => ({ ...current, [type]: current[type].filter((entry) => entry.id !== selectedNode.id) }))
      setSelectedId(''); setNotice(`${labels[type]} eliminado correctamente.`)
    } catch (removeError) { setError(removeError.message) }
  }
  const typeForNode = selectedNode?.type === 'school' ? 'schools' : selectedNode?.type === 'career' ? 'careers' : selectedNode?.type === 'subject' ? 'subjects' : selectedNode?.type === 'topic' ? 'topics' : 'schools'
  const parentLabel = selectedNode?.type === 'topic' ? catalog.subjects.find((entry) => entry.id === selectedNode.entity.subjectId)?.name : selectedNode?.type === 'subject' ? catalog.careers.find((entry) => entry.id === selectedNode.entity.careerId)?.name : selectedNode?.type === 'career' ? catalog.schools.find((entry) => entry.id === selectedNode.entity.schoolId)?.name : 'Catálogo institucional'
  return <div className="administrator-page academic-structure-page">
    <AdministratorSidebar activeItem="Estructura académica" />
    <div className="administrator-content"><AdministratorTopbar /><main className="administrator-main academic-structure-main">
      <section className="academic-structure-heading"><div><div className="academic-breadcrumbs"><Icon>account_tree</Icon><span>{parentLabel}</span>{selectedNode && <><Icon>chevron_right</Icon><strong>{selectedNode.name}</strong></>}</div><h1>Estructura Académica</h1><p>Gestión jerárquica de escuelas, carreras, materias y temas.</p></div><div className="academic-structure-actions"><button type="button" className="academic-primary-button" onClick={() => setModal({ type: 'schools' })}><Icon>add_circle</Icon>Crear escuela</button>{selectedNode && selectedNode.type !== 'topic' && <button type="button" className="academic-secondary-button" onClick={createChild}><Icon>add</Icon>Crear {selectedNode.type === 'school' ? 'carrera' : selectedNode.type === 'career' ? 'materia' : 'tema'}</button>}</div></section>
      {error && <StatusAlert title="Error del catálogo" message={error} />}
      {unassignedSubjects.length > 0 && <StatusAlert title="Materias pendientes de migración" message={`Hay ${unassignedSubjects.length} materia(s) sin carrera_id: ${unassignedSubjects.map((subject) => subject.name).join(', ')}. Ejecuta npm run migrate:subjects en el backend antes de administrarlas.`} />}
      {notice && <StatusAlert tone="success" title="Operación completada" message={notice} />}
      <section className="academic-structure-grid"><article className="academic-tree-panel"><header className="academic-panel-heading"><span><Icon>account_tree</Icon>Árbol Curricular</span><button type="button" title="Expandir todo" onClick={() => setExpanded(new Set(flattenNodes(tree).filter((node) => node.children?.length).map((node) => node.id)))}><Icon>unfold_more</Icon></button></header><label className="academic-tree-search"><Icon>search</Icon><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filtrar escuela, carrera o materia..." /></label><div className="academic-tree-scroll">{loading ? <p className="academic-empty-state">Cargando catálogo...</p> : visibleTree.length ? <NodeTree nodes={visibleTree} selectedId={selectedId} expanded={expanded} onSelect={setSelectedId} onToggle={(id) => setExpanded((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next })} /> : <p className="academic-empty-state">No hay elementos para mostrar.</p>}</div></article>
        <article className="academic-detail-panel">{selectedNode ? <><header className="academic-detail-heading"><div><span className="academic-detail-kicker"><Icon>radio_button_checked</Icon>{labels[typeForNode]}</span><h2>{selectedNode.name}</h2><p>Asociado a: {parentLabel}</p></div><div className="academic-detail-actions"><button type="button" className="academic-secondary-button" onClick={() => setModal({ type: typeForNode, item: selectedNode.entity })}><Icon>edit</Icon>Editar</button><button type="button" className="academic-danger-button" onClick={removeSelected}><Icon>delete</Icon>Eliminar</button></div></header><section className="academic-detail-section"><h3>Descripción</h3><p>{selectedNode.description || 'Sin descripción registrada.'}</p></section>{selectedNode.type === 'topic' && <section className="academic-detail-section"><div className="academic-section-title"><h3>Recursos vinculados</h3><button type="button" className="academic-inline-action" onClick={() => setModal({ type: 'resources', item: { topicId: selectedId } })}><Icon>add</Icon>Agregar recurso</button></div><div className="academic-resources">{selectedResources.length ? selectedResources.map((resource) => <div key={resource.id}><span className="academic-resource-icon academic-resource-video"><Icon>link</Icon></span><span><strong>{resource.title}</strong><small>{resource.type} · {resource.url}</small></span><button type="button" onClick={() => setModal({ type: 'resources', item: resource })}><Icon>edit</Icon></button><button type="button" onClick={async () => { try { await deleteCatalogEntity('resources', resource.id); setCatalog((current) => ({ ...current, resources: current.resources.filter((entry) => entry.id !== resource.id) })); setNotice('Recurso eliminado correctamente.') } catch (removeError) { setError(removeError.message) } }}><Icon>delete</Icon></button></div>) : <p className="academic-empty-state">Este tema no tiene recursos vinculados.</p>}</div></section>}</> : <p className="academic-empty-state">Selecciona un elemento del árbol para administrar sus datos.</p>}</article>
      </section>
    </main></div>
    {modal && <CatalogModal type={modal.type} item={modal.item} initialValues={modal.initialValues} catalog={catalog} onClose={() => setModal(null)} onSave={(values) => saveEntity(modal.type, values)} />}
  </div>
}
