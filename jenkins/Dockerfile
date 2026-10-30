FROM jenkins/jenkins:lts

USER root

# Install Node.js, npm, Docker Compose, Git, and Docker CLI
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        nodejs \
        npm \
        git \
        docker-compose \
        curl \
        ca-certificates && \
    curl -fsSL https://download.docker.com/linux/static/stable/x86_64/docker-27.3.1.tgz | tar -xzC /usr/local/bin --strip-components=1 docker/docker && \
    rm -rf /var/lib/apt/lists/*

# Pre-install Jenkins Pipeline and Git plugins
RUN jenkins-plugin-cli --plugins "workflow-aggregator git"

# Set Jenkins to run as root for local demo to access Docker socket without permission issues
USER root
