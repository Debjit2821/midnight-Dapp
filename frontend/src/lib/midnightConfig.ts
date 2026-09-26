// Midnight Network Configuration for Preprod and Local Environments

export interface MidnightNetworkConfig {
    networkId: 'preprod' | 'preview' | 'undeployed';
    indexerUri: string;
    indexerWsUri: string;
    nodeUri: string;
    proofServerUri: string;
    contractAddress: string;
    explorerAccountUrl: (address: string) => string;
    explorerTxUrl: (txId: string) => string;
}

export const MIDNIGHT_CONFIG: MidnightNetworkConfig = {
    networkId: 'preprod',
    indexerUri: (import.meta as any).env?.VITE_MIDNIGHT_INDEXER_URI || 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWsUri: (import.meta as any).env?.VITE_MIDNIGHT_INDEXER_WS_URI || 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    nodeUri: (import.meta as any).env?.VITE_MIDNIGHT_NODE_URI || 'https://rpc.preprod.midnight.network',
    proofServerUri: (import.meta as any).env?.VITE_MIDNIGHT_PROOF_SERVER_URI || 'http://localhost:6300',
    contractAddress: (import.meta as any).env?.VITE_MIDNIGHT_CONTRACT_ADDRESS || '0200e88774f5a0c13a94a75cc1e8a063d9b4caac283a4d2dabdb5e94543ea9ae7963',
    explorerAccountUrl: (address: string) => `https://explorer.1am.xyz/?network=preprod`,
    explorerTxUrl: (txId: string) => `https://explorer.1am.xyz/?network=preprod`
};

export const INITIAL_ELECTION_DATA = {
    id: 'election_student_council_2026',
    title: 'Student Council Election 2026',
    description: 'Annual election for the university Student Council Executive Board. Anonymous voting with on-chain zero-knowledge proofs and publicly verifiable results.',
    status: 'ACTIVE' as const,
    contractAddress: '0200e88774f5a0c13a94a75cc1e8a063d9b4caac283a4d2dabdb5e94543ea9ae7963',
    candidates: [
        {
            id: 0,
            name: 'Candidate A — Elena Vance',
            description: 'Platform: Open Governance, Campus Innovation Fund, Sustainability.',
            party: 'Tech & Innovation Coalition'
        },
        {
            id: 1,
            name: 'Candidate B — Marcus Sterling',
            description: 'Platform: Student Welfare, Extended Library Hours, Sports Facilities.',
            party: 'Student Unity Alliance'
        },
        {
            id: 2,
            name: 'Candidate C — Aisha Patel',
            description: 'Platform: Transparent Budgeting, Mental Health Initiatives, Career Mentorship.',
            party: 'Progressive Reform Collective'
        }
    ],
    initialVotes: {
        0: 42,
        1: 37,
        2: 21
    },
    admin: '02008ccdc19c4a26f42fed3fc6f14f48ef5eea63dc2de9213cf60d50448783ba7f40'
};
