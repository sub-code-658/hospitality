import re
import sys

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # text-white (not followed by /)
    content = re.sub(r'text-white(?![/\w])', 'text-[color:var(--text)]', content)
    # text-white/60
    content = re.sub(r'text-white/60(?!\w)', 'text-[color:var(--text-muted)]', content)
    # text-white/50
    content = re.sub(r'text-white/50(?!\w)', 'text-[color:var(--text-dim)]', content)
    # text-white/40
    content = re.sub(r'text-white/40(?!\w)', 'text-[color:var(--text-dim)]', content)
    # text-white/70
    content = re.sub(r'text-white/70(?!\w)', 'text-[color:var(--text-muted)]', content)
    # text-white/80
    content = re.sub(r'text-white/80(?!\w)', 'text-[color:var(--text)]', content)
    
    # border-white/10
    content = re.sub(r'border-white/10(?!\w)', 'border-[color:var(--border)]', content)
    # border-white/20
    content = re.sub(r'border-white/20(?!\w)', 'border-[color:var(--border-hover)]', content)
    
    # bg-white/10
    content = re.sub(r'bg-white/10(?!\w)', 'bg-[color:var(--surface-raised)]', content)

    # text-green-300
    content = re.sub(r'text-green-300(?!\w)', 'text-[color:var(--sage)]', content)
    # text-yellow-300
    content = re.sub(r'text-yellow-300(?!\w)', 'text-yellow-600 dark:text-yellow-300', content)

    with open(filepath, 'w') as f:
        f.write(content)

fix_file('client/src/pages/WorkerDashboard.jsx')
fix_file('client/src/components/ApplicationCard.jsx')

print("Fixed theme classes in files.")
