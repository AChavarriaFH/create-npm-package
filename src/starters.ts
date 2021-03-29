export interface Starter {
  name: string;
  repo: string;
  description?: string;
  docs?: string;
  hidden?: boolean;
}

export const STARTERS: Starter[] = [
  {
    name: 'library',
    repo: 'amurilloFH/npm-package-template',
    description: 'Create a new library-package for Sunrun CBA',
    docs: 'https://github.com/amurilloFH/npm-package-template',
  }
];

export function getStarterRepo(starterName: string): Starter {
  if (starterName.includes('/')) {
    return {
      name: starterName,
      repo: starterName,
    };
  }
  const repo = STARTERS.find(starter => starter.name === starterName);
  if (!repo) {
    throw new Error(`Starter "${starterName}" does not exist.`);
  }
  return repo;
}
