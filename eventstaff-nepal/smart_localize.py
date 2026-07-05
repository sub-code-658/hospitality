import os, re, json

en_json_path = 'client/src/locales/en.json'
ne_json_path = 'client/src/locales/ne.json'

with open(en_json_path) as f: en_data = json.load(f)
with open(ne_json_path) as f: ne_data = json.load(f)

common_en = en_data.setdefault('common', {})
common_ne = ne_data.setdefault('common', {})

def slugify(text):
    text = text.strip()
    slug = re.sub(r'[^a-z0-9]', '_', text.lower())
    slug = re.sub(r'_+', '_', slug)
    return slug.strip('_')[:30]

def add_trans(text):
    text = text.strip()
    slug = slugify(text)
    if not slug: return text
    if slug not in common_en:
        common_en[slug] = text
        common_ne[slug] = text + " (NE)"
    return f"{{t('common.{slug}', '{text}')}}"

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    def repl_text(m):
        full = m.group(0)
        text = m.group(1).strip()
        # skip empty, numbers only, or weird symbols
        if not text or len(text) < 2 or not re.search(r'[a-zA-Z]', text): return full
        # skip js logic
        if any(x in text for x in ['&&', '===', '?', '=>', '(', ')', '||', '+', '-', 'now', 'start', 'end', 'length']): return full
        # skip if it's already translated or has {
        if '{' in text: return full
        return f">{add_trans(text)}<"

    content = re.sub(r'>([^<>{]+?)<', repl_text, content)

    def repl_placeholder(m):
        text = m.group(1).strip()
        if not text or not re.search(r'[a-zA-Z]', text): return m.group(0)
        if '{' in text: return m.group(0)
        return f"placeholder={add_trans(text)}"

    content = re.sub(r'placeholder="([^"]+?)"', repl_placeholder, content)

    if content != original:
        if 'useTranslation' not in content:
            lines = content.split('\n')
            import_idx = next((i for i, l in enumerate(lines) if l.startswith('import ')), 0)
            lines.insert(import_idx + 1, "import { useTranslation } from 'react-i18next';")
            
            # Find the component declaration to insert const { t } = useTranslation();
            for i, line in enumerate(lines):
                if re.search(r'(export default function|export function|const [A-Z].*=.*\(\).*=>).*\{', line):
                    lines.insert(i + 1, "  const { t } = useTranslation();")
                    break
            content = '\n'.join(lines)
            
        with open(filepath, 'w') as f:
            f.write(content)
            print(f"Updated {filepath}")

for root, _, files in os.walk('client/src'):
    for file in files:
        if file.endswith('.jsx') and file not in ['Navbar.jsx', 'main.jsx']:
            process_file(os.path.join(root, file))

with open(en_json_path, 'w') as f: json.dump(en_data, f, indent=2)
with open(ne_json_path, 'w') as f: json.dump(ne_data, f, indent=2)

print("done")
