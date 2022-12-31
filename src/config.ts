import { OidcConfig } from './stacks/oidc.stack';
import { AppFactoryProps, DestinationInstance, Environment } from './types';

const oidcConfig: OidcConfig = {
    owner: 'devops-at-home',
    repo: 'cdk-ssm-deployer',
    filter: 'ref:refs/tags/v*',
    lookup: true,
};

const instances: DestinationInstance[] = [
    {
        name: 'h6060-003',
        test: true,
        prod: true,
    },
];

const account = '075487384540';
const region = 'ap-southeast-2';

export const config = (): AppFactoryProps[] => {
    return [
        // test
        {
            instances: getInstances(instances, 'test'),
            account,
            region,
            environment: 'test',
        },
        // prod
        {
            oidcConfig,
            instances: getInstances(instances, 'prod'),
            account,
            region,
            environment: 'prod',
        },
    ];
};

const getInstances = (
    instances: DestinationInstance[],
    environment: Environment
): DestinationInstance[] => {
    if (environment === 'prod') {
        return instances.filter(({ prod }) => prod === true);
    }
    return instances
        .filter(({ test }) => test === true)
        .map(({ name, prod, test }) => {
            return { name: `${name}-test`, prod, test };
        });
};
