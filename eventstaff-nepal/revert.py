import os
import re
import json

en_json_path = 'client/src/locales/en.json'

with open(en_json_path) as f:
    en_data = json.load(f)

common = en_data.get('common', {})

def revert_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    def repl_text(m):
        key = m.group(1)
        if key in common:
            return ">" + common[key] + "<"
        return m.group(0)
    
    content = re.sub(r'>\{t\(\'common\.([a-z0-9_]+)\'\)\}<', repl_text, content)
    
    # Wait, the regex `>([^<>{]+?)<` matched `>= start && now <=` in HomePage.jsx line 58:
    # `if (now >{t('common.start____now')}<= end)`
    # This was `if (now >= start && now <= end)`
    # So `common.start____now` maps to `= start && now `.
    
    def repl_placeholder(m):
        key = m.group(1)
        if key in common:
            return 'placeholder="' + common[key] + '"'
        return m.group(0)

    content = re.sub(r'placeholder=\{t\(\'common\.([a-z0-9_]+)\'\)\}', repl_placeholder, content)

    # Also remove `import { useTranslation } from 'react-i18next';` if it was added.
    # Actually, let's just leave imports, they are harmless if unused (just warnings).
    
    # Also remove `const { t } = useTranslation();` ? No, just leave it.

    # Wait, what if it replaced inside JS code, e.g. `now >{t('common.start____now')}<= end`
    # Let's fix that specifically.
    content = content.replace(">{t('common.start____now')}<", ">= start && now <")
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)

for root, _, files in os.walk('client/src/pages'):
    for file in files:
        if file.endswith('.jsx'):
            revert_file(os.path.join(root, file))

for root, _, files in os.walk('client/src/components'):
    for file in files:
        if file.endswith('.jsx'):
            revert_file(os.path.join(root, file))

