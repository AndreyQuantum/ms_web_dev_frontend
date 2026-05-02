import { useState } from 'react';
import { Button } from '@/components/Button/Button';
import { parseCsv } from './parseCsv';

const PRODUCT_FIELDS = [
  'name',
  'price',
  'description',
  'brightnessLm',
  'stockQty',
  'imageUrl',
];

export function AdminImportPage() {
  const [rows, setRows] = useState<Array<Record<string, string>>>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    const text = await file.text();
    const parsed = parseCsv(text);
    setRows(parsed);
    if (parsed.length > 0) {
      setHeaders(Object.keys(parsed[0]));
    } else {
      setHeaders([]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    // Skeleton — full import flow lives in a later task.
    console.log('Import requested', { mapping, rows: rows.length });
  };

  return (
    <div className="admin-import-page">
      <h1>Импорт товаров</h1>

      <div
        data-testid="import-dropzone"
        className={`import-dropzone ${dragOver ? 'import-dropzone-over' : ''}`}
        onDragOver={e => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <p>Перетащите CSV-файл сюда или выберите вручную</p>
        <input type="file" accept=".csv,text/csv" onChange={handleChange} />
        {fileName ? <p className="import-file-name">{fileName}</p> : null}
      </div>

      {headers.length > 0 ? (
        <section className="import-mapping">
          <h2>Соответствие колонок</h2>
          <table>
            <thead>
              <tr>
                <th>Колонка CSV</th>
                <th>Поле товара</th>
              </tr>
            </thead>
            <tbody>
              {headers.map(h => (
                <tr key={h}>
                  <td>{h}</td>
                  <td>
                    <select
                      value={mapping[h] ?? ''}
                      onChange={e =>
                        setMapping(m => ({ ...m, [h]: e.target.value }))
                      }
                    >
                      <option value="">—</option>
                      {PRODUCT_FIELDS.map(f => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p>Найдено строк: {rows.length}</p>
          <Button onClick={handleImport}>Импортировать</Button>
        </section>
      ) : null}
    </div>
  );
}
