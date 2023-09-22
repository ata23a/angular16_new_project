export interface Environment {
    production: boolean;
    apiUrl: string;
    apiPascoma: string
}

export const environment: Environment = {
    production: true,
    apiUrl: 'https://api.capsule.mg/grv',
    apiPascoma: 'https://api.capsule.mg/pascoma'
};
