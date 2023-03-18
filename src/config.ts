import { OidcConfig } from './stacks/oidc.stack';
import { AppFactoryProps, DestinationInstance, Environment } from './types';

const oidcConfig: OidcConfig = {
    owner: 'devops-at-home',
    repo: 'cdk-ssm-deployer',
    // filter: 'ref:/refs/head/main', TODO: tighten permissions here
    filter: '*',
    lookup: false,
};

const instances: DestinationInstance[] = [
    {
        name: 'h6060-003',
        test: true,
        prod: true,
        features: {
            k8s: false,
            ts: false,
        },
    },
    {
        name: 'h6020-001',
        test: false,
        prod: true,
        features: {
            k8s: true,
            ts: true,
        },
    },
];

const account = process.env.CDK_DEFAULT_ACCOUNT!;
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
        .map((props) => {
            return { ...props, name: `${props.name}-test` };
        });
};
