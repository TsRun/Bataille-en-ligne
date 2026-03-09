# Ralph - AFK loop script for Windows
# Usage: .\afk-ralph.ps1 -iterations 20

param(
    [Parameter(Mandatory=$true)]
    [int]$iterations
)

$ErrorActionPreference = "Stop"

for ($i = 1; $i -le $iterations; $i++) {
    Write-Host "=== Ralph iteration $i of $iterations ===" -ForegroundColor Cyan

    $result = claude --dangerously-skip-permissions -p "@PRD.md @progress.txt  `
    1. Find the highest-priority task and implement it. `
    2. Run your tests and type checks. `
    3. Update the PRD with what was done. `
    4. Append your progress to progress.txt. `
    5. Commit your changes. `
    ONLY WORK ON A SINGLE TASK. `
    If the PRD is complete, output <promise>COMPLETE</promise>."

    Write-Host $result

    if ($result -match "<promise>COMPLETE</promise>") {
        Write-Host "PRD complete after $i iterations." -ForegroundColor Green
        exit 0
    }
}

Write-Host "Completed $iterations iterations." -ForegroundColor Yellow
