import re
import glob

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    
    # 1. ApplicationCard.jsx status badge (line 118)
    content = content.replace(
        'className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[application.status]}`}',
        'className={`flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium border ${statusColors[application.status]}`}'
    )
    
    # 2. ApplicationCard.jsx paid badge (line 156)
    content = content.replace(
        'className="px-3 py-1 bg-green-500/20 text-[color:var(--sage)] border border-green-500/30 text-xs font-semibold uppercase tracking-wider rounded-full flex items-center gap-1.5"',
        'className="flex items-center justify-center whitespace-nowrap px-3 py-1 bg-green-500/20 text-[color:var(--sage)] border border-green-500/30 text-xs font-semibold uppercase tracking-wider rounded-full gap-1.5"'
    )
    
    # 3. ApplicationCard.jsx unpaid badge (line 161)
    content = content.replace(
        'className="text-xs text-yellow-600 dark:text-yellow-300 font-semibold uppercase tracking-wider"',
        'className="flex items-center justify-center whitespace-nowrap px-3 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 border border-yellow-500/30 text-xs font-semibold uppercase tracking-wider rounded-full"'
    )
    
    # 4. WorkerDashboard.jsx applied badge
    content = content.replace(
        'className="bg-[color:var(--surface-raised)] text-[color:var(--text-muted)] px-3 py-1 rounded-full text-sm border border-[color:var(--border-hover)]"',
        'className="flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium bg-[color:var(--surface-raised)] text-[color:var(--text-muted)] border border-[color:var(--border-hover)]"'
    )
    
    # 5. EventCard.jsx status badge
    content = content.replace(
        'className="flex-shrink-0 text-[0.65rem] font-bold uppercase tracking-widest px-2 py-1 rounded"',
        'className="flex items-center justify-center whitespace-nowrap flex-shrink-0 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"'
    )

    # 6. StaffCard.jsx available badge
    content = content.replace(
        'className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20"',
        'className="flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20"'
    )

    # 7. OrganizerDashboard.jsx tag text-xs badges
    content = content.replace(
        'className="tag text-xs self-start"',
        'className="tag text-xs flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 self-start"'
    )
    
    content = content.replace(
        'className="tag text-xs"',
        'className="tag text-xs flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1"'
    )

    content = content.replace(
        'className={`tag text-xs ${event.status === \'active\' ? \'\' : \'\'}`}',
        'className={`tag text-xs flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 ${event.status === \'active\' ? \'\' : \'\'}`}'
    )

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")

for f in glob.glob('client/src/**/*.jsx', recursive=True):
    fix_file(f)
