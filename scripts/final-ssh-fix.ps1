# COMPLETE GITHUB SSH FIX (Run this as your final step)
$HOME_SSH = "$HOME\.ssh"

# 1. Regenerate Keys (Guaranteed NO Passphrase)
Write-Host "--- Regenerating Keys ---" -ForegroundColor Cyan
ssh-keygen -t ed25519 -C "personal@example.com" -f "$HOME_SSH\id_ed25519_personal" -N '""' -q
ssh-keygen -t ed25519 -C "work@example.com" -f "$HOME_SSH\id_ed25519_work" -N '""' -q

# 2. Add to Clipboard and prompt for browser action
Write-Host "`nStep A: Account 1" -ForegroundColor Yellow
Get-Content "$HOME_SSH\id_ed25519_personal.pub" | Set-Clipboard
Write-Host "-> Account 1 Public Key is in your CLIPBOARD." -ForegroundColor Green
Write-Host "-> Go to Account 1 Settings > SSH Keys, delete old keys, and PASTE this one."
Read-Host "Press [ENTER] after you added Account 1 Key to GitHub..."

Write-Host "`nStep B: Account 2" -ForegroundColor Yellow
Get-Content "$HOME_SSH\id_ed25519_work.pub" | Set-Clipboard
Write-Host "-> Account 2 Public Key is in your CLIPBOARD." -ForegroundColor Green
Write-Host "-> Go to Account 2 Settings > SSH Keys, delete old keys, and PASTE this one."
Read-Host "Press [ENTER] after you added Account 2 Key to GitHub..."

Write-Host "`nStep C: Testing" -ForegroundColor Yellow
ssh -T git@github.com-acc1
ssh -T git@github.com-acc2

Write-Host "`nSetup Complete!" -ForegroundColor Cyan
