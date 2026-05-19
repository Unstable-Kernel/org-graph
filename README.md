# org-graph

Interactive visualization of the Unstable Kernel organization structure and repository dependencies.

## Live

Deployed at: `https://unstable-kernel.github.io/org-graph/`

## Architecture

```mermaid
graph TD
    subgraph "Core Engine"
        kernel[kernel<br/>coordination engine]
    end

    subgraph "Infrastructure"
        sim[sim<br/>spatial hash, movement]
        signal[signal<br/>pheromone, diffusion]
    end

    subgraph "Behaviors"
        swarm[swarm<br/>boids, predator-prey]
        mycelium[mycelium<br/>adaptive graph network]
    end

    subgraph "Frontend"
        visualization[visualization<br/>Three.js renderer]
        org-graph[org-graph<br/>this repo]
    end

    subgraph "Content"
        experiments[experiments<br/>TOML configs]
        research[research<br/>theory, math]
        docs[docs<br/>Astro site]
    end

    kernel --> sim
    kernel --> signal
    kernel --> swarm
    kernel --> mycelium
    swarm --> sim
    swarm --> signal
    signal --> sim
    visualization --> kernel
    experiments --> kernel
    docs --> research
```

## Features

- D3 force-directed graph layout
- Draggable nodes
- Color-coded by category (core, behavior, infra, content, frontend)
- Hover tooltips with repo descriptions
- Click to open repo on GitHub
- Edge labels showing relationship type

## Setup

```bash
npm install
npm run dev
```

## Tech Stack

- React 18
- D3.js 7 (force simulation)
- TypeScript
- Vite

## License

MIT
