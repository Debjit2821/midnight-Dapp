// Midnight Network Configuration for Preprod and Local Environments

export interface MidnightNetworkConfig {
    networkId: 'preprod' | 'preview' | 'undeployed';
    indexerUri: string;
    indexerWsUri: string;
    nodeUri: string;
    proofServerUri: string;
    contractAddress: string;
}

export const MIDNIGHT_CONFIG: MidnightNetworkConfig = {
    networkId: 'preprod',
    indexerUri: (import.meta as any).env?.VITE_MIDNIGHT_INDEXER_URI || 'https://indexer.preprod.midnight.network/api/v1/graphql',
    indexerWsUri: (import.meta as any).env?.VITE_MIDNIGHT_INDEXER_WS_URI || 'wss://indexer.preprod.midnight.network/api/v1/graphql/ws',
    nodeUri: (import.meta as any).env?.VITE_MIDNIGHT_NODE_URI || 'https://rpc.preprod.midnight.network',
    proofServerUri: (import.meta as any).env?.VITE_MIDNIGHT_PROOF_SERVER_URI || 'http://localhost:6300',
    contractAddress: (import.meta as any).env?.VITE_MIDNIGHT_CONTRACT_ADDRESS || '02005a68766f74655f70726570726f645f736861646f77766f74655f636f6e7472616374'
};

export const INITIAL_ELECTION_DATA = {
    id: 'election_student_council_2026',
    title: 'Student Council Election 2026',
    description: 'Annual election for the university Student Council Executive Board. Anonymous voting with on-chain zero-knowledge proofs and publicly verifiable results.',
    status: 'ACTIVE' as const,
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
    admin: '0200a89f9211c4710db4491c3d6e53a921d01918fa90562e811c75b0bc74900a'
};
