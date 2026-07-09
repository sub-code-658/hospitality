import os

def create_project_dump(root_dir, output_file):
    ignore_dirs = {'.git', 'node_modules', '__pycache__', '.pytest_cache', '.claude', '.agents'}
    ignore_exts = {'.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.pyc', '.DS_Store', '.log'}
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        outfile.write(f"Project Dump for: {os.path.basename(root_dir)}\n")
        outfile.write("="*50 + "\n\n")
        
        # Write directory structure
        outfile.write("Directory Structure:\n")
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            level = root.replace(root_dir, '').count(os.sep)
            indent = ' ' * 4 * (level)
            outfile.write(f"{indent}{os.path.basename(root)}/\n")
            subindent = ' ' * 4 * (level + 1)
            for f in files:
                if any(f.endswith(ext) for ext in ignore_exts) or f == os.path.basename(output_file):
                    continue
                outfile.write(f"{subindent}{f}\n")
        
        outfile.write("\n" + "="*50 + "\n\n")
        
        # Write file contents
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            for file in files:
                if any(file.endswith(ext) for ext in ignore_exts) or file == os.path.basename(output_file):
                    continue
                
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, root_dir)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    outfile.write(f"--- File: {rel_path} ---\n")
                    outfile.write("```\n")
                    outfile.write(content)
                    if not content.endswith('\n'):
                        outfile.write('\n')
                    outfile.write("```\n\n")
                except Exception as e:
                    outfile.write(f"--- File: {rel_path} ---\n")
                    outfile.write(f"Could not read file: {e}\n\n")

if __name__ == '__main__':
    create_project_dump('/Users/ioxy/Desktop/Hospitality', '/Users/ioxy/Desktop/Hospitality/Project_Details.txt')
