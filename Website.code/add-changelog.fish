#!/usr/bin/env fish
# AI Agent: Check AI_AGENT_GUIDE.md for project instructions including changelog requirements

# Simple changelog helper script
# Usage: ./add-changelog.fish "Your update message"

if test (count $argv) -eq 0
    echo "Usage: ./add-changelog.fish \"Your update message\""
    echo "Or for multi-line with title:"
    echo "./add-changelog.fish \"Title\" \"Item 1\" \"Item 2\" ..."
    exit 1
end

set today (date +"%d/%m/%y")

# Build the entry
if test (count $argv) -eq 1
    # Single item
    set entry "    {\n      date: '$today',\n      items: [\n        '$argv[1]'\n      ]\n    },"
else
    # Multiple items (first is title)
    set title $argv[1]
    set entry "    {\n      date: '$today',\n      title: '$title',\n      items: [\n"
    
    for i in (seq 2 (count $argv))
        if test $i -eq (count $argv)
            set entry "$entry        '$argv[$i]'\n"
        else
            set entry "$entry        '$argv[$i]',\n"
        end
    end
    
    set entry "$entry      ]\n    },"
end

# Find the Updates.jsx file
set file "src/pages/Updates.jsx"

# Read the file and insert the new entry
set content (cat $file)
set before (echo $content | sed -n '1,/const updates = \[/p')
set after (echo $content | sed -n '/const updates = \[/,$p' | tail -n +2)

# Write back
echo -e "$before\n$entry" > $file
echo "$after" >> $file

echo "✓ Added changelog entry for $today"
echo "Don't forget to git add and commit!"
