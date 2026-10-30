import { jsPDF } from 'jspdf'
import { mkdir, writeFile } from 'node:fs/promises'

// Original starter lessons; sources are linked for further study.
// Run from the repository root to regenerate the bundled library.
const directory = 'public/resources/learning'
await mkdir(directory, { recursive: true })
const guides = [
  { slug: 'react-hooks-cheat-sheet', title: 'React Hooks Cheat Sheet', course: 'Full Stack MERN', source: 'https://react.dev/reference/react/hooks', sections: [
    ['Choose a hook', 'useState stores values that affect rendering. useRef holds a mutable value without triggering a render. useContext reads shared context. useEffect synchronizes with an external system. useMemo caches a calculation; useCallback caches a function identity. Use memoization when it solves a measured performance problem.'],
    ['Counter example', "import { useState } from 'react';\n\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(n => n + 1)}>\n      Count: {count}\n    </button>\n  );\n}", true],
    ['Practice', 'Add a Reset button. Then add a second counter and check that its state is independent. For subscriptions or timers, return a cleanup function from the effect. Keep ordinary Hooks at the top level of a component or custom Hook.'],
  ] },
  { slug: 'python-pandas-guide', title: 'Python Pandas Guide', course: 'Python Data Science', source: 'https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html', sections: [
    ['Work with tables', 'A DataFrame holds rows and named columns. Start by checking column names, data types and missing values. Select the columns you need before summarizing your data. Keep the original input so you can repeat your analysis.'],
    ['Try this example', "import pandas as pd\n\nscores = pd.DataFrame({\n    'student': ['Asha', 'Ravi', 'Mina'],\n    'score': [82, 67, 91],\n    'batch': ['A', 'A', 'B']\n})\nprint(scores.head())\nprint(scores.dtypes)\nprint(scores.loc[scores['score'] >= 80, ['student', 'score']])\nprint(scores.groupby('batch')['score'].mean())\nscores.to_csv('scores.csv', index=False)", true],
    ['Practice', 'Add a row with a missing score. Inspect missing values with isna().sum(). Decide whether to exclude or replace missing scores and explain the choice. Read your exported CSV with read_csv and compare the row count.'],
  ] },
  { slug: 'ml-model-guide', title: 'ML Model Guide', course: 'AI & ML', source: 'https://scikit-learn.org/stable/common_pitfalls.html', sections: [
    ['Build a repeatable evaluation', 'Define the prediction target and how you will measure success. Split training and test data before learning transformations. Fit preprocessing only on training data. A pipeline helps apply the same transformation during training and prediction. Keep the final test set separate from model selection.'],
    ['Classification example', "from sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import accuracy_score\n\nX, y = load_iris(return_X_y=True)\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42, stratify=y\n)\nmodel = make_pipeline(StandardScaler(), LogisticRegression())\nmodel.fit(X_train, y_train)\nprint(accuracy_score(y_test, model.predict(X_test)))", true],
    ['Practice', 'Compare against a simple baseline. Record your split, metric and parameters. Inspect mistakes rather than reporting only one score. Accuracy alone may hide poor results on an uncommon class. Avoid including information that would not exist when a real prediction is made.'],
  ] },
  { slug: 'typescript-handbook', title: 'TypeScript Handbook', course: 'TypeScript', source: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html', sections: [
    ['Starter reference', 'Use string, number and boolean for primitive types. An array can be written as string[]. Object types describe required and optional properties. A union allows alternatives; narrow it before using operations specific to one member. Type annotations do not validate network data at runtime.'],
    ['Typed functions', "type Student = {\n  name: string;\n  score?: number;\n};\n\nfunction result(student: Student): string {\n  if (student.score === undefined) return 'Not graded';\n  return student.name + ': ' + student.score;\n}\n\nfunction formatId(id: string | number): string {\n  return typeof id === 'string' ? id.trim() : String(id);\n}\n\nconsole.log(result({ name: 'Asha', score: 82 }));", true],
    ['Practice', 'Make score required and observe which calls need updating. Add a status union with three allowed values. Prefer precise types to any. This is an introductory study sheet; the linked handbook covers the language in greater depth.'],
  ] },
]
const manifest = []
for (const guide of guides) {
  const doc = new jsPDF()
  doc.setProperties({ title: guide.title, author: 'Kini learning library', subject: 'Original starter study guide' })
  doc.setFillColor('#133b5d'); doc.rect(0, 0, 210, 12, 'F')
  doc.setTextColor('#133b5d'); doc.setFontSize(23); doc.text(guide.title, 18, 29)
  doc.setFontSize(10); doc.text(`${guide.course} | Built-in learning library`, 18, 38)
  let y = 52
  for (const [title, body, code] of guide.sections) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text(title, 18, y); y += 8
    doc.setFont(code ? 'courier' : 'helvetica', 'normal'); doc.setFontSize(code ? 9 : 11)
    const lines = doc.splitTextToSize(body, 172)
    for (const line of lines) {
      if (y > 263) { doc.addPage(); y = 22 }
      doc.text(line, 18, y); y += code ? 4.8 : 5.6
    }
    y += 8
  }
  if (y > 244) { doc.addPage(); y = 22 }
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  doc.text('Further reading (official documentation):', 18, y)
  doc.setTextColor('#175cba')
  const sourceLines = doc.splitTextToSize(guide.source, 172)
  doc.text(sourceLines, 18, y + 6)
  doc.link(18, y + 2, 172, sourceLines.length * 5, { url: guide.source })
  for (let i = 1; i <= doc.getNumberOfPages(); i++) { doc.setPage(i); doc.setFontSize(9); doc.setTextColor('#64748b'); doc.text(`Kini | Starter study guide | ${i} / ${doc.getNumberOfPages()}`, 18, 285) }
  const bytes = Buffer.from(doc.output('arraybuffer'))
  const fileName = `${guide.slug}.pdf`
  await writeFile(`${directory}/${fileName}`, bytes)
  manifest.push({ id: `library-${guide.slug}`, title: guide.title, course: guide.course, type: 'pdf', fileName, url: `/resources/learning/${fileName}`, size: `${(bytes.length / 1024).toFixed(1)} KB`, description: 'Built-in starter study guide with examples and practice tasks. Original learning material; not an HR upload.' })
}
const codeFiles = [
  { slug: 'express-api-template', title: 'Express API Template', course: 'Full Stack MERN', extension: 'mjs', body: `// Kini learning library: local teaching example, in-memory data only.
// Setup in a new folder: npm init -y && npm install express
// Save this file, then run: node express-api-template.mjs
// Reference: https://expressjs.com/en/starter/hello-world/
// Add authentication and persistent storage before deployment.
import express from 'express';
const app = express();
app.use(express.json({ limit: '16kb' }));
const lessons = [{ id: 1, title: 'Introduction' }];
app.get('/api/lessons', (_request, response) => response.json(lessons));
app.post('/api/lessons', (request, response) => {
  const title = request.body?.title;
  if (typeof title !== 'string' || !title.trim() || title.length > 120) {
    return response.status(400).json({ message: 'Title must contain 1-120 characters.' });
  }
  const lesson = { id: lessons.length + 1, title: title.trim() };
  lessons.push(lesson);
  response.status(201).json(lesson);
});
app.use((_request, response) => response.status(404).json({ message: 'Route not found' }));
app.use((error, _request, response, _next) => {
  const status = error.status === 400 || error.status === 413 ? error.status : 500;
  response.status(status).json({ message: status === 500 ? 'Unexpected error' : 'Invalid request body' });
});
app.listen(3000, '127.0.0.1', () => console.log('API: http://127.0.0.1:3000/api/lessons'));
` },
  { slug: 'nodejs-best-practices', title: 'Node.js Best Practices', course: 'Node.js', extension: 'mjs', body: `// Kini learning library: asynchronous file processing example.
// Run: node nodejs-best-practices.mjs ./notes.txt
// Reference: https://nodejs.org/learn/asynchronous-work/dont-block-the-event-loop
// Keep request handlers short. Large CPU jobs can still block even in async functions.
// Process large files incrementally rather than loading everything into memory.
// Handle errors explicitly and keep sensitive data out of logs.
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

async function countLines(filePath) {
  const input = createReadStream(filePath, { encoding: 'utf8' });
  const lines = createInterface({ input, crlfDelay: Infinity });
  // Forward file read errors so the async loop can handle them.
  let readError;
  input.on('error', error => { readError = error; lines.close(); });
  let count = 0;
  try {
    for await (const _line of lines) count += 1;
    if (readError) throw readError;
    return count;
  } finally {
    lines.close();
    input.destroy();
  }
}
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node nodejs-best-practices.mjs <text-file>');
  process.exitCode = 1;
} else {
  try { console.log('Lines:', await countLines(filePath)); }
  catch { console.error('Unable to read the file. Check its path and permissions.'); process.exitCode = 1; }
}
` },
]
for (const entry of codeFiles) {
  const fileName = `${entry.slug}.${entry.extension}`
  await writeFile(`${directory}/${fileName}`, entry.body)
  manifest.push({ id: `library-${entry.slug}`, title: entry.title, course: entry.course, type: 'code', fileName, url: `/resources/learning/${fileName}`, size: `${(Buffer.byteLength(entry.body) / 1024).toFixed(1)} KB`, description: 'Built-in teaching example. Setup instructions are included in the file.' })
}
const order = ['react-hooks-cheat-sheet', 'python-pandas-guide', 'express-api-template', 'ml-model-guide', 'typescript-handbook', 'nodejs-best-practices']
manifest.sort((a, b) => order.indexOf(a.id.replace('library-', '')) - order.indexOf(b.id.replace('library-', '')))
await mkdir('src/features/employee/data', { recursive: true })
await writeFile('src/features/employee/data/learningResources.json', `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Generated four PDF study guides and two downloadable code examples.')
