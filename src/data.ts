export interface RepoNode {
  id: string;
  label: string;
  description: string;
  url: string;
  deployedUrl?: string;
  tech: string[];
  category: 'core' | 'behavior' | 'infra' | 'content' | 'frontend';
  status: 'active' | 'stable' | 'wip';
}

export interface RepoLink {
  source: string;
  target: string;
  label: string;
  type: 'depends' | 'uses' | 'documents';
}

export const nodes: RepoNode[] = [
  {
    id: 'kernel',
    label: 'kernel',
    description: 'Core coordination engine. Orchestrates all sub-systems: ECS world, agent lifecycle, WASM compilation, and the main simulation loop.',
    url: 'https://github.com/Unstable-Kernel/kernel',
    tech: ['Rust', 'WASM', 'ECS'],
    category: 'core',
    status: 'active',
  },
  {
    id: 'sim',
    label: 'sim',
    description: 'Simulation runtime providing spatial hashing for O(1) neighbor queries, toroidal movement system, and environment engine with obstacles and food sources.',
    url: 'https://github.com/Unstable-Kernel/sim',
    tech: ['Rust'],
    category: 'infra',
    status: 'stable',
  },
  {
    id: 'signal',
    label: 'signal',
    description: 'Pheromone signaling layer. Multi-layer 2D grid with diffusion (box blur), exponential evaporation, and Physarum-inspired 3-sensor chemotaxis.',
    url: 'https://github.com/Unstable-Kernel/signal',
    tech: ['Rust'],
    category: 'infra',
    status: 'stable',
  },
  {
    id: 'swarm',
    label: 'swarm',
    description: 'Collective behavior algorithms. Reynolds boids (separation, alignment, cohesion) and predator-prey dynamics with kill ring and energy mechanics.',
    url: 'https://github.com/Unstable-Kernel/swarm',
    tech: ['Rust'],
    category: 'behavior',
    status: 'stable',
  },
  {
    id: 'mycelium',
    label: 'mycelium',
    description: 'Adaptive graph-based communication network. Signals propagate along weighted edges with Hebbian learning: active paths strengthen, idle paths decay.',
    url: 'https://github.com/Unstable-Kernel/mycelium',
    tech: ['Rust'],
    category: 'behavior',
    status: 'stable',
  },
  {
    id: 'experiments',
    label: 'experiments',
    description: 'Declarative TOML experiment configs. Define species, behaviors, signals, and environments without writing code.',
    url: 'https://github.com/Unstable-Kernel/experiments',
    tech: ['TOML'],
    category: 'content',
    status: 'stable',
  },
  {
    id: 'research',
    label: 'research',
    description: 'Mathematical foundations with proofs: boids equilibrium, signal diffusion PDE, Lotka-Volterra population dynamics, and biological inspiration docs.',
    url: 'https://github.com/Unstable-Kernel/research',
    tech: ['Markdown', 'LaTeX'],
    category: 'content',
    status: 'active',
  },
  {
    id: 'docs',
    label: 'docs',
    description: 'Public documentation site built with Astro Starlight. Vision, architecture, experiment guides, and theory summaries.',
    url: 'https://github.com/Unstable-Kernel/docs',
    deployedUrl: 'https://unstable-kernel.github.io/docs/',
    tech: ['Astro', 'Starlight'],
    category: 'content',
    status: 'wip',
  },
  {
    id: 'visualization',
    label: 'visualization',
    description: 'Real-time browser visualization. Three.js InstancedMesh for 10k+ agents, DataTexture signal overlays, parameter controls, and metrics dashboard.',
    url: 'https://github.com/Unstable-Kernel/visualization',
    deployedUrl: 'https://unstable-kernel.github.io/visualization/',
    tech: ['TypeScript', 'Three.js', 'Vite'],
    category: 'frontend',
    status: 'active',
  },
  {
    id: 'org-graph',
    label: 'org-graph',
    description: 'This page. Interactive force-directed graph showing how all Unstable Kernel repositories connect.',
    url: 'https://github.com/Unstable-Kernel/org-graph',
    deployedUrl: 'https://unstable-kernel.github.io/org-graph/',
    tech: ['React', 'D3.js'],
    category: 'frontend',
    status: 'stable',
  },
];

export const links: RepoLink[] = [
  { source: 'kernel', target: 'sim', label: 'depends on', type: 'depends' },
  { source: 'kernel', target: 'signal', label: 'depends on', type: 'depends' },
  { source: 'kernel', target: 'swarm', label: 'depends on', type: 'depends' },
  { source: 'kernel', target: 'mycelium', label: 'depends on', type: 'depends' },
  { source: 'swarm', target: 'sim', label: 'uses', type: 'depends' },
  { source: 'swarm', target: 'signal', label: 'uses', type: 'depends' },
  { source: 'signal', target: 'sim', label: 'uses', type: 'depends' },
  { source: 'visualization', target: 'kernel', label: 'renders', type: 'uses' },
  { source: 'experiments', target: 'kernel', label: 'configures', type: 'uses' },
  { source: 'docs', target: 'research', label: 'references', type: 'documents' },
];
