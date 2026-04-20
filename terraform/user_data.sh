#!/bin/bash
set -e

# ── Update system ──────────────────────────────────────────────────────────────
apt-get update -y
apt-get upgrade -y

# ── Install Docker ─────────────────────────────────────────────────────────────
apt-get install -y ca-certificates curl gnupg lsb-release

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# ── Start Docker ───────────────────────────────────────────────────────────────
systemctl start docker
systemctl enable docker
usermod -aG docker ubuntu

# ── Install Docker Compose standalone ─────────────────────────────────────────
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# ── Done ───────────────────────────────────────────────────────────────────────
echo "Bootstrap complete. Docker version: $(docker --version)"
