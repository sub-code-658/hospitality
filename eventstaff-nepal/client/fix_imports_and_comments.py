import os
import re

BASE_DIR = '/Users/ioxy/Desktop/Hospitality/eventstaff-nepal/client/src'

def replace_in_file(filepath, pattern, replacement, flags=0):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        content = f.read()
    new_content = re.sub(pattern, replacement, content, flags=flags)
    if content != new_content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

# Update imports
pages = ['EventsPage.jsx', 'WorkerDashboard.jsx', 'EventDetailPage.jsx', 'OrganizerDashboard.jsx']
for page in pages:
    filepath = os.path.join(BASE_DIR, 'pages', page)
    replace_in_file(filepath, r"from\s+'\.\./components/EventCard'", "from '../components/events/EventCard'")
    replace_in_file(filepath, r"from\s+'\.\./components/ApplicationCard'", "from '../components/applications/ApplicationCard'")

# Add meaningful comments for the WHY in some key files
# WorkerDashboard.jsx
worker_dashboard_path = os.path.join(BASE_DIR, 'pages', 'WorkerDashboard.jsx')
replace_in_file(worker_dashboard_path, r"(export default function WorkerDashboard\(\) \{)", r"/**\n * WorkerDashboard:\n * Renders the main dashboard for a worker.\n * Uses custom hooks for data fetching to isolate UI from data logic, ensuring scalability.\n */\n\1")

# EventCard.jsx
event_card_path = os.path.join(BASE_DIR, 'components', 'events', 'EventCard.jsx')
replace_in_file(event_card_path, r"(export default function EventCard.*?\{)", r"/**\n * EventCard Component:\n * Displays a summary of an event. Extracted into a separate reusable component\n * to avoid code duplication across listings and dashboard views.\n */\n\1")

# useFetch.js
use_fetch_path = os.path.join(BASE_DIR, 'hooks', 'useFetch.js')
replace_in_file(use_fetch_path, r"(export default function useFetch.*?\{)", r"/**\n * useFetch Hook:\n * Abstracted standard fetch logic into a custom hook to avoid repeating\n * loading, error, and data states in every component.\n */\n\1")

print("Fixed imports and added comments.")
