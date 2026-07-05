import os
import re
import json

en_file = 'client/src/locales/en.json'
ne_file = 'client/src/locales/ne.json'

with open(en_file, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

with open(ne_file, 'r', encoding='utf-8') as f:
    ne_data = json.load(f)

en_common = en_data.setdefault('common', {})
ne_common = ne_data.setdefault('common', {})

# Regex to find t('common.key', 'fallback') or t("common.key")
pattern = re.compile(r"t\(\s*['\"]common\.([^'\"]+)['\"]\s*(?:,\s*['\"]([^'\"]+)['\"])?\s*\)")

added_count = 0

for root, _, files in os.walk('client/src'):
    for file in files:
        if file.endswith(('.js', '.jsx')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            matches = pattern.findall(content)
            for key, fallback in matches:
                # Add to EN if missing
                if key not in en_common:
                    en_common[key] = fallback if fallback else key.replace('_', ' ').title()
                    added_count += 1
                
                # Add to NE if missing
                if key not in ne_common:
                    ne_common[key] = (fallback if fallback else key.replace('_', ' ').title()) + " (NE)"
                    added_count += 1

with open(en_file, 'w', encoding='utf-8') as f:
    json.dump(en_data, f, indent=2, ensure_ascii=False)

with open(ne_file, 'w', encoding='utf-8') as f:
    json.dump(ne_data, f, indent=2, ensure_ascii=False)

print(f"Updated locales. Added {added_count} new entries.")
