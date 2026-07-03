import os
import re
import json

en_json_path = 'client/src/locales/en.json'
ne_json_path = 'client/src/locales/ne.json'

with open(en_json_path) as f:
    en_data = json.load(f)

with open(ne_json_path) as f:
    ne_data = json.load(f)

if 'common' not in en_data:
    en_data['common'] = {}
    ne_data['common'] = {}

def add_translation(text):
    key = re.sub(r'[^a-z0-9]', '_', text.lower())[:30].strip('_')
    if key not in en_data['common']:
        en_data['common'][key] = text
        ne_data['common'][key] = text + " (NE)"
    return f"{{t('common.{key}')}}"

def add_placeholder_translation(text):
    key = re.sub(r'[^a-z0-9]', '_', text.lower())[:30].strip('_')
    if key not in en_data['common']:
        en_data['common'][key] = text
        ne_data['common'][key] = text + " (NE)"
    return f"{{t('common.{key}')}}"

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # Find >Text<
    def repl_text(m):
        text = m.group(1).strip()
        if not text or len(text) < 2 or '{' in text or '}' in text:
            return m.group(0)
        return f">{add_translation(text)}<"
    
    content = re.sub(r'>([^<>{]+?)<', repl_text, content)

    # Find placeholder="Text"
    def repl_placeholder(m):
        text = m.group(1).strip()
        if not text or '{' in text:
            return m.group(0)
        return f"placeholder={add_placeholder_translation(text)}"

    content = re.sub(r'placeholder="([^"]+?)"', repl_placeholder, content)

    if content != original:
        if 'useTranslation' not in content:
            # Insert imports
            lines = content.split('\n')
            import_idx = 0
            for i, line in enumerate(lines):
                if line.startswith('import '):
                    import_idx = i
            lines.insert(import_idx + 1, "import { useTranslation } from 'react-i18next';")
            
            # Find the component declaration to insert const { t } = useTranslation();
            for i, line in enumerate(lines):
                if 'export default function ' in line or 'export function ' in line or 'const ' in line and '= () => {' in line:
                    if '{' in line:
                        lines.insert(i + 1, "  const { t } = useTranslation();")
                        break
            content = '\n'.join(lines)
            
        with open(filepath, 'w') as f:
            f.write(content)

for root, _, files in os.walk('client/src/pages'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))

for root, _, files in os.walk('client/src/components'):
    for file in files:
        if file.endswith('.jsx') and file != 'Navbar.jsx':
            process_file(os.path.join(root, file))

with open(en_json_path, 'w') as f:
    json.dump(en_data, f, indent=2)

with open(ne_json_path, 'w') as f:
    json.dump(ne_data, f, indent=2)

print("Translation mapping done.")
