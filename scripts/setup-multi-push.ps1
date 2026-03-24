# Setup Simultaneous pushing to both personal GitHub accounts
# Usage: ./scripts/setup-multi-push.ps1

$remote = git remote get-url origin
if ($remote -match "github.com[:/](.+)$") {
    $repoPath = $Matches[1]
    
    git remote remove all 2>$null
    
    # Add 'all' remote using aliases
    git remote add all "git@github.com-acc1:$repoPath"
    git remote set-url --add --push all "git@github.com-acc1:$repoPath"
    git remote set-url --add --push all "git@github.com-acc2:$repoPath"
    
    Write-Host "`nSuccessfully configured 'all' remote!" -ForegroundColor Green
    Write-Host "You can now push to both accounts simultaneously:" -ForegroundColor Cyan
    Write-Host "  git push all main`n" -ForegroundColor White
} else {
    Write-Host "Error: Could not determine repo path from origin." -ForegroundColor Red
}
