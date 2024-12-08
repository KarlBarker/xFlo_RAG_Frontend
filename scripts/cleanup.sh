#!/bin/bash

# Components we want to keep
KEEP_COMPONENTS=(
    "table.tsx"
    "button.tsx"
    "dropdown-menu.tsx"
    "badge.tsx"
    "tooltip.tsx"
    "avatar.tsx"
    "card.tsx"
    "scroll-area.tsx"
    "input.tsx"
    "tabs.tsx"
    "toast.tsx"      # Required for notifications
    "toaster.tsx"    # Required for notifications
    "dialog.tsx"     # Required for FileUploadDialog
)

cd "$(dirname "$0")/../components/ui"

# Create a temporary directory for components we want to keep
mkdir -p temp
for component in "${KEEP_COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        mv "$component" temp/
    fi
done

# Remove all other components
rm -f *.tsx

# Move back the components we want to keep
mv temp/* .
rmdir temp
