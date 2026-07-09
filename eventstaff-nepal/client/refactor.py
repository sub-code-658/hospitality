import os
import re
import shutil

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

# 1. Rename api to services
api_dir = os.path.join(BASE_DIR, 'api')
services_dir = os.path.join(BASE_DIR, 'services')
if os.path.exists(api_dir):
    os.rename(api_dir, services_dir)
    print("Renamed api to services")

# update imports in all files
for root, _, files in os.walk(BASE_DIR):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            replace_in_file(filepath, r"from\s+['\"](.*?)api/(.*?)['\"]", r"from '\1services/\2'")

# 2. Rewrite AnalyticsCharts.jsx
analytics_charts_code = """
// Replaced recharts with native HTML/CSS (Ponytail philosophy)
import React from 'react';

const COLORS = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#8b5cf6'];

export function StatsBarChart({ data, title }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex h-48 items-end gap-2 mt-4">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
            <div 
              className="w-full bg-indigo-500 rounded-t-sm transition-all duration-300 hover:bg-indigo-400"
              style={{ height: `${(item.value / max) * 100}%` }}
              title={`${item.name}: ${item.value}`}
            ></div>
            <span className="text-xs text-gray-400 truncate w-full text-center">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ApplicationsPieChart({ data, title }) {
  // Simplified to a list of stats instead of complex SVG pie for minimalism
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
              <span>{item.name}</span>
            </div>
            <span className="font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EventTrendChart({ data, title }) {
  // Simplified line chart using bar representation to avoid SVG paths bloat
  const maxEvents = Math.max(...data.map(d => d.events), 1);
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex flex-col gap-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-16">{item.month}</div>
            <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
               <div className="bg-indigo-500 h-full" style={{ width: `${(item.events / maxEvents) * 100}%` }}></div>
            </div>
            <div className="w-8 text-right">{item.events}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RevenueChart({ data, title }) {
  const maxRev = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex h-48 items-end gap-2 mt-4">
        {data.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div 
              className="w-full bg-green-500 rounded-t-sm"
              style={{ height: `${(item.revenue / maxRev) * 100}%` }}
              title={`NPR ${item.revenue}`}
            ></div>
            <span className="text-xs text-gray-400">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RatingDistributionChart({ data, title }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="glass-card p-6 rounded-xl">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-12 text-right">{item.stars} ⭐</div>
            <div className="flex-1 bg-gray-700 h-4 rounded overflow-hidden">
               <div className="bg-yellow-500 h-full" style={{ width: `${(item.count / maxCount) * 100}%` }}></div>
            </div>
            <div className="w-8">{item.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
"""
analytics_file = os.path.join(BASE_DIR, 'components', 'AnalyticsCharts.jsx')
if os.path.exists(analytics_file):
    with open(analytics_file, 'w') as f:
        f.write(analytics_charts_code)
    print("Replaced AnalyticsCharts.jsx")

# 3. Rewrite MapPicker.jsx
map_picker_code = """
// Replaced react-leaflet with native inputs (Ponytail philosophy)
import React from 'react';
import { Input } from './ui/Input';

export default function MapPicker({ location, setLocation }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Update location with simple text inputs instead of map coordinates
    setLocation(prev => ({ ...prev, [name]: value, address: `${prev.city || ''} ${prev.street || ''}`.trim() }));
  };

  return (
    <div className="space-y-4">
      <Input
        label="City"
        name="city"
        value={location.city || ''}
        onChange={handleChange}
        placeholder="Enter city"
      />
      <Input
        label="Street / Landmark"
        name="street"
        value={location.street || ''}
        onChange={handleChange}
        placeholder="Enter street or landmark"
      />
      <p className="text-sm text-gray-400">Map functionality has been simplified to text inputs for minimalism.</p>
    </div>
  );
}
"""
map_picker_file = os.path.join(BASE_DIR, 'components', 'common', 'MapPicker.jsx')
if os.path.exists(map_picker_file):
    with open(map_picker_file, 'w') as f:
        f.write(map_picker_code)
    print("Replaced MapPicker.jsx")

