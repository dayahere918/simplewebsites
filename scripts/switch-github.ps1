# Simple GitHub Account Switcher (Multi-Personal Version)
# Usage: ./scripts/switch-github.ps1

$Profiles = @(
    @{
        Name     = "Account 1"
        GitName  = "Your Name"
        Email    = "acc1-email@example.com"
        SSHHost  = "github.com-acc1" 
    },
    @{
        Name     = "Account 2"
        GitName  = "Your Name"
        Email    = "acc2-email@example.com"
        SSHHost  = "github.com-acc2"
    }
)

Write-Host "--- GitHub Account Switcher ---" -ForegroundColor Cyan
for ($i = 0; $i -lt $Profiles.Count; $i++) {
    Write-Host ("[{0}] {1} ({2})" -f ($i + 1), $Profiles[$i].Name, $Profiles[$i].Email)
}

$choice = Read-Host "Choose profile (1-$($Profiles.Count))"
$index = [int]$choice - 1

if ($index -ge 0 -and $index -lt $Profiles.Count) {
    $p = $Profiles[$index]
    
    # Configure Local Git Identity
    git config user.name "$($p.GitName)"
    git config user.email "$($p.Email)"
    
    # Configure SSH Remote URL to use the alias
    $remote = git remote get-url origin
    if ($remote -match "github.com") {
        # Convert URLs to use the specific SSH alias
        $newRemote = $remote -replace "https://github.com/", "git@$($p.SSHHost):"
        $newRemote = $newRemote -replace "git@github.com[:/]", "git@$($p.SSHHost):"
        git remote set-url origin $newRemote
        Write-Host "Remote URL updated to SSH Alias: $($p.SSHHost)" -ForegroundColor Yellow
    }

    Write-Host "`nSuccessfully switched to: $($p.Name)" -ForegroundColor Green
}
