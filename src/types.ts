import { OidcConfig } from './stacks/oidc.stack';

export type AppFactoryProps = {
    instances: DestinationInstance[];
    oidcConfig?: OidcConfig;
    environment: Environment;
    account: string;
    region: string;
};

export type DestinationInstance = {
    name: string;
    test: boolean;
    prod: boolean;
};

const environments = ['test', 'prod'] as const;
export type Environment = typeof environments[number];
