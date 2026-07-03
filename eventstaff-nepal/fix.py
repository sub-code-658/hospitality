import os
import re

for root, _, files in os.walk('client/src'):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            original = content
            content = re.sub(r"</svg>\{t\('common\.'\)\}<svg", r"""</svg>
                  ) : (
                    <svg""", content)
            if content != original:
                with open(filepath, 'w') as f:
                    f.write(content)
