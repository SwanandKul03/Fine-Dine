from pathlib import Path
import shutil
root = Path(__file__).resolve().parents[1]
for name in ['index.html', 'handover.css', 'handover.js']:
    shutil.copyfile(root / 'src/service-handover' / name, root / 'service-flows' / name)
print('Updated the service story.')
