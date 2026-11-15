/** Téléchargement d'un fichier produit dans le navigateur (export CSV ou JSON des écrans). */
export function downloadFile(name: string, content: string, mime = 'text/csv;charset=utf-8') {
  if (!import.meta.client) return
  // BOM UTF-8 : Excel ouvre alors correctement les accents d'un CSV.
  const bom = String.fromCharCode(0xfeff)
  const blob = new Blob([mime.startsWith('text/csv') ? bom + content : content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = Object.assign(document.createElement('a'), { href: url, download: name })
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** Tableau → CSV (séparateur « ; » pour Excel en français, guillemets échappés). */
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';'))
    .join('\n')
}
