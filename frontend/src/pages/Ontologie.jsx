import { useState } from 'react'
import { OBJECT_PROPERTIES, ROOTS, subclassesOf, label } from '../ontology/schema'
import { getProvider } from '../services/provider'

function Node({ cls, depth = 0 }) {
  const kids = subclassesOf(cls)
  const n = getProvider().all().filter((e) => e.type === cls).length
  const [open, setOpen] = useState(depth < 1)
  return (
    <li>
      <button className="node" onClick={() => kids.length && setOpen(!open)}>
        {kids.length ? (open ? '▾' : '▸') : '•'} {label(cls)} <code>{cls}</code> {n > 0 && <span className="tag">{n}</span>}
      </button>
      {open && kids.length > 0 && <ul>{kids.map((k) => <Node key={k} cls={k} depth={depth + 1} />)}</ul>}
    </li>
  )
}

export default function Ontologie() {
  return (
    <>
      <h1>Ontologie du tourisme éco-responsable</h1>
      <p className="muted">Namespace <code>http://example.org/eco-tourism#</code>. Les compteurs indiquent le nombre d’individus directs par classe.</p>
      <div className="two">
        <section className="panel">
          <h2>Classes</h2>
          <ul className="tree">{ROOTS.map((r) => <Node key={r} cls={r} />)}</ul>
        </section>
        <section className="panel">
          <h2>Propriétés objet</h2>
          <table>
            <thead><tr><th>Propriété</th><th>Domaine</th><th>Portée</th></tr></thead>
            <tbody>{OBJECT_PROPERTIES.map(([p, d, r]) => <tr key={p}><td><code>{p}</code></td><td>{d}</td><td>{r}</td></tr>)}</tbody>
          </table>
        </section>
      </div>
    </>
  )
}
