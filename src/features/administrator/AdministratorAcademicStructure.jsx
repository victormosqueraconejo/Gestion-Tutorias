import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../../components/ui/Icon'
import { AdministratorSidebar, AdministratorTopbar } from './AdministratorDashboard'
import './administrator-academic-structure.css'

const curriculum = [
  {
    id: 'engineering',
    type: 'school',
    name: 'Escuela de Ingeniería de Sistemas',
    count: '4 Carreras',
    children: [
      {
        id: 'software',
        type: 'career',
        name: 'Ingeniería de Software',
        count: '12 Materias',
        children: [
          {
            id: 'calculus',
            type: 'subject',
            name: 'Cálculo Multivariable',
            count: '6 Temas',
            children: [
              { id: 'vectors', type: 'topic', name: 'Vectores y geometría del espacio', count: '4 rec.' },
              { id: 'derivatives', type: 'topic', name: 'Derivadas parciales y gradiente', count: '8 rec.' },
              { id: 'lagrange', type: 'topic', name: 'Extremos condicionados y Lagrange', count: '11 rec.' },
              { id: 'integrals', type: 'topic', name: 'Integrales triples y cambio de variables', count: '5 rec.' },
            ],
          },
          { id: 'algorithms', type: 'subject', name: 'Algoritmos Avanzados', count: '8 Temas' },
          { id: 'architecture', type: 'subject', name: 'Arquitectura Empresarial', count: '5 Temas' },
        ],
      },
      { id: 'cybersecurity', type: 'career', name: 'Ingeniería en Ciberseguridad', count: '10 Materias' },
      { id: 'data-science', type: 'career', name: 'Ciencia de Datos e Inteligencia Artificial', count: '9 Materias' },
    ],
  },
]

const details = {
  lagrange: {
    title: 'Extremos condicionados y multiplicadores de Lagrange',
    parent: 'Cálculo Multivariable • Semestre IV',
    description: 'Optimización de funciones multivariables sujetas a restricciones algebraicas de igualdad. Construcción y resolución analítica de la ecuación de Lagrange, interpretación geométrica del vector gradiente perpendicular al conjunto de nivel y análisis de la matriz Hessiana orlada.',
  },
  vectors: {
    title: 'Vectores y geometría del espacio',
    parent: 'Cálculo Multivariable • Semestre IV',
    description: 'Representación vectorial, rectas y planos en el espacio, productos vectoriales e interpretación geométrica de superficies.',
  },
  derivatives: {
    title: 'Derivadas parciales y gradiente',
    parent: 'Cálculo Multivariable • Semestre IV',
    description: 'Análisis de variación multivariable mediante derivadas parciales, gradiente, planos tangentes y derivadas direccionales.',
  },
}

function flattenNodes(nodes) {
  return nodes.flatMap((node) => [node, ...(node.children ? flattenNodes(node.children) : [])])
}

function NodeTree({ nodes, selectedId, expanded, onSelect, onToggle, depth = 0 }) {
  return (
    <div className={`academic-tree-level academic-tree-level-${depth}`}>
      {nodes.map((node) => {
        const hasChildren = Boolean(node.children?.length)
        const isExpanded = expanded.has(node.id)
        const isSelected = selectedId === node.id
        const icon = node.type === 'school' ? 'domain' : node.type === 'career' ? 'badge' : node.type === 'subject' ? 'auto_stories' : 'fiber_manual_record'

        return (
          <div className="academic-tree-node" key={node.id}>
            <div className={`academic-tree-row ${isSelected ? 'is-selected' : ''}`} onClick={() => onSelect(node.id)}>
              <span className="academic-tree-label">
                {hasChildren ? (
                  <button type="button" className="academic-tree-toggle" aria-label={`${isExpanded ? 'Contraer' : 'Expandir'} ${node.name}`} onClick={(event) => { event.stopPropagation(); onToggle(node.id) }}>
                    <Icon>{isExpanded ? 'expand_more' : 'chevron_right'}</Icon>
                  </button>
                ) : <span className="academic-tree-spacer" />}
                <Icon>{icon}</Icon>
                <span>{node.name}</span>
              </span>
              <span className="academic-tree-meta">{node.count}</span>
            </div>
            {hasChildren && isExpanded && <NodeTree nodes={node.children} selectedId={selectedId} expanded={expanded} onSelect={onSelect} onToggle={onToggle} depth={depth + 1} />}
          </div>
        )
      })}
    </div>
  )
}

function DependencyModal({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="academic-modal-backdrop" role="presentation" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <section className="academic-dependency-modal" role="dialog" aria-modal="true" aria-labelledby="dependency-title">
        <div className="academic-modal-heading">
          <span className="academic-warning-icon"><Icon>warning</Icon></span>
          <div><span className="academic-modal-overline">Bloqueo de integridad referencial</span><h2 id="dependency-title">Acción no permitida por dependencias activas</h2></div>
        </div>
        <div className="academic-dependency-copy">
          <p>No es posible eliminar directamente <strong>“Ingeniería de Sistemas y Computación”</strong> porque contiene <b>14 materias</b> y <b>48 temas activos</b> asociados a planes vigentes y tutorías asignadas.</p>
          <p>Para eliminar o desactivar esta carrera, primero debes reasignar o dar de baja ordenada a todos los elementos dependientes del catálogo curricular.</p>
        </div>
        <div className="academic-dependency-stats">
          <div><Icon>menu_book</Icon><span><strong>14 Materias</strong><small>Con 28 grupos</small></span></div>
          <div><Icon>layers</Icon><span><strong>48 Temas</strong><small>92 tutorías agendadas</small></span></div>
        </div>
        <div className="academic-modal-actions">
          <button type="button" className="academic-secondary-button" onClick={onClose}>Entendido / Cancelar</button>
          <button type="button" className="academic-primary-button" onClick={onClose}>Ver dependencias afectadas <Icon>arrow_forward</Icon></button>
        </div>
      </section>
    </div>
  )
}

