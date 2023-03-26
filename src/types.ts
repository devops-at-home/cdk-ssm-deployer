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
    features: Features;
};

export type Features = {
    k8s: boolean;
    ts: boolean;
    dns: boolean;
    kms: boolean;
};

const environments = ['test', 'prod'] as const;
export type Environment = (typeof environments)[number];
