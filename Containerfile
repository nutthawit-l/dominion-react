FROM registry.opensuse.org/opensuse/tumbleweed:20260315

# Install Node.js 24 and essential tools
RUN zypper --non-interactive install --no-recommends \
    nodejs24 \
    npm24 \
    git \
    curl \
    awk \
    && zypper clean --all

# Install pnpm globally using npm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY dominion/package.json dominion/pnpm-lock.yaml* ./

# Install dependencies
# Note: If you have a workspace, you might need to adjust this
RUN pnpm install

# Copy the rest of the application
COPY dominion/ .

# Expose the Next.js port
EXPOSE 3000

# Run the development server
CMD ["pnpm", "dev"]