export function AdministratorAcademicStructure() {
  const [selectedId, setSelectedId] = useState('lagrange')
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(new Set(['engineering', 'software', 'calculus']))
  const [showModal, setShowModal] = useState(false)
  const selectedNode = useMemo(() => flattenNodes(curriculum).find((node) => node.id === selectedId), [selectedId])
  const selectedDetails = details[selectedId] || {
    title: selectedNode?.name || 'Estructura académica',
    parent: selectedNode?.type === 'school' ? 'Catálogo institucional' : 'Ingeniería de Software',
    description: 'Administra la organización académica, sus dependencias y los elementos habilitados para las tutorías institucionales.',
  }

  const visibleTree = useMemo(() => {
    if (!query.trim()) return curriculum
    const normalizedQuery = query.toLowerCase()
    const filterNodes = (nodes) => nodes.flatMap((node) => {
      const children = node.children ? filterNodes(node.children) : []
      return node.name.toLowerCase().includes(normalizedQuery) || children.length ? [{ ...node, ...(children.length ? { children } : {}) }] : []
    })
    return filterNodes(curriculum)
  }, [query])

  const toggleNode = (id) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => setExpanded(new Set(flattenNodes(curriculum).filter((node) => node.children?.length).map((node) => node.id)))

  return (
    <div className="administrator-page academic-structure-page">
      <AdministratorSidebar activeItem="Estructura académica" />
      <div className="administrator-content">
        <AdministratorTopbar />
        <main className="administrator-main academic-structure-main">
          <section className="academic-structure-heading">
            <div>
              <div className="academic-breadcrumbs"><Icon>domain</Icon><span>Escuela de Ingeniería</span><Icon>chevron_right</Icon><span>Ing. de Software</span><Icon>chevron_right</Icon><span>Cálculo Multivariable</span><Icon>chevron_right</Icon><strong>Extremos condicionados</strong></div>
              <h1>Estructura Académica</h1>
              <p>Gestión jerárquica de escuelas, carreras, programas y módulos de tutoría activa.</p>
            </div>
            <div className="academic-structure-actions">
              <button type="button" className="academic-secondary-button" onClick={() => setShowModal(true)}><Icon>warning</Icon>Simular conflicto HU-20</button>
              <button type="button" className="academic-primary-button"><Icon>add_circle</Icon>Crear nodo raíz</button>
            </div>
          </section>

          <section className="academic-structure-grid">
            <article className="academic-tree-panel">
              <header className="academic-panel-heading"><span><Icon>account_tree</Icon>Árbol Curricular</span><div><button type="button" title="Expandir todo" onClick={expandAll}><Icon>unfold_more</Icon></button><button type="button" title="Filtrar nodos"><Icon>filter_list</Icon></button></div></header>
              <label className="academic-tree-search"><Icon>search</Icon><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filtrar escuela, carrera o materia..." /></label>
              <div className="academic-tree-scroll"><NodeTree nodes={visibleTree} selectedId={selectedId} expanded={expanded} onSelect={setSelectedId} onToggle={toggleNode} /></div>
            </article>

            <article className="academic-detail-panel">
              <header className="academic-detail-heading"><div><span className="academic-detail-kicker"><Icon>radio_button_checked</Icon>Tema de tutoría activa</span><h2>{selectedDetails.title}</h2><p>Asociado a: {selectedDetails.parent}</p></div><div className="academic-detail-actions"><button type="button" className="academic-secondary-button"><Icon>edit</Icon>Editar</button><button type="button" className="academic-danger-button" onClick={() => setShowModal(true)}><Icon>delete</Icon>Eliminar</button></div></header>
              <section className="academic-detail-section"><h3>Descripción del Alcance Pedagógico</h3><p>{selectedDetails.description}</p></section>
              <section className="academic-detail-section"><div className="academic-section-title"><h3>Docentes Habilitados para Impartición</h3><button type="button" className="academic-inline-action"><Icon>person_add</Icon>Asignar tutor</button></div><div className="academic-tutors"><div><span className="academic-avatar academic-avatar-female">EV</span><span><strong>Dra. Elena Valenzuela</strong><small>Departamento de Ciencias Básicas</small></span><b>Titular</b></div><div><span className="academic-avatar academic-avatar-male">RS</span><span><strong>Mtro. Rodrigo Silva</strong><small>Tutor Senior Matemáticas</small></span><b>Tutor</b></div></div></section>
              <section className="academic-detail-section"><div className="academic-section-title"><h3>Materiales y Recursos Vinculados</h3><button type="button" className="academic-inline-action"><Icon>upload_file</Icon>Vincular recurso</button></div><div className="academic-resources"><div><span className="academic-resource-icon academic-resource-pdf"><Icon>picture_as_pdf</Icon></span><span><strong>Guia_Resolucion_Lagrange_Ejercicios_Resueltos.pdf</strong><small>2.4 MB • Actualizado hace 4 días por Mtro. Rodrigo Silva</small></span><button type="button"><Icon>download</Icon></button></div><div><span className="academic-resource-icon academic-resource-video"><Icon>videocam</Icon></span><span><strong>Grabacion_Taller_Interpretacion_Geometrica_Gradiente.mp4</strong><small>48 mins • Grabación de sesión sincrónica</small></span><button type="button"><Icon>play_circle</Icon></button></div></div></section>
            </article>
          </section>
        </main>
      </div>
      {showModal && <DependencyModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
