# Setup Simultaneous pushing to both personal GitHub accounts
# Usage: ./scripts/setup-multi-push.ps1

$remote = git remote get-url origin
# Extract just the repository name (e.g., 'simplewebsites')
if ($remote -match "/([^/]+)$") {
    $repoName = $Matches[1]
    if ($repoName -match "\.git$") { $repoName = $repoName -replace "\.git$", "" }
    
    Write-Host "Configuring remotes for repo: $repoName" -ForegroundColor Cyan
    
    git remote remove all 2>$null
    
    # Add 'all' remote. Fetching is not really used for 'all' but we'll point to acc1
    git remote add all "git@github.com-acc1:dayashimoga/$repoName.git"
    
    # Add push URLs with CORRECT namespaces for each account
    # Account 1 (dayashimoga)
    git remote set-url --add --push all "git@github.com-acc1:dayashimoga/$repoName.git"
    # Account 2 (dayahere918)
    git remote set-url --add --push all "git@github.com-acc2:dayahere918/$repoName.git"
    
    Write-Host "`nSuccessfully configured 'all' remote!" -ForegroundColor Green
    Write-Host "Account 1: dayashimoga/$repoName" -ForegroundColor White
    Write-Host "Account 2: dayahere918/$repoName" -ForegroundColor White
    Write-Host "`nYou can now push to both simultaneously:" -ForegroundColor Cyan
    Write-Host "  git push all main`n" -ForegroundColor White
} else {
    Write-Host "Error: Could not determine repo name from origin." -ForegroundColor Red
}