# 4. Remove leaflet imports from pages
pages_to_fix = ['EditEventPage.jsx', 'EventDetailPage.jsx', 'PostEventPage.jsx']
for page in pages_to_fix:
    filepath = os.path.join(BASE_DIR, 'pages', page)
    if os.path.exists(filepath):
        # Remove react-leaflet and leaflet imports
        replace_in_file(filepath, r"import\s+\{\s*MapContainer.*?\}\s*from\s*'react-leaflet';\n", "")
        replace_in_file(filepath, r"import\s+L\s+from\s+'leaflet';\n", "")
        replace_in_file(filepath, r"import\s+'leaflet/dist/leaflet.css';\n", "")
        # Remove leaflet icon setup
        replace_in_file(filepath, r"delete L\.Icon\.Default\.prototype\._getIconUrl;\nL\.Icon\.Default\.mergeOptions\(\{[\s\S]*?\}\);\n", "")
        
        # Replace map render block in EventDetailPage.jsx
        if page == 'EventDetailPage.jsx':
            map_render_regex = r"<div className=\"h-\[300px\] rounded-xl overflow-hidden glass-card border border-\[color:var\(--border-color\)\] relative z-0\">\s*<MapContainer[\s\S]*?</MapContainer>\s*</div>"
            replacement = r"""<div className="p-4 rounded-xl glass-card border border-[color:var(--border-color)]">
              <p className="text-gray-400">Location: {event.location?.address || 'Address not provided'}</p>
              <p className="text-sm mt-2 text-indigo-400">Map view simplified.</p>
            </div>"""
            replace_in_file(filepath, map_render_regex, replacement)

# 5. Create features directory structure for components and move them
# Instead of moving to src/features, we can just ensure components, pages, hooks, services, utils are clean.
# The user said: "Folder-by-Functionality: Grouping files by feature (e.g., features/auth/, features/events/) is highly regarded"
# So let's create src/features/ and move specific feature components into it.

features_dir = os.path.join(BASE_DIR, 'features')
os.makedirs(features_dir, exist_ok=True)
os.makedirs(os.path.join(features_dir, 'auth', 'components'), exist_ok=True)
os.makedirs(os.path.join(features_dir, 'events', 'components'), exist_ok=True)
os.makedirs(os.path.join(features_dir, 'applications', 'components'), exist_ok=True)
os.makedirs(os.path.join(features_dir, 'chat', 'components'), exist_ok=True)

def move_and_update(src, dest):
    if os.path.exists(src):
        shutil.move(src, dest)
        print(f"Moved {src} to {dest}")

# Auth feature
# Move AuthContext inside features/auth? User said "hooks/, services/" - let's keep it simple. We'll just group features.
# But "Organize the src/ directory into: components/, pages/, hooks/, services/, and utils/" is rule 1.
# Let's strictly use rule 1 for top level, and inside `components/` and `pages/` we use feature folders!
# e.g. components/auth, components/events. This satisfies both rules without contradicting rule 1 top-level constraints.

components_dir = os.path.join(BASE_DIR, 'components')
os.makedirs(os.path.join(components_dir, 'auth'), exist_ok=True)
os.makedirs(os.path.join(components_dir, 'events'), exist_ok=True)
os.makedirs(os.path.join(components_dir, 'applications'), exist_ok=True)
# chat is already in components/chat

# Move files to feature folders within components
move_and_update(os.path.join(components_dir, 'EventCard.jsx'), os.path.join(components_dir, 'events', 'EventCard.jsx'))
move_and_update(os.path.join(components_dir, 'ApplicationCard.jsx'), os.path.join(components_dir, 'applications', 'ApplicationCard.jsx'))
# applications list already in components/applications
# events list already in components/events

print("Done restructuring")
