export interface RepoNode {
  id: string;
  label: string;
  description: string;
  url: string;
  category: 'core' | 'behavior' | 'infra' | 'content' | 'frontend';
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
    description: 'Core coordination engine, ECS world, agent lifecycle',
    url: 'https://github.com/Unstable-Kernel/kernel',
    category: 'core',
  },
  {
    id: 'sim',
    label: 'sim',
    description: 'Simulation runtime: spatial hash, movement, environment',
    url: 'https://github.com/Unstable-Kernel/sim',
    category: 'infra',
  },
  {
    id: 'signal',
    label: 'signal',
    description: 'Pheromone grid: diffusion, evaporation, chemotaxis',
    url: 'https://github.com/Unstable-Kernel/signal',
    category: 'infra',
  },
  {
    id: 'swarm',
    label: 'swarm',
    description: 'Collective behaviors: boids, predator-prey, flocking',
    url: 'https://github.com/Unstable-Kernel/swarm',
    category: 'behavior',
  },
  {
    id: 'mycelium',
    label: 'mycelium',
    description: 'Adaptive graph network, Hebbian signal propagation',
    url: 'https://github.com/Unstable-Kernel/mycelium',
    category: 'behavior',
  },
  {
    id: 'experiments',
    label: 'experiments',
    description: 'TOML experiment configurations',
    url: 'https://github.com/Unstable-Kernel/experiments',
    category: 'content',
  },
  {
    id: 'research',
    label: 'research',
    description: 'Theory, math foundations, biological inspirations',
    url: 'https://github.com/Unstable-Kernel/research',
    category: 'content',
  },
  {
    id: 'docs',
    label: 'docs',
    description: 'Public Astro Starlight documentation site',
    url: 'https://github.com/Unstable-Kernel/docs',
    category: 'content',
  },
  {
    id: 'visualization',
    label: 'visualization',
    description: 'Three.js browser visualization layer',
    url: 'https://github.com/Unstable-Kernel/visualization',
    category: 'frontend',
  },
  {
    id: 'org-graph',
    label: 'org-graph',
    description: 'This interactive org structure visualization',
    url: 'https://github.com/Unstable-Kernel/org-graph',
    category: 'frontend',
  },
];

export const links: RepoLink[] = [
  { source: 'kernel', target: 'sim', label: 'depends on', type: 'depends' },
  { source: 'kernel', target: 'signal', label: 'depends on', type: 'depends' },
  { source: 'kernel', target: 'swarm', label: 'depends on', type: 'depends' },
  { source: 'kernel', target: 'mycelium', label: 'depends on', type: 'depends' },
  { source: 'swarm', target: 'sim', label: 'depends on', type: 'depends' },
  { source: 'swarm', target: 'signal', label: 'depends on', type: 'depends' },
  { source: 'signal', target: 'sim', label: 'depends on', type: 'depends' },
  { source: 'visualization', target: 'kernel', label: 'renders', type: 'uses' },
  { source: 'experiments', target: 'kernel', label: 'configures', type: 'uses' },
  { source: 'docs', target: 'research', label: 'references', type: 'documents' },
];
